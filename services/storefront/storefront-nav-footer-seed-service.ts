import { prisma } from "@/lib/prisma";
import {
  buildDefaultStorefrontFooterBlocks,
  buildDefaultStorefrontNavigationItems,
} from "@/lib/storefront/default-nav-footer";

/** Idempotent: creates navigation + footer rows when missing (on first storefront save). */
export async function ensureStorefrontNavFooterDefaults(storefrontId: string, storeSlug: string): Promise<void> {
  const [nav, footer] = await Promise.all([
    prisma.storefrontNavigation.findUnique({ where: { storefrontId } }),
    prisma.storefrontFooter.findUnique({ where: { storefrontId } }),
  ]);

  if (!nav) {
    await prisma.storefrontNavigation.create({
      data: {
        storefrontId,
        itemsJson: buildDefaultStorefrontNavigationItems() as object,
      },
    });
  }

  if (!footer) {
    await prisma.storefrontFooter.create({
      data: {
        storefrontId,
        blocksJson: buildDefaultStorefrontFooterBlocks(storeSlug) as object,
      },
    });
  }
}
