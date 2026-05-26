import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  requireStorefrontAdminPermission,
  type StorefrontAdminAccess,
  type StorefrontAdminPermission,
} from "@/lib/storefront/storefront-admin-access";

/** Permission-gated active storefront row (cookie-aware multi-store). */
export async function requireAdminStorefrontRow<T extends Prisma.StorefrontSettingsSelect>(
  permission: StorefrontAdminPermission,
  select: T,
): Promise<{ access: StorefrontAdminAccess; sf: Prisma.StorefrontSettingsGetPayload<{ select: T }> }> {
  const access = await requireStorefrontAdminPermission(permission);
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: access.storefront.id },
    select,
  });
  if (!sf) throw new Error("Storefront not found.");
  return { access, sf };
}

/** Same as {@link requireAdminStorefrontRow} but returns null instead of throwing when no access. */
export async function tryAdminStorefrontRow<T extends Prisma.StorefrontSettingsSelect>(
  userId: string,
  permission: StorefrontAdminPermission,
  select: T,
): Promise<{ access: StorefrontAdminAccess; sf: Prisma.StorefrontSettingsGetPayload<{ select: T }> } | null> {
  const { resolveStorefrontAdminAccess } = await import("@/lib/storefront/storefront-admin-access");
  const access = await resolveStorefrontAdminAccess(userId);
  if (!access.ok || !access.permissions.includes(permission)) return null;
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: access.storefront.id },
    select,
  });
  if (!sf) return null;
  return { access, sf };
}
