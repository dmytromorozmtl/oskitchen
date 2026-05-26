import type {
  Prisma,
  StaffCertificationStatus,
  StaffEmploymentType,
  StaffRoleType,
  StaffShiftStatus,
  StaffStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import {
  ownerScopedAnd,
  resolveOwnerScopedWhere,
  staffEventListWhereForOwner,
  staffMemberByIdWhereForOwner,
  staffMemberListWhereForOwner,
  staffRoleListWhereForOwner,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { SYSTEM_ROLE_BY_KEY } from "@/lib/staff/staff-roles";
import { deriveStatusFromExpiry } from "@/lib/staff/staff-certifications";
import { isWindowValid, normalizeTime, type AvailabilityWindow } from "@/lib/staff/staff-availability";

async function recordEvent(input: {
  userId: string;
  staffMemberId?: string | null;
  eventType: string;
  performedById?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  await prisma.staffEvent.create({
    data: {
      userId: input.userId,
      workspaceId,
      staffMemberId: input.staffMemberId ?? undefined,
      eventType: input.eventType,
      performedById: input.performedById ?? undefined,
      summary: input.summary ?? undefined,
      metadataJson: input.metadata ? (input.metadata as unknown as Prisma.InputJsonValue) : undefined,
    },
  });
}

export type CreateStaffInput = {
  userId: string;
  performedById?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  roleType?: StaffRoleType | null;
  status?: StaffStatus | null;
  employmentType?: StaffEmploymentType | null;
  brandId?: string | null;
  locationId?: string | null;
  customRoleId?: string | null;
  notes?: string | null;
};

function roleLabelFor(roleType: StaffRoleType | null | undefined, fallback: string | null | undefined): string {
  if (fallback && fallback.trim()) return fallback.trim();
  if (roleType) return SYSTEM_ROLE_BY_KEY[roleType]?.label ?? "Staff";
  return "Staff";
}

export async function createStaffMember(input: CreateStaffInput) {
  const roleType = input.roleType ?? "CUSTOM";
  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const member = await prisma.staffMember.create({
    data: {
      userId: input.userId,
      workspaceId,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      role: roleLabelFor(roleType, input.role),
      roleType,
      status: input.status ?? "ACTIVE",
      employmentType: input.employmentType ?? "CUSTOM",
      brandId: input.brandId ?? undefined,
      locationId: input.locationId ?? undefined,
      customRoleId: input.customRoleId ?? undefined,
      notes: input.notes ?? undefined,
      active: (input.status ?? "ACTIVE") === "ACTIVE",
    },
  });
  await recordEvent({
    userId: input.userId,
    staffMemberId: member.id,
    eventType: "STAFF_CREATED",
    performedById: input.performedById ?? null,
    summary: `${member.name} added as ${member.role}`,
  });
  return member;
}

export type UpdateStaffInput = {
  userId: string;
  performedById?: string | null;
  staffMemberId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  roleType?: StaffRoleType | null;
  status?: StaffStatus | null;
  employmentType?: StaffEmploymentType | null;
  brandId?: string | null;
  locationId?: string | null;
  customRoleId?: string | null;
  notes?: string | null;
};

export async function updateStaffMember(input: UpdateStaffInput) {
  const memberWhere = await staffMemberByIdWhereForOwner(input.userId, input.staffMemberId);
  const member = await prisma.staffMember.findFirst({
    where: memberWhere,
  });
  if (!member) return { ok: false as const, error: "Staff member not found" };

  const nextStatus = input.status ?? member.status;
  const nextRoleType = input.roleType ?? member.roleType;

  const updated = await prisma.staffMember.update({
    where: { id: member.id },
    data: {
      name: input.name?.trim() ?? undefined,
      email: input.email !== undefined ? (input.email?.trim() || null) : undefined,
      phone: input.phone !== undefined ? (input.phone?.trim() || null) : undefined,
      role: input.role !== undefined
        ? roleLabelFor(nextRoleType, input.role)
        : roleLabelFor(nextRoleType, member.role),
      roleType: nextRoleType,
      status: nextStatus,
      employmentType: input.employmentType ?? undefined,
      brandId: input.brandId === undefined ? undefined : input.brandId,
      locationId: input.locationId === undefined ? undefined : input.locationId,
      customRoleId: input.customRoleId === undefined ? undefined : input.customRoleId,
      notes: input.notes === undefined ? undefined : input.notes,
      active: nextStatus === "ACTIVE",
      archivedAt: nextStatus === "ARCHIVED" ? new Date() : member.archivedAt,
    },
  });
  await recordEvent({
    userId: input.userId,
    staffMemberId: member.id,
    eventType: "STAFF_UPDATED",
    performedById: input.performedById ?? null,
    summary: `${updated.name} updated`,
  });
  return { ok: true as const, member: updated };
}

export async function archiveStaffMember(input: {
  userId: string;
  performedById?: string | null;
  staffMemberId: string;
}) {
  return updateStaffMember({
    userId: input.userId,
    performedById: input.performedById ?? null,
    staffMemberId: input.staffMemberId,
    status: "ARCHIVED",
  });
}

export async function listStaff(userId: string) {
  const where = await staffMemberListWhereForOwner(userId);
  return prisma.staffMember.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      customRole: { select: { id: true, key: true, label: true } },
      certifications: { select: { id: true, status: true, expiresAt: true } },
      _count: {
        select: {
          tasks: true,
          assignedProductionBatches: true,
          assignedProductionWorkItems: true,
          assignedPackingBatches: true,
          assignedPackingTasks: true,
          trainingAssignmentsAsStaff: true,
          trainingCertsAsStaff: true,
          shifts: true,
        },
      },
    },
  });
}

export async function getStaffMember(userId: string, staffMemberId: string) {
  const where = await staffMemberByIdWhereForOwner(userId, staffMemberId);
  return prisma.staffMember.findFirst({
    where,
    include: {
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      customRole: true,
      availability: { orderBy: { dayOfWeek: "asc" } },
      shifts: { orderBy: [{ shiftDate: "desc" }], take: 30 },
      certifications: { orderBy: [{ createdAt: "desc" }] },
      tasks: { take: 30, orderBy: [{ createdAt: "desc" }] },
      trainingAssignmentsAsStaff: {
        take: 30,
        orderBy: [{ assignedAt: "desc" }],
        include: { program: { select: { id: true, title: true, roleType: true } } },
      },
      trainingCertsAsStaff: { take: 30, orderBy: [{ issuedAt: "desc" }] },
      events: { take: 30, orderBy: [{ createdAt: "desc" }] },
    },
  });
}

export async function listRoles(userId: string) {
  const where = await staffRoleListWhereForOwner(userId);
  return prisma.staffRole.findMany({
    where,
    orderBy: [{ active: "desc" }, { label: "asc" }],
  });
}

export type UpsertRoleInput = {
  userId: string;
  performedById?: string | null;
  key: string;
  label: string;
  description?: string | null;
  permissions?: Record<string, string> | null;
  active?: boolean;
};

export async function upsertRole(input: UpsertRoleInput) {
  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const role = await prisma.staffRole.upsert({
    where: { userId_key: { userId: input.userId, key: input.key } },
    update: {
      label: input.label,
      description: input.description ?? undefined,
      permissionsJson: input.permissions
        ? (input.permissions as unknown as Prisma.InputJsonValue)
        : undefined,
      active: input.active ?? undefined,
    },
    create: {
      userId: input.userId,
      workspaceId,
      key: input.key,
      label: input.label,
      description: input.description ?? undefined,
      permissionsJson: input.permissions
        ? (input.permissions as unknown as Prisma.InputJsonValue)
        : undefined,
      active: input.active ?? true,
    },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "ROLE_UPSERTED",
    performedById: input.performedById ?? null,
    summary: role.label,
  });
  return role;
}

export async function deactivateRole(input: {
  userId: string;
  performedById?: string | null;
  roleId: string;
}) {
  const roleWhere = await ownerScopedAnd(input.userId, { id: input.roleId });
  const role = await prisma.staffRole.findFirst({ where: roleWhere });
  if (!role) return { ok: false as const, error: "Role not found" };
  await prisma.staffRole.update({
    where: { id: role.id },
    data: { active: false },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "ROLE_DEACTIVATED",
    performedById: input.performedById ?? null,
    summary: role.label,
  });
  return { ok: true as const };
}

export type AvailabilitySaveInput = {
  userId: string;
  performedById?: string | null;
  staffMemberId: string;
  windows: AvailabilityWindow[];
};

export async function saveAvailability(input: AvailabilitySaveInput) {
  const memberWhere = await staffMemberByIdWhereForOwner(input.userId, input.staffMemberId);
  const member = await prisma.staffMember.findFirst({ where: memberWhere });
  if (!member) return { ok: false as const, error: "Staff member not found" };
  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const availScope = await resolveOwnerScopedWhere(input.userId);
  const normalized = input.windows
    .map((w) => ({
      dayOfWeek: w.dayOfWeek,
      startTime: normalizeTime(w.startTime),
      endTime: normalizeTime(w.endTime),
      available: w.available,
    }))
    .filter(isWindowValid);
  await prisma.$transaction([
    prisma.staffAvailability.deleteMany({
      where: { AND: [availScope, { staffMemberId: member.id }] },
    }),
    ...normalized.map((w) =>
      prisma.staffAvailability.create({
        data: {
          userId: input.userId,
          workspaceId,
          staffMemberId: member.id,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
          available: w.available,
        },
      }),
    ),
  ]);
  await recordEvent({
    userId: input.userId,
    staffMemberId: member.id,
    eventType: "AVAILABILITY_UPDATED",
    performedById: input.performedById ?? null,
    summary: `${normalized.length} window(s)`,
  });
  return { ok: true as const };
}

export type CreateShiftInput = {
  userId: string;
  performedById?: string | null;
  staffMemberId: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  role?: StaffRoleType | null;
  roleLabel?: string | null;
  locationId?: string | null;
  brandId?: string | null;
  notes?: string | null;
};

export async function createShift(input: CreateShiftInput) {
  const memberWhere = await staffMemberByIdWhereForOwner(input.userId, input.staffMemberId);
  const member = await prisma.staffMember.findFirst({ where: memberWhere });
  if (!member) return { ok: false as const, error: "Staff member not found" };
  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const shift = await prisma.staffShift.create({
    data: {
      userId: input.userId,
      workspaceId,
      staffMemberId: member.id,
      shiftDate: input.shiftDate,
      startTime: normalizeTime(input.startTime),
      endTime: normalizeTime(input.endTime),
      role: input.role ?? member.roleType,
      roleLabel: input.roleLabel ?? null,
      locationId: input.locationId ?? member.locationId ?? undefined,
      brandId: input.brandId ?? member.brandId ?? undefined,
      notes: input.notes ?? undefined,
    },
  });
  await recordEvent({
    userId: input.userId,
    staffMemberId: member.id,
    eventType: "SHIFT_CREATED",
    performedById: input.performedById ?? null,
    summary: `${input.shiftDate.toISOString().slice(0, 10)} ${shift.startTime}-${shift.endTime}`,
  });
  return { ok: true as const, shift };
}

export async function transitionShiftStatus(input: {
  userId: string;
  performedById?: string | null;
  shiftId: string;
  status: StaffShiftStatus;
}) {
  const shiftWhere = await ownerScopedAnd(input.userId, { id: input.shiftId });
  const shift = await prisma.staffShift.findFirst({ where: shiftWhere });
  if (!shift) return { ok: false as const, error: "Shift not found" };
  const checkedInAt = input.status === "CHECKED_IN" ? new Date() : shift.checkedInAt;
  const completedAt = input.status === "COMPLETED" ? new Date() : shift.completedAt;
  const updated = await prisma.staffShift.update({
    where: { id: shift.id },
    data: { status: input.status, checkedInAt, completedAt },
  });
  await recordEvent({
    userId: input.userId,
    staffMemberId: shift.staffMemberId,
    eventType: `SHIFT_${input.status}`,
    performedById: input.performedById ?? null,
    summary: `Shift ${shift.shiftDate.toISOString().slice(0, 10)} → ${input.status}`,
  });
  return { ok: true as const, shift: updated };
}

export async function listShifts(input: {
  userId: string;
  from?: Date | null;
  to?: Date | null;
  staffMemberId?: string | null;
  locationId?: string | null;
}) {
  const scope = await staffShiftListWhereForOwner(input.userId);
  return prisma.staffShift.findMany({
    where: {
      AND: [
        scope,
        {
          shiftDate: input.from || input.to
            ? { gte: input.from ?? undefined, lte: input.to ?? undefined }
            : undefined,
          staffMemberId: input.staffMemberId ?? undefined,
          locationId: input.locationId ?? undefined,
        },
      ],
    },
    orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
    include: {
      staffMember: { select: { id: true, name: true, roleType: true } },
      location: { select: { id: true, name: true } },
    },
  });
}

export type UpsertCertificationInput = {
  userId: string;
  performedById?: string | null;
  staffMemberId: string;
  certificationType: string;
  status?: StaffCertificationStatus | null;
  issuedAt?: Date | null;
  expiresAt?: Date | null;
  sourceTrainingId?: string | null;
  notes?: string | null;
};

export async function upsertCertification(input: UpsertCertificationInput) {
  const memberWhere = await staffMemberByIdWhereForOwner(input.userId, input.staffMemberId);
  const member = await prisma.staffMember.findFirst({ where: memberWhere });
  if (!member) return { ok: false as const, error: "Staff member not found" };
  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const status: StaffCertificationStatus = deriveStatusFromExpiry(
    input.status ?? "ACTIVE",
    input.expiresAt ?? null,
  );
  const cert = await prisma.staffCertification.create({
    data: {
      userId: input.userId,
      workspaceId,
      staffMemberId: member.id,
      certificationType: input.certificationType.trim(),
      status,
      issuedAt: input.issuedAt ?? new Date(),
      expiresAt: input.expiresAt ?? undefined,
      sourceTrainingId: input.sourceTrainingId ?? undefined,
      notes: input.notes ?? undefined,
    },
  });
  await recordEvent({
    userId: input.userId,
    staffMemberId: member.id,
    eventType: "CERT_ADDED",
    performedById: input.performedById ?? null,
    summary: `${cert.certificationType} (${cert.status})`,
  });
  return { ok: true as const, cert };
}

export async function revokeCertification(input: {
  userId: string;
  performedById?: string | null;
  certId: string;
  reason?: string;
}) {
  const certWhere = await ownerScopedAnd(input.userId, { id: input.certId });
  const cert = await prisma.staffCertification.findFirst({ where: certWhere });
  if (!cert) return { ok: false as const, error: "Certification not found" };
  await prisma.staffCertification.update({
    where: { id: cert.id },
    data: { status: "REVOKED", notes: input.reason ?? cert.notes },
  });
  await recordEvent({
    userId: input.userId,
    staffMemberId: cert.staffMemberId,
    eventType: "CERT_REVOKED",
    performedById: input.performedById ?? null,
    summary: cert.certificationType,
  });
  return { ok: true as const };
}

export async function listEvents(userId: string, limit = 50) {
  const where = await staffEventListWhereForOwner(userId);
  return prisma.staffEvent.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    include: { performedBy: { select: { id: true, fullName: true, email: true } } },
  });
}

export type StaffKpis = {
  active: number;
  invited: number;
  trainingIncomplete: number;
  certsExpiring: number;
  certsActive: number;
  driversAvailable: number;
  assignedToday: number;
  openTasks: number;
  unavailableToday: number;
  totalRoles: number;
  archived: number;
};

export async function staffKpis(userId: string): Promise<StaffKpis> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const scope = await resolveOwnerScopedWhere(userId);

  const [
    active,
    invited,
    archived,
    trainingIncomplete,
    certsExpiring,
    certsActive,
    drivers,
    assignedToday,
    unavailableToday,
    openTasks,
    totalRoles,
  ] = await Promise.all([
    prisma.staffMember.count({ where: { AND: [scope, { status: "ACTIVE" }] } }),
    prisma.staffMember.count({ where: { AND: [scope, { status: "INVITED" }] } }),
    prisma.staffMember.count({
      where: { AND: [scope, { status: { in: ["ARCHIVED", "INACTIVE"] } }] },
    }),
    prisma.trainingAssignment.count({
      where: {
        AND: [
          scope,
          {
            status: { notIn: ["COMPLETED", "WAIVED"] },
            assignedToStaffId: { not: null },
          },
        ],
      },
    }),
    prisma.staffCertification.count({
      where: { AND: [scope, { status: "ACTIVE", expiresAt: { gt: today, lte: in30 } }] },
    }),
    prisma.staffCertification.count({ where: { AND: [scope, { status: "ACTIVE" }] } }),
    prisma.staffMember.count({
      where: { AND: [scope, { status: "ACTIVE", roleType: "DRIVER" }] },
    }),
    prisma.staffShift.count({
      where: {
        AND: [scope, { shiftDate: { gte: today, lt: tomorrow }, status: { in: ["SCHEDULED", "CHECKED_IN"] } }],
      },
    }),
    prisma.staffShift.count({
      where: {
        AND: [scope, { shiftDate: { gte: today, lt: tomorrow }, status: { in: ["NO_SHOW", "CANCELLED"] } }],
      },
    }),
    prisma.kitchenTask.count({
      where: { AND: [scope, { assignedToId: { not: null }, status: { in: ["OPEN", "IN_PROGRESS"] } }] },
    }),
    prisma.staffRole.count({ where: { AND: [scope, { active: true }] } }),
  ]);

  return {
    active,
    invited,
    trainingIncomplete,
    certsExpiring,
    certsActive,
    driversAvailable: drivers,
    assignedToday,
    openTasks,
    unavailableToday,
    totalRoles,
    archived,
  };
}
