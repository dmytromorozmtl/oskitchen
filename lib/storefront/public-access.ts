import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifyStorefrontPreviewToken } from "@/lib/storefront/preview-token";

const storefrontInclude = {
  activeMenu: {
    include: {
      products: {
        where: { active: true, storefrontVisible: true },
        orderBy: { sortOrder: "asc" as const },
        include: {
          nutritionProfile: true,
          allergenProfile: true,
          ingredientDeclaration: true,
        },
      },
    },
  },
  publicContactForm: true,
  publicCateringForm: true,
  navigation: true,
  footer: true,
} satisfies Prisma.StorefrontSettingsInclude;

export type StorefrontPublicPayload = Prisma.StorefrontSettingsGetPayload<{
  include: typeof storefrontInclude;
}>;

export function isStorefrontInClosureWindow(sf: {
  closureEnabled: boolean;
  closureStartDate: Date | null;
  closureEndDate: Date | null;
}): boolean {
  if (!sf.closureEnabled) return false;
  const now = new Date();
  const start = sf.closureStartDate ? new Date(sf.closureStartDate) : null;
  const end = sf.closureEndDate ? new Date(sf.closureEndDate) : null;
  if (start && now < start) return false;
  if (end) {
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);
    if (now > endDay) return false;
  }
  if (start && end) {
    return now >= start && now <= new Date(new Date(end).setHours(23, 59, 59, 999));
  }
  if (start && !end) return now >= start;
  if (!start && end) return now <= new Date(new Date(end).setHours(23, 59, 59, 999));
  return true;
}

/**
 * Load storefront for public (and owner draft when the viewer is the merchant).
 * Strangers only see `enabled && published` storefronts unless a valid short-lived preview token is supplied.
 */
export async function getStorefrontForPublic(
  storeSlug: string,
  opts?: { viewerUserId?: string | null; previewToken?: string | null },
): Promise<StorefrontPublicPayload | null> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug },
    include: storefrontInclude,
  });
  if (!sf?.enabled) return null;
  const preview = opts?.previewToken ? verifyStorefrontPreviewToken(opts.previewToken, storeSlug) : null;
  const previewOk = Boolean(preview && preview.ownerUserId === sf.userId);
  const ownerSeesDraft = Boolean(opts?.viewerUserId && opts.viewerUserId === sf.userId && !sf.published);
  if (!sf.published && !ownerSeesDraft && !previewOk) return null;
  if (sf.activeMenu?.catalogOnly) {
    return { ...sf, activeMenuId: null, activeMenu: null } as StorefrontPublicPayload;
  }
  return sf;
}

/** @deprecated Use {@link getStorefrontForPublicFromRequest} — kept for backwards compatibility. */
export async function getPublishedStorefront(storeSlug: string) {
  return getStorefrontForPublicFromRequest(storeSlug);
}

export async function getStorefrontForPublicFromRequest(
  storeSlug: string,
  viewerUserId?: string | null,
): Promise<StorefrontPublicPayload | null> {
  const { readStorefrontPreviewCookie } = await import("@/lib/storefront/preview-cookie-server");
  const previewToken = await readStorefrontPreviewCookie();
  return getStorefrontForPublic(storeSlug, { viewerUserId: viewerUserId ?? null, previewToken });
}
