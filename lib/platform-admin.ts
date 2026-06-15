import { redirect } from "next/navigation";

import type { PlatformRole, UserRole } from "@prisma/client";

import { requireSessionUser } from "@/lib/auth";
import { isSuperAdminEmail } from "@/lib/platform-owner";
import { hasSuperAdminRoleRow, isSuperAdminUser } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";

export { PLATFORM_ROOT_EMAIL, isSuperAdminEmail } from "@/lib/platform-owner";
export { isSuperAdminUser } from "@/lib/platform-super-bypass";

const PLATFORM_STAFF_ROLES: PlatformRole[] = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "SUPPORT_ADMIN",
  "IMPLEMENTATION_ADMIN",
  "GROWTH_ADMIN",
  "PARTNER_ADMIN",
  "STANDARD_USER",
];

export async function isPlatformAdmin(userId: string, email?: string | null): Promise<boolean> {
  await ensurePlatformOwnerBootstrap(userId, email);
  if (await hasSuperAdminRoleRow(userId)) return true;
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: { in: PLATFORM_STAFF_ROLES } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getPlatformRolesForUser(userId: string): Promise<PlatformRole[]> {
  const rows = await prisma.platformUserRole.findMany({
    where: { userId },
    select: { role: true },
  });
  return rows.map((r) => r.role);
}

export async function ensurePlatformOwnerBootstrap(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  if (!isSuperAdminEmail(email)) return;
  await prisma.platformUserRole.upsert({
    where: {
      userId_role: { userId, role: "SUPER_ADMIN" },
    },
    create: { userId, role: "SUPER_ADMIN" },
    update: {},
  });
}

export async function requireSuperAdmin() {
  const user = await requireSessionUser();
  await ensurePlatformOwnerBootstrap(user.id, user.email ?? "");
  if (!(await hasSuperAdminRoleRow(user.id))) redirect("/dashboard");
  return user;
}

export async function requirePlatformRole(allowed: PlatformRole[]) {
  const user = await requireSessionUser();
  await ensurePlatformOwnerBootstrap(user.id, user.email ?? "");
  if (await hasSuperAdminRoleRow(user.id)) return user;
  const row = await prisma.platformUserRole.findFirst({
    where: { userId: user.id, role: { in: allowed } },
    select: { id: true },
  });
  if (!row) redirect("/dashboard");
  return user;
}

export async function requirePlatformStaff() {
  return requirePlatformRole(PLATFORM_STAFF_ROLES);
}

export async function canAccessOwnerOnlySurfaces(
  userId: string,
  email: string | null | undefined,
  profileRole: UserRole,
): Promise<boolean> {
  if (profileRole === "OWNER") return true;
  await ensurePlatformOwnerBootstrap(userId, email);
  return isSuperAdminUser(userId, email);
}

export async function isTargetSuperAdminProtected(targetUserId: string): Promise<boolean> {
  return hasSuperAdminRoleRow(targetUserId);
}
