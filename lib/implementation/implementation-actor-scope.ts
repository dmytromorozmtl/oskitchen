import type { StaffRoleType, UserRole } from "@prisma/client";

import type { ImplementationActorScope } from "@/lib/implementation/implementation-types";

const IMPLEMENTATION_ROLE_BY_STAFF_TYPE: Partial<Record<StaffRoleType, string>> = {
  OWNER: "owner",
  MANAGER: "manager",
  KITCHEN_LEAD: "kitchen_lead",
  PREP_COOK: "kitchen",
  LINE_COOK: "kitchen",
  PACKER: "packer",
  DRIVER: "driver",
  CUSTOMER_SERVICE: "sales",
  CATERING_COORDINATOR: "sales",
  PURCHASING: "viewer",
  INVENTORY: "viewer",
  ACCOUNTING: "accountant",
  MARKETING: "viewer",
  VIEWER: "viewer",
  CUSTOM: "viewer",
};

export type ImplementationScopedActor = ImplementationActorScope & {
  userId: string;
  workspaceId?: string | null;
  email: string | null;
  sessionUserId: string;
};

export function createImplementationActorScope(input: {
  sessionUserId: string;
  userId: string;
  workspaceId?: string | null;
  workspaceRole?: UserRole | null;
  staffRoleType?: StaffRoleType | null;
  email?: string | null;
  platformBypass?: boolean;
}): ImplementationScopedActor {
  const isOwner =
    input.workspaceRole === "OWNER" || input.staffRoleType === "OWNER" || input.sessionUserId === input.userId;

  return {
    sessionUserId: input.sessionUserId,
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    email: input.email ?? null,
    isOwner,
    role: isOwner
      ? null
      : (input.staffRoleType ? IMPLEMENTATION_ROLE_BY_STAFF_TYPE[input.staffRoleType] ?? null : null),
    platformBypass: input.platformBypass,
  };
}
