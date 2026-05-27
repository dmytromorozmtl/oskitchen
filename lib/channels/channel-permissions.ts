import type { UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { isSuperAdminEmail } from "@/lib/platform-owner";

export type ChannelPermissionContext = {
  email: string | null | undefined;
  role: UserRole;
  granted?: ReadonlySet<PermissionKey>;
};

/**
 * Canonical channel command mutations map to `integrations.manage`.
 * Legacy owner-only fallback remains until all sessions resolve workspace grants.
 */
export function canManageChannelOperations(input: ChannelPermissionContext): boolean {
  if (isSuperAdminEmail(input.email)) return true;
  if (input.granted && hasPermission(input.granted, "integrations.manage")) {
    return true;
  }
  return input.role === "OWNER";
}

export function canManageChannelCredentials(input: ChannelPermissionContext & {
  staffCredentialManage?: boolean;
}): boolean {
  if (isSuperAdminEmail(input.email)) return true;
  if (canManageChannelOperations(input)) return true;
  if (input.role === "STAFF" && input.staffCredentialManage) return true;
  return false;
}

export function bypassesPlanGates(email: string | null | undefined): boolean {
  return isSuperAdminEmail(email);
}

export function canApproveChannelImports(input: ChannelPermissionContext): boolean {
  return canManageChannelOperations(input);
}

export function canRollbackChannelImports(input: ChannelPermissionContext): boolean {
  return canManageChannelOperations(input);
}

export function canViewChannelRawPayload(input: ChannelPermissionContext): boolean {
  return canManageChannelOperations(input);
}

export function canReplayChannelWebhooks(input: ChannelPermissionContext): boolean {
  return canManageChannelOperations(input);
}

export function canEditChannelRules(input: ChannelPermissionContext): boolean {
  return canManageChannelOperations(input);
}

export function canViewSalesChannels(input: { role: UserRole }): boolean {
  return input.role === "OWNER" || input.role === "STAFF";
}
