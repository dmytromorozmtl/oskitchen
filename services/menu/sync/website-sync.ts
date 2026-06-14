import { prisma } from "@/lib/prisma";
import { revalidateStorefrontCatalogForOwner } from "@/lib/storefront/revalidate-shopify-market-catalog";
import type { ChannelMenuSyncInput, ChannelMenuSyncResult } from "@/lib/menu/channel-sync-types";
import { toSyncResult } from "@/lib/menu/channel-sync-types";

/** Sync a single menu item to the public website / storefront catalog. */
export async function syncMenuItemToWebsite(
  input: ChannelMenuSyncInput,
): Promise<ChannelMenuSyncResult> {
  const { userId, productId, effective } = input;

  if (!effective.enabled) {
    const updated = await prisma.product.updateMany({
      where: { id: productId, menu: { userId } },
      data: { storefrontVisible: false },
    });
    if (updated.count === 0) return toSyncResult(false, "error", "Product not found for owner.");
    await revalidateStorefrontCatalogForOwner(userId).catch(() => undefined);
    return toSyncResult(true, "synced", "Storefront visibility disabled.");
  }

  const updated = await prisma.product.updateMany({
    where: { id: productId, menu: { userId } },
    data: {
      title: effective.title,
      price: effective.price,
      category: effective.category,
      image: effective.image,
      storefrontVisible: true,
      description: effective.description,
    },
  });

  if (updated.count === 0) return toSyncResult(false, "error", "Product not found for owner.");
  await revalidateStorefrontCatalogForOwner(userId).catch(() => undefined);
  return toSyncResult(true, "synced", "Storefront catalog updated.");
}
