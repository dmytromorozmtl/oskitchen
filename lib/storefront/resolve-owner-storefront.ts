import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { readAdminStorefrontCookie } from "@/lib/storefront/storefront-admin-cookie";
import { storefrontSettingsListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type OwnerStorefrontSummary = {
  id: string;
  storeSlug: string;
  publicName: string;
  isPrimary: boolean;
  brandId: string | null;
  workspaceId: string | null;
};

const primaryOrder: Prisma.StorefrontSettingsOrderByWithRelationInput[] = [
  { isPrimary: "desc" },
  { updatedAt: "desc" },
];

/** Primary storefront for an owner (isPrimary, else most recently updated). */
export async function getPrimaryOwnerStorefront(userId: string) {
  const where = await storefrontSettingsListWhereForOwner(userId);
  return prisma.storefrontSettings.findFirst({
    where,
    orderBy: primaryOrder,
  });
}

export async function listOwnerStorefronts(userId: string): Promise<OwnerStorefrontSummary[]> {
  const where = await storefrontSettingsListWhereForOwner(userId);
  const rows = await prisma.storefrontSettings.findMany({
    where,
    select: {
      id: true,
      storeSlug: true,
      publicName: true,
      isPrimary: true,
      brandId: true,
      workspaceId: true,
    },
    orderBy: [{ isPrimary: "desc" }, { storeSlug: "asc" }],
  });
  return rows;
}

/** Resolve owned storefront by id or cookie preference. */
export async function resolveOwnerStorefront(
  userId: string,
  preferredStorefrontId?: string | null,
) {
  const scoped = await storefrontSettingsListWhereForOwner(userId);
  const pick = async (id: string) =>
    prisma.storefrontSettings.findFirst({
      where: { AND: [scoped, { id }] },
    });

  if (preferredStorefrontId) {
    const match = await pick(preferredStorefrontId);
    if (match) return match;
  }

  const cookieId = await readAdminStorefrontCookie();
  if (cookieId) {
    const match = await pick(cookieId);
    if (match) return match;
  }

  return getPrimaryOwnerStorefront(userId);
}