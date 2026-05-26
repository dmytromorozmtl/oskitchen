import { isSuperAdminEmail } from "@/lib/platform-owner";

export type StaffActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
};

export type StaffCapability =
  | "staff.view"
  | "staff.view.pii"
  | "staff.create"
  | "staff.update"
  | "staff.archive"
  | "staff.assign.role"
  | "staff.assign.location"
  | "staff.assign.training"
  | "staff.role.create"
  | "staff.role.update"
  | "staff.shift.create"
  | "staff.shift.update"
  | "staff.cert.write"
  | "staff.audit.view";

const GRANTS: Record<StaffCapability, string[]> = {
  "staff.view": [
    "owner", "admin", "manager", "supervisor", "operations_lead",
    "kitchen_lead", "trainer", "implementation_manager", "viewer", "accountant",
  ],
  "staff.view.pii": [
    "owner", "admin", "manager", "operations_lead", "implementation_manager",
  ],
  "staff.create": ["owner", "admin", "manager", "operations_lead"],
  "staff.update": ["owner", "admin", "manager", "operations_lead"],
  "staff.archive": ["owner", "admin", "manager", "operations_lead"],
  "staff.assign.role": ["owner", "admin", "manager", "operations_lead"],
  "staff.assign.location": ["owner", "admin", "manager", "operations_lead"],
  "staff.assign.training": ["owner", "admin", "manager", "trainer", "operations_lead"],
  "staff.role.create": ["owner", "admin", "operations_lead"],
  "staff.role.update": ["owner", "admin", "operations_lead"],
  "staff.shift.create": ["owner", "admin", "manager", "supervisor", "operations_lead"],
  "staff.shift.update": ["owner", "admin", "manager", "supervisor", "operations_lead"],
  "staff.cert.write": ["owner", "admin", "manager", "trainer", "operations_lead"],
  "staff.audit.view": ["owner", "admin", "operations_lead", "accountant"],
};

export function isSuperAdminStaff(scope: StaffActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canManageStaff(scope: StaffActorScope, cap: StaffCapability): boolean {
  if (isSuperAdminStaff(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}

/** Return a server-side filtered view of a staff member appropriate for the actor. */
export function visibleStaffShape(input: {
  scope: StaffActorScope;
  member: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    roleType: string;
    status: string;
    employmentType: string;
    brandId: string | null;
    locationId: string | null;
    notes: string | null;
    emergencyContactJson: unknown;
    permissionsJson: unknown;
    lastActiveAt: Date | null;
    invitedAt: Date | null;
    archivedAt: Date | null;
    createdAt: Date;
  };
}) {
  const canPII = canManageStaff(input.scope, "staff.view.pii");
  return {
    id: input.member.id,
    name: input.member.name,
    role: input.member.role,
    roleType: input.member.roleType,
    status: input.member.status,
    employmentType: input.member.employmentType,
    brandId: input.member.brandId,
    locationId: input.member.locationId,
    email: canPII ? input.member.email : null,
    phone: canPII ? input.member.phone : null,
    notes: canPII ? input.member.notes : null,
    emergencyContactJson: canPII ? input.member.emergencyContactJson : null,
    permissionsJson: canManageStaff(input.scope, "staff.audit.view") ? input.member.permissionsJson : null,
    lastActiveAt: input.member.lastActiveAt,
    invitedAt: input.member.invitedAt,
    archivedAt: input.member.archivedAt,
    createdAt: input.member.createdAt,
  };
}
