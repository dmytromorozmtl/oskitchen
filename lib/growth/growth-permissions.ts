import type { UserRole } from "@prisma/client";

import { requireSessionUser } from "@/lib/auth";
import { canAccessOwnerOnlySurfaces } from "@/lib/platform-admin";
import { prisma } from "@/lib/prisma";

const GTM_PLATFORM_ROLES = ["SUPER_ADMIN", "PLATFORM_ADMIN", "GROWTH_ADMIN", "PARTNER_ADMIN", "SUPPORT_ADMIN"] as const;

/**
 * Growth / founder CRM is restricted to workspace owners, platform superadmins,
 * and selected platform GTM roles — never normal staff/tenant users.
 */
export async function canAccessGrowthModule(
  userId: string,
  email: string | null | undefined,
  profileRole: UserRole,
): Promise<boolean> {
  if (await canAccessOwnerOnlySurfaces(userId, email, profileRole)) return true;
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: { in: [...GTM_PLATFORM_ROLES] } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function assertGrowthAccess() {
  const user = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile) throw new Error("FORBIDDEN");
  const ok = await canAccessGrowthModule(user.id, user.email ?? null, profile.role);
  if (!ok) throw new Error("FORBIDDEN");
  return user;
}
