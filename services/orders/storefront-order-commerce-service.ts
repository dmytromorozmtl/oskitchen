import {
  buildOrderStorefrontCommerceContext,
  marketsFromKitchenSettingsCenter,
  type OrderStorefrontCommerceContext,
} from "@/lib/storefront/order-commerce-context";
import { parseTaxSettingsFromSettingsCenter } from "@/lib/storefront/tax-settings";
import { prisma } from "@/lib/prisma";

/** Load storefront preorder commerce context for dashboard order detail (market + tax snapshot). */
export async function loadStorefrontCommerceForInternalOrder(
  userId: string,
  internalOrderId: string,
): Promise<OrderStorefrontCommerceContext | null> {
  const sfo = await prisma.storefrontOrder.findFirst({
    where: { internalOrderId, userId },
    include: {
      storefront: {
        select: { storeSlug: true, currency: true, userId: true },
      },
    },
  });

  if (!sfo?.storefront) return null;

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: sfo.storefront.userId },
    select: { settingsCenterJson: true, taxIncludedInPrices: true },
  });

  const markets = marketsFromKitchenSettingsCenter(kitchen?.settingsCenterJson);
  const taxSettings = parseTaxSettingsFromSettingsCenter(kitchen?.settingsCenterJson);

  return buildOrderStorefrontCommerceContext({
    storefrontOrder: sfo,
    storeSlug: sfo.storefront.storeSlug,
    currency: sfo.storefront.currency,
    markets,
    taxIncludedInPrices: taxSettings?.taxIncludedInPrices ?? kitchen?.taxIncludedInPrices === true,
  });
}
