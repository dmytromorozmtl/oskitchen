import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { ensurePlatformOwnerBootstrap, getPlatformRolesForUser, isPlatformAdmin } from "@/lib/platform-admin";

import type { PlatformPermission } from "./platform-permissions";
import { hasPlatformPermission, resolvePlatformPermissions } from "./platform-permissions";

export type PlatformAccessContext = {
  userId: string;
  email: string | null;
  roles: Awaited<ReturnType<typeof getPlatformRolesForUser>>;
  permissions: Set<PlatformPermission>;
  isFounder: boolean;
};

/** Use on `/platform/*` pages after layout — adds permission set for UI + future fine gates. */
export async function requirePlatformAccess(): Promise<PlatformAccessContext> {
  const user = await requireSessionUser();
  await ensurePlatformOwnerBootstrap(user.id, user.email);
  const ok = await isPlatformAdmin(user.id, user.email);
  if (!ok) redirect("/dashboard");
  const roles = await getPlatformRolesForUser(user.id);
  const permissions = resolvePlatformPermissions(user.email, roles);
  if (!permissions.has("platform:access")) redirect("/dashboard");
  return {
    userId: user.id,
    email: user.email ?? null,
    roles,
    permissions,
    isFounder: roles.includes("SUPER_ADMIN"),
  };
}

export function assertPlatformPermission(
  ctx: PlatformAccessContext,
  perm: PlatformPermission,
): void {
  if (!hasPlatformPermission(ctx.permissions, perm)) {
    redirect("/platform/dashboard");
  }
}
