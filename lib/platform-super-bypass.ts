import { prisma } from "@/lib/prisma";

/**
 * Billing / feature bypass resolution — no imports from `lib/billing/access` (breaks cycles).
 * Runtime checks require a persisted `SUPER_ADMIN` platform role row.
 */
export async function isSuperAdminUser(
  userId: string,
  _email?: string | null,
): Promise<boolean> {
  return hasSuperAdminRoleRow(userId);
}

export async function hasSuperAdminRoleRow(userId: string): Promise<boolean> {
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: "SUPER_ADMIN" },
    select: { id: true },
  });
  return Boolean(row);
}
