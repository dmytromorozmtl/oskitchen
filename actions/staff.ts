"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserProfile } from "@/lib/auth";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { resolveStaffActorScope } from "@/lib/staff/resolve-staff-actor-scope";
import { canManageStaff, type StaffCapability } from "@/lib/staff/staff-permissions";
import { logStaffPermissionDenied } from "@/services/staff/staff-permission-audit";
import {
  archiveStaffMember,
  createShift,
  createStaffMember,
  deactivateRole,
  revokeCertification,
  saveAvailability,
  transitionShiftStatus,
  updateStaffMember,
  upsertCertification,
  upsertRole,
} from "@/services/staff/staff-service";
import { auditLog } from "@/services/audit/audit-service";
import type {
  StaffCertificationStatus,
  StaffEmploymentType,
  StaffRoleType,
  StaffShiftStatus,
  StaffStatus,
} from "@prisma/client";

const ROLE_TYPES = [
  "OWNER", "MANAGER", "KITCHEN_LEAD", "PREP_COOK", "LINE_COOK", "PACKER",
  "DRIVER", "CUSTOMER_SERVICE", "CATERING_COORDINATOR", "PURCHASING",
  "INVENTORY", "ACCOUNTING", "MARKETING", "VIEWER", "CUSTOM",
] as const;
const STATUSES = ["ACTIVE", "INVITED", "TRAINING", "PAUSED", "INACTIVE", "ARCHIVED"] as const;
const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY", "SEASONAL", "VOLUNTEER", "CUSTOM"] as const;
const SHIFT_STATUSES = ["SCHEDULED", "CHECKED_IN", "COMPLETED", "NO_SHOW", "CANCELLED"] as const;
const CERT_STATUSES = ["PENDING", "ACTIVE", "EXPIRED", "REVOKED"] as const;

async function gate(cap: StaffCapability) {
  const access = await requireMutationPermission("staff.manage");
  const profile = await requireUserProfile();
  if (!access.ok) {
    await logStaffPermissionDenied(access.actor, {
      requiredPermission: "staff.manage",
      operation: cap,
      staffCapability: cap,
    });
    throw new Error(access.error);
  }
  const scope = resolveStaffActorScope({
    workspaceRole: access.actor.workspaceRole,
    email: access.actor.email,
    profileRole: profile.role ?? null,
    profileEmail: profile.email ?? null,
  });
  if (!canManageStaff(scope, cap)) {
    await logStaffPermissionDenied(access.actor, {
      requiredPermission: "staff.manage",
      operation: cap,
      staffCapability: cap,
    });
    throw new Error(`You do not have permission to ${cap}.`);
  }
  return { userId: access.actor.userId, profileId: profile.id };
}

const createSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(64).nullable().optional(),
  role: z.string().max(160).nullable().optional(),
  roleType: z.enum(ROLE_TYPES).nullable().optional(),
  status: z.enum(STATUSES).nullable().optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  customRoleId: z.string().uuid().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function createStaffAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.create");
  const parsed = createSchema.parse({
    name: formData.get("name"),
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    role: (formData.get("role") as string) || null,
    roleType: (formData.get("roleType") as string) || null,
    status: (formData.get("status") as string) || null,
    employmentType: (formData.get("employmentType") as string) || null,
    brandId: (formData.get("brandId") as string) || null,
    locationId: (formData.get("locationId") as string) || null,
    customRoleId: (formData.get("customRoleId") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  await createStaffMember({
    userId,
    performedById: profileId,
    name: parsed.name,
    email: parsed.email ?? null,
    phone: parsed.phone ?? null,
    role: parsed.role ?? null,
    roleType: (parsed.roleType ?? null) as StaffRoleType | null,
    status: (parsed.status ?? null) as StaffStatus | null,
    employmentType: (parsed.employmentType ?? null) as StaffEmploymentType | null,
    brandId: parsed.brandId ?? null,
    locationId: parsed.locationId ?? null,
    customRoleId: parsed.customRoleId ?? null,
    notes: parsed.notes ?? null,
  });
  void auditLog({
    actor: { userId: profileId },
    action: "STAFF_INVITED",
    category: "STAFF",
    source: "USER",
    severity: "INFO",
    entity: { type: "StaffMember", label: parsed.name },
    metadata: { hasEmail: Boolean(parsed.email) },
    maskPiiInMetadata: true,
  });
  revalidatePath("/dashboard/staff");
}

const updateSchema = createSchema.partial().extend({
  staffMemberId: z.string().uuid(),
});

export async function updateStaffAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.update");
  const parsed = updateSchema.parse({
    staffMemberId: formData.get("staffMemberId"),
    name: (formData.get("name") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    role: (formData.get("role") as string) || undefined,
    roleType: (formData.get("roleType") as string) || undefined,
    status: (formData.get("status") as string) || undefined,
    employmentType: (formData.get("employmentType") as string) || undefined,
    brandId: (formData.get("brandId") as string) || undefined,
    locationId: (formData.get("locationId") as string) || undefined,
    customRoleId: (formData.get("customRoleId") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });
  const res = await updateStaffMember({
    userId,
    performedById: profileId,
    staffMemberId: parsed.staffMemberId,
    name: parsed.name ?? undefined,
    email: parsed.email ?? undefined,
    phone: parsed.phone ?? undefined,
    role: parsed.role ?? undefined,
    roleType: (parsed.roleType ?? undefined) as StaffRoleType | undefined,
    status: (parsed.status ?? undefined) as StaffStatus | undefined,
    employmentType: (parsed.employmentType ?? undefined) as StaffEmploymentType | undefined,
    brandId: parsed.brandId === "" ? null : (parsed.brandId ?? undefined),
    locationId: parsed.locationId === "" ? null : (parsed.locationId ?? undefined),
    customRoleId: parsed.customRoleId === "" ? null : (parsed.customRoleId ?? undefined),
    notes: parsed.notes ?? undefined,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/staff");
  revalidatePath(`/dashboard/staff/${parsed.staffMemberId}`);
}

const archiveSchema = z.object({ staffMemberId: z.string().uuid() });

export async function archiveStaffAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.archive");
  const parsed = archiveSchema.parse({ staffMemberId: formData.get("staffMemberId") });
  const res = await archiveStaffMember({
    userId,
    performedById: profileId,
    staffMemberId: parsed.staffMemberId,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/staff");
}

const roleUpsertSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(160),
  description: z.string().max(2000).nullable().optional(),
  permissions: z.record(z.string(), z.string()).nullable().optional(),
  active: z.boolean().optional(),
});

export async function upsertRoleAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.role.create");
  const raw = {
    key: formData.get("key"),
    label: formData.get("label"),
    description: (formData.get("description") as string) || null,
    permissions: null as Record<string, string> | null,
    active: formData.get("active") !== "false",
  };
  const permRaw = formData.get("permissionsJson") as string | null;
  if (permRaw) {
    try { raw.permissions = JSON.parse(permRaw); }
    catch { raw.permissions = null; }
  }
  const parsed = roleUpsertSchema.parse(raw);
  await upsertRole({
    userId,
    performedById: profileId,
    key: parsed.key,
    label: parsed.label,
    description: parsed.description ?? null,
    permissions: parsed.permissions ?? null,
    active: parsed.active,
  });
  void auditLog({
    actor: { userId: profileId },
    action: "ROLE_PERMISSION_CHANGED",
    category: "PERMISSIONS",
    source: "USER",
    severity: "NOTICE",
    entity: { type: "StaffRole", label: parsed.key },
    metadata: {
      label: parsed.label,
      permissionCount: parsed.permissions ? Object.keys(parsed.permissions).length : 0,
      active: parsed.active,
    },
    maskPiiInMetadata: true,
  });
  revalidatePath("/dashboard/staff/roles");
}

const deactivateRoleSchema = z.object({ roleId: z.string().uuid() });

export async function deactivateRoleAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.role.update");
  const parsed = deactivateRoleSchema.parse({ roleId: formData.get("roleId") });
  const res = await deactivateRole({ userId, performedById: profileId, roleId: parsed.roleId });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/staff/roles");
}

const availabilitySchema = z.object({
  staffMemberId: z.string().uuid(),
  windowsJson: z.string(),
});

export async function saveAvailabilityAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.update");
  const parsed = availabilitySchema.parse({
    staffMemberId: formData.get("staffMemberId"),
    windowsJson: formData.get("windowsJson"),
  });
  let windows: { dayOfWeek: number; startTime: string; endTime: string; available: boolean }[] = [];
  try {
    windows = JSON.parse(parsed.windowsJson);
  } catch {
    throw new Error("Invalid availability payload.");
  }
  const res = await saveAvailability({
    userId,
    performedById: profileId,
    staffMemberId: parsed.staffMemberId,
    windows,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath(`/dashboard/staff/${parsed.staffMemberId}`);
  revalidatePath("/dashboard/staff");
}

const shiftCreateSchema = z.object({
  staffMemberId: z.string().uuid(),
  shiftDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  role: z.enum(ROLE_TYPES).nullable().optional(),
  roleLabel: z.string().max(160).nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function createShiftAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.shift.create");
  const parsed = shiftCreateSchema.parse({
    staffMemberId: formData.get("staffMemberId"),
    shiftDate: formData.get("shiftDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    role: (formData.get("role") as string) || null,
    roleLabel: (formData.get("roleLabel") as string) || null,
    locationId: (formData.get("locationId") as string) || null,
    brandId: (formData.get("brandId") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  const res = await createShift({
    userId,
    performedById: profileId,
    staffMemberId: parsed.staffMemberId,
    shiftDate: new Date(parsed.shiftDate),
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    role: (parsed.role ?? null) as StaffRoleType | null,
    roleLabel: parsed.roleLabel ?? null,
    locationId: parsed.locationId ?? null,
    brandId: parsed.brandId ?? null,
    notes: parsed.notes ?? null,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/staff/shifts");
  revalidatePath(`/dashboard/staff/${parsed.staffMemberId}`);
}

const shiftStatusSchema = z.object({
  shiftId: z.string().uuid(),
  status: z.enum(SHIFT_STATUSES),
});

export async function updateShiftStatusAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.shift.update");
  const parsed = shiftStatusSchema.parse({
    shiftId: formData.get("shiftId"),
    status: formData.get("status"),
  });
  const res = await transitionShiftStatus({
    userId,
    performedById: profileId,
    shiftId: parsed.shiftId,
    status: parsed.status as StaffShiftStatus,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/staff/shifts");
}

const certUpsertSchema = z.object({
  staffMemberId: z.string().uuid(),
  certificationType: z.string().min(1).max(120),
  status: z.enum(CERT_STATUSES).nullable().optional(),
  issuedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function upsertStaffCertificationAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.cert.write");
  const parsed = certUpsertSchema.parse({
    staffMemberId: formData.get("staffMemberId"),
    certificationType: formData.get("certificationType"),
    status: (formData.get("status") as string) || null,
    issuedAt: (formData.get("issuedAt") as string) || null,
    expiresAt: (formData.get("expiresAt") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  const res = await upsertCertification({
    userId,
    performedById: profileId,
    staffMemberId: parsed.staffMemberId,
    certificationType: parsed.certificationType,
    status: (parsed.status ?? null) as StaffCertificationStatus | null,
    issuedAt: parsed.issuedAt ? new Date(parsed.issuedAt) : null,
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    notes: parsed.notes ?? null,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath(`/dashboard/staff/${parsed.staffMemberId}`);
  revalidatePath("/dashboard/staff/certifications");
}

const certRevokeSchema = z.object({
  certId: z.string().uuid(),
  reason: z.string().max(1000).nullable().optional(),
});

export async function revokeStaffCertificationAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("staff.cert.write");
  const parsed = certRevokeSchema.parse({
    certId: formData.get("certId"),
    reason: (formData.get("reason") as string) || null,
  });
  const res = await revokeCertification({
    userId,
    performedById: profileId,
    certId: parsed.certId,
    reason: parsed.reason ?? undefined,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/staff/certifications");
}
