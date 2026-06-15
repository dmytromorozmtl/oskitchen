import { requireSessionUser } from "@/lib/auth";
import { ensurePlatformOwnerBootstrap } from "@/lib/platform-admin";
import { isSuperAdminEmail } from "@/lib/platform-owner";
import { hasSuperAdminRoleRow, isSuperAdminUser } from "@/lib/platform-super-bypass";

export { canAssignBillingMode } from "@/lib/billing/billing-permissions";
export { isSuperAdminEmail, isBootstrapPlatformRootEmail, PLATFORM_ROOT_EMAIL } from "@/lib/platform-owner";
export { hasSuperAdminRoleRow, isSuperAdminUser } from "@/lib/platform-super-bypass";

/**
 * Sync UI helper — does not grant access from bootstrap email alone.
 * Prefer async `isSuperAdminUser` / `hasSuperAdminRoleRow` for server gates.
 */
export function isSuperAdmin(scope: { email?: string | null } | null | undefined): boolean {
  void scope;
  return false;
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
  await ensurePlatformOwnerBootstrap(user.id, user.email);
  const ok = await isSuperAdminUser(user.id, user.email);
  if (!ok) {
    throw new Error("Unauthorized: superadmin role required");
  }
  return { userId: user.id, email: user.email ?? null };
}
