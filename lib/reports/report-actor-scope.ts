import type { StaffRoleType, UserRole } from "@prisma/client";

import type { PermissionKey } from "@/lib/permissions/permissions";
import type { ReportActorScope } from "@/lib/reports/report-permissions";

const REPORT_ROLE_BY_STAFF_TYPE: Partial<Record<StaffRoleType, string>> = {
  OWNER: "owner",
  MANAGER: "manager",
  KITCHEN_LEAD: "kitchen_lead",
  PREP_COOK: "kitchen",
  LINE_COOK: "kitchen",
  PACKER: "packer",
  DRIVER: "driver",
  CUSTOMER_SERVICE: "sales",
  CATERING_COORDINATOR: "sales",
  PURCHASING: "purchasing",
  INVENTORY: "viewer",
  ACCOUNTING: "accountant",
  MARKETING: "viewer",
  VIEWER: "viewer",
  CUSTOM: "viewer",
};

export type ReportScopedActor = ReportActorScope & {
  userId: string;
  workspaceId?: string | null;
  email: string | null;
};

export function createReportActorScope(input: {
  sessionUserId: string;
  userId: string;
  workspaceId?: string | null;
  workspaceRole?: UserRole | null;
  staffRoleType?: StaffRoleType | null;
  email?: string | null;
  granted?: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
}): ReportScopedActor {
  const isOwner =
    input.workspaceRole === "OWNER" || input.staffRoleType === "OWNER" || input.sessionUserId === input.userId;

  return {
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    email: input.email ?? null,
    isOwner,
    role: isOwner ? null : (input.staffRoleType ? REPORT_ROLE_BY_STAFF_TYPE[input.staffRoleType] ?? null : null),
    granted: input.granted,
    platformBypass: input.platformBypass,
  };
}
