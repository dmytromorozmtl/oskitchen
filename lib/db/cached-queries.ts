import { cache } from "react";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { storefrontCatalogTag } from "@/lib/storefront/cache-tags";

/** Per-request workspace lookup (dedupes within one RSC tree). */
export const getCachedWorkspaceForOwner = cache(async (ownerUserId: string) => {
  return prisma.workspace.findFirst({
    where: { ownerUserId },
    select: { id: true, name: true, ownerUserId: true, timezone: true, currency: true },
  });
});

/** ISR-safe storefront row by public slug (storefront routes). */
export function getCachedStorefrontBySlug(storeSlug: string) {
  return unstable_cache(
    async () =>
      prisma.storefrontSettings.findUnique({
        where: { storeSlug },
        select: {
          id: true,
          userId: true,
          storeSlug: true,
          published: true,
          currency: true,
          activeMenuId: true,
        },
      }),
    ["storefront-by-slug", storeSlug],
    { revalidate: 60, tags: [storefrontCatalogTag(storeSlug)] },
  )();
}

/** Menu header + active product count (POS / storefront pickers). */
export const getCachedMenuSummary = cache(async (menuId: string) => {
  return prisma.menu.findUnique({
    where: { id: menuId },
    select: {
      id: true,
      title: true,
      catalogOnly: true,
      _count: { select: { products: { where: { active: true } } } },
    },
  });
});
