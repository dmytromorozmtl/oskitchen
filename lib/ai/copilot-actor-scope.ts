import type { StaffRoleType, UserRole } from "@prisma/client";

import type { CopilotActorScope } from "@/lib/ai/copilot-types";

const COPILOT_ROLE_BY_STAFF_TYPE: Partial<Record<StaffRoleType, string>> = {
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

export type CopilotScopedActor = CopilotActorScope & {
  userId: string;
  workspaceId?: string | null;
  email: string | null;
};

export function createCopilotActorScope(input: {
  sessionUserId: string;
  userId: string;
  workspaceId?: string | null;
  workspaceRole?: UserRole | null;
  staffRoleType?: StaffRoleType | null;
  email?: string | null;
  platformBypass?: boolean;
}): CopilotScopedActor {
  const isOwner =
    input.workspaceRole === "OWNER" || input.staffRoleType === "OWNER" || input.sessionUserId === input.userId;

  return {
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    email: input.email ?? null,
    isOwner,
    role: isOwner ? null : (input.staffRoleType ? COPILOT_ROLE_BY_STAFF_TYPE[input.staffRoleType] ?? null : null),
    platformBypass: input.platformBypass,
  };
}
