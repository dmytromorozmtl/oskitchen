import type { UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export type ChannelPermissionContext = {
  email: string | null | undefined;
  role: UserRole;
  granted?: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
};

/**
 * Canonical channel command mutations map to `integrations.manage`.
 * Legacy owner-only fallback remains until all sessions resolve workspace grants.
 */
export function canManageChannelOperations(input: ChannelPermissionContext): boolean {
  if (input.platformBypass) return true;
  if (input.granted && hasPermission(input.granted, "integrations.manage")) {
    return true;
  }
  return input.role === "OWNER";
}

export function canManageChannelCredentials(input: ChannelPermissionContext & {
  staffCredentialManage?: boolean;
}): boolean {
  if (input.platformBypass) return true;
  if (canManageChannelOperations(input)) return true;
  if (input.role === "STAFF" && input.staffCredentialManage) return true;
  return false;
}

export function bypassesPlanGates(platformBypass?: boolean): boolean {
  return Boolean(platformBypass);
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
