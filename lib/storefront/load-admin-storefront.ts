import type { Prisma } from "@prisma/client";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  resolveStorefrontAdminAccess,
  type StorefrontAdminAccess,
} from "@/lib/storefront/storefront-admin-access";

export type AdminStorefrontContext<T extends Prisma.StorefrontSettingsSelect> =
  | { ok: false; error: string }
  | { ok: true; access: StorefrontAdminAccess; storefront: Prisma.StorefrontSettingsGetPayload<{ select: T }> };

/** Load the storefront row selected in admin (cookie / primary / workspace staff). */
export async function loadAdminStorefront<T extends Prisma.StorefrontSettingsSelect>(
  select: T,
): Promise<AdminStorefrontContext<T>> {
  const user = await requireSessionUser();
  const access = await resolveStorefrontAdminAccess(user.id);
  if (!access.ok) return { ok: false, error: access.error };

  const storefront = await prisma.storefrontSettings.findUnique({
    where: { id: access.storefront.id },
    select,
  });
  if (!storefront) return { ok: false, error: "Storefront not found." };

  return {
    ok: true,
    access,
    storefront: storefront as Prisma.StorefrontSettingsGetPayload<{ select: T }>,
  };
}

/** Resolve active admin storefront row for a user (cookie-aware). */
export async function findAdminStorefront<T extends Prisma.StorefrontSettingsSelect | undefined = undefined>(
  userId: string,
  select?: T,
): Promise<
  T extends Prisma.StorefrontSettingsSelect
    ? Prisma.StorefrontSettingsGetPayload<{ select: T }> | null
    : import("@prisma/client").StorefrontSettings | null
> {
  const access = await resolveStorefrontAdminAccess(userId);
  if (!access.ok) return null as never;
  if (select) {
    return prisma.storefrontSettings.findUnique({
      where: { id: access.storefront.id },
      select,
    }) as never;
  }
  return prisma.storefrontSettings.findUnique({
    where: { id: access.storefront.id },
  }) as never;
}

export async function findAdminStorefrontOrThrow<T extends Prisma.StorefrontSettingsSelect | undefined>(
  userId: string,
  select?: T,
) {
  const row = await findAdminStorefront(userId, select as T & Prisma.StorefrontSettingsSelect);
  if (!row) throw new Error("No storefront access.");
  return row;
}
