import { prisma } from "@/lib/prisma";
import type { ChannelMenuSyncInput, ChannelMenuSyncResult } from "@/lib/menu/channel-sync-types";
import { toSyncResult } from "@/lib/menu/channel-sync-types";

/** Sync a single menu item to the in-house POS catalog. */
export async function syncMenuItemToPos(input: ChannelMenuSyncInput): Promise<ChannelMenuSyncResult> {
  const { userId, productId, effective } = input;

  if (!effective.enabled) {
    const updated = await prisma.product.updateMany({
      where: { id: productId, menu: { userId } },
      data: { posVisible: false },
    });
    if (updated.count === 0) return toSyncResult(false, "error", "Product not found for owner.");
    return toSyncResult(true, "synced", "POS visibility disabled.");
  }

  const updated = await prisma.product.updateMany({
    where: { id: productId, menu: { userId } },
    data: {
      title: effective.title,
      price: effective.price,
      category: effective.category,
      image: effective.image,
      posVisible: true,
    },
  });

  if (updated.count === 0) return toSyncResult(false, "error", "Product not found for owner.");
  return toSyncResult(true, "synced", "POS catalog updated.");
}
