import type { Prisma } from "@prisma/client";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireStorefrontManageActor } from "@/lib/storefront/require-storefront-actor";
import {
  requireStorefrontAdminPermission,
  resolveStorefrontAdminAccess,
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

/**
 * Cookie-aware storefront row for draft editor mutations (`storefront.manage`).
 * Does not require a storefront admin tab permission (e.g. settings); pairs with
 * manage-gated hub tabs (pages, builder, domains, forms).
 */
export async function requireManageStorefrontRow<T extends Prisma.StorefrontSettingsSelect>(
  select: T,
  input?: { operation?: string },
): Promise<{ access: StorefrontAdminAccess; sf: Prisma.StorefrontSettingsGetPayload<{ select: T }> }> {
  const manage = await requireStorefrontManageActor({
    operation: input?.operation ?? "storefront.manage.row",
  });
  if (!manage.ok) {
    throw new Error(manage.error);
  }

  const sessionUser = await requireSessionUser();
  const access = await resolveStorefrontAdminAccess(sessionUser.id);
  if (!access.ok) {
    throw new Error(access.error);
  }

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
