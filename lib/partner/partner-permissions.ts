import type { PlatformRole, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { canAccessOwnerOnlySurfaces } from "@/lib/platform-admin";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";

export const PARTNER_PLATFORM_ROLES = [
  "PARTNER_ADMIN",
  "IMPLEMENTATION_ADMIN",
  "SUPPORT_ADMIN",
  "PLATFORM_ADMIN",
] as const;

/**
 * Partner dashboard: account owners, accepted partner members, platform partner ops,
 * and the same owner/superadmin bypass as other founder surfaces.
 */
export async function canAccessPartnerModule(
  userId: string,
  email: string | null | undefined,
  profileRole: UserRole,
): Promise<boolean> {
  if (await canAccessOwnerOnlySurfaces(userId, email, profileRole)) return true;
  if (await isSuperAdminUser(userId, email)) return true;

  const platform = await prisma.platformUserRole.findFirst({
    where: { userId, role: { in: [...PARTNER_PLATFORM_ROLES] } },
    select: { id: true },
  });
  if (platform) return true;

  const owned = await prisma.partnerAccount.findFirst({
    where: { ownerUserId: userId },
    select: { id: true },
  });
  if (owned) return true;

  const member = await prisma.partnerMember.findFirst({
    where: { userId },
    select: { id: true },
  });
  return Boolean(member);
}

/** Accounts visible to this user (tenant-safe). Superadmin / platform partner ops see all. */
export async function getAccessiblePartnerAccountIds(
  userId: string,
  email: string | null | undefined,
): Promise<string[]> {
  if (await isSuperAdminUser(userId, email)) {
    const all = await prisma.partnerAccount.findMany({ select: { id: true } });
    return all.map((a) => a.id);
  }
  const platform = await prisma.platformUserRole.findFirst({
    where: { userId, role: { in: [...PARTNER_PLATFORM_ROLES] } },
    select: { id: true },
  });
  if (platform) {
    const all = await prisma.partnerAccount.findMany({ select: { id: true } });
    return all.map((a) => a.id);
  }
  const owned = await prisma.partnerAccount.findMany({
    where: { ownerUserId: userId },
    select: { id: true },
  });
  const memberRows = await prisma.partnerMember.findMany({
    where: { userId },
    select: { partnerAccountId: true },
  });
  const ids = new Set<string>();
  for (const o of owned) ids.add(o.id);
  for (const m of memberRows) ids.add(m.partnerAccountId);
  return [...ids];
}

const PARTNER_ORG_PROVISION_ROLES: PlatformRole[] = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "PARTNER_ADMIN",
  "GROWTH_ADMIN",
];

/** Create empty partner shells — platform GTM, founder bypass, or kitchen OWNER profile. */
export async function canProvisionPartnerOrganizations(
  userId: string,
  email: string | null | undefined,
  profileRole: UserRole,
): Promise<boolean> {
  if (await isSuperAdminUser(userId, email)) return true;
  if (await canAccessOwnerOnlySurfaces(userId, email, profileRole)) return true;
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: { in: PARTNER_ORG_PROVISION_ROLES } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function assertPartnerAccess() {
  const session = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (!profile) redirect("/dashboard");
  const ok = await canAccessPartnerModule(session.id, session.email ?? null, profile.role);
  if (!ok) redirect("/dashboard");
  return session;
}
