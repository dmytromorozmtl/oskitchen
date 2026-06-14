import { prisma } from "@/lib/prisma";
import type { ChannelMenuSyncInput, ChannelMenuSyncResult } from "@/lib/menu/channel-sync-types";
import { toSyncResult } from "@/lib/menu/channel-sync-types";

/**
 * Sync a single menu item to self-service kiosk terminals.
 * Kiosk shares POS catalog visibility in v1 — dedicated kiosk flags can follow in UI cycle 10.
 */
export async function syncMenuItemToKiosk(
  input: ChannelMenuSyncInput,
): Promise<ChannelMenuSyncResult> {
  const { userId, productId, effective } = input;

  if (!effective.enabled) {
    const updated = await prisma.product.updateMany({
      where: { id: productId, menu: { userId } },
      data: { posVisible: false },
    });
    if (updated.count === 0) return toSyncResult(false, "error", "Product not found for owner.");
    return toSyncResult(true, "synced", "Kiosk item hidden (POS visibility off).");
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
  return toSyncResult(true, "synced", "Kiosk catalog updated.");
}
