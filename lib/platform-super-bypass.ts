import { prisma } from "@/lib/prisma";
import { isSuperAdminEmail } from "@/lib/platform-owner";

/**
 * Billing / feature bypass resolution — no imports from `lib/billing/access` (breaks cycles).
 */
export async function isSuperAdminUser(
  userId: string,
  email?: string | null,
): Promise<boolean> {
  if (isSuperAdminEmail(email)) return true;
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (isSuperAdminEmail(profile?.email)) return true;
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: "SUPER_ADMIN" },
    select: { id: true },
  });
  return Boolean(row);
}

export async function hasSuperAdminRoleRow(userId: string): Promise<boolean> {
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: "SUPER_ADMIN" },
    select: { id: true },
  });
  return Boolean(row);
}
