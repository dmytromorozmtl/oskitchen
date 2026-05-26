import { requireSessionUser } from "@/lib/auth";
import { isSuperAdminEmail } from "@/lib/platform-owner";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";

export { canAssignBillingMode } from "@/lib/billing/billing-permissions";
export { isSuperAdminEmail } from "@/lib/platform-owner";
export { hasSuperAdminRoleRow, isSuperAdminUser } from "@/lib/platform-super-bypass";

/** Sync check for UI gates (email match; use async `isSuperAdminUser` for SUPER_ADMIN role row). */
export function isSuperAdmin(scope: { email?: string | null } | null | undefined): boolean {
  if (!scope) return false;
  return isSuperAdminEmail(scope.email);
}

/**
 * Server action / API guard — throws instead of redirecting.
 * Use for dashboard mutations that must never be available to workspace owners.
 */
export async function requireSuperAdminActor(): Promise<{
  userId: string;
  email: string | null;
}> {
  const user = await requireSessionUser();
  const ok = await isSuperAdminUser(user.id, user.email);
  if (!ok) {
    throw new Error("Unauthorized: superadmin role required");
  }
  return { userId: user.id, email: user.email ?? null };
}
