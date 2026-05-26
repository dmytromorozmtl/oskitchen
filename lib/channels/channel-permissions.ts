import type { UserRole } from "@prisma/client";

import { isSuperAdminEmail } from "@/lib/platform-owner";

/**
 * Credential surfaces are owner/admin by default; staff only when explicitly allowed later.
 * Platform super-admin always passes gates for diagnostics.
 */
export function canManageChannelCredentials(input: {
  email: string | null | undefined;
  role: UserRole;
  staffCredentialManage?: boolean;
}): boolean {
  if (isSuperAdminEmail(input.email)) return true;
  if (input.role === "OWNER") return true;
  if (input.role === "STAFF" && input.staffCredentialManage) return true;
  return false;
}

export function bypassesPlanGates(email: string | null | undefined): boolean {
  return isSuperAdminEmail(email);
}

export function canApproveChannelImports(input: {
  email: string | null | undefined;
  role: UserRole;
}): boolean {
  if (isSuperAdminEmail(input.email)) return true;
  return input.role === "OWNER";
}

export function canRollbackChannelImports(input: {
  email: string | null | undefined;
  role: UserRole;
}): boolean {
  return canApproveChannelImports(input);
}

export function canViewChannelRawPayload(input: {
  email: string | null | undefined;
  role: UserRole;
}): boolean {
  if (isSuperAdminEmail(input.email)) return true;
  return input.role === "OWNER";
}

export function canReplayChannelWebhooks(input: {
  email: string | null | undefined;
  role: UserRole;
}): boolean {
  if (isSuperAdminEmail(input.email)) return true;
  return input.role === "OWNER";
}

export function canEditChannelRules(input: {
  email: string | null | undefined;
  role: UserRole;
}): boolean {
  if (isSuperAdminEmail(input.email)) return true;
  return input.role === "OWNER";
}

export function canViewSalesChannels(input: { role: UserRole }): boolean {
  return input.role === "OWNER" || input.role === "STAFF";
}
