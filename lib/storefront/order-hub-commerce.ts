import {
  parseMarketIdFromOrderSource,
  parseStorefrontCartSnapshot,
  resolveMarketDisplay,
  type OrderStorefrontCommerceTotals,
} from "@/lib/storefront/order-commerce-context";
import { parseStorefrontMarketsFromSettingsCenter } from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";

/** Lightweight row for Order Hub list badges and CSV export. */
export type OrderHubStorefrontSummary = {
  internalOrderId: string;
  storefrontOrderId: string;
  orderNumber: string;
  storeSlug: string;
  publicToken: string;
  paymentMode: string;
  paymentStatus: string;
  currency: string;
  marketId: string | null;
  marketName: string | null;
  taxMode: string | null;
  taxRegionCode: string | null;
  taxTotal: number;
  taxBreakdownJson: string | null;
  schemaVersion: number | null;
  source: string | null;
  totals: OrderStorefrontCommerceTotals;
};

export async function loadStorefrontSummariesForOrderIds(
  userId: string,
  internalOrderIds: string[],
): Promise<Map<string, OrderHubStorefrontSummary>> {
  const map = new Map<string, OrderHubStorefrontSummary>();
  if (internalOrderIds.length === 0) return map;

  const rows = await prisma.storefrontOrder.findMany({
    where: {
      userId,
      internalOrderId: { in: internalOrderIds },
    },
    select: {
      id: true,
      internalOrderId: true,
      orderNumber: true,
      publicToken: true,
      paymentMode: true,
      paymentStatus: true,
      source: true,
      cartJson: true,
      subtotal: true,
      tax: true,
      deliveryFee: true,
      discount: true,
      total: true,
      storefront: {
        select: { storeSlug: true, currency: true, userId: true },
      },
    },
  });

  if (rows.length === 0) return map;

  const ownerId = rows[0]?.storefront?.userId;
  const kitchen =
    ownerId != null
      ? await prisma.kitchenSettings.findUnique({
          where: { userId: ownerId },
          select: { settingsCenterJson: true },
        })
      : null;
  const markets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);

  for (const row of rows) {
    if (!row.internalOrderId || !row.storefront) continue;
    const { envelope, marketId: fromCart } = parseStorefrontCartSnapshot(row.cartJson);
    const marketId = fromCart ?? parseMarketIdFromOrderSource(row.source);
    const { name: marketName } = resolveMarketDisplay(
      marketId,
      markets,
      row.storefront.storeSlug,
      row.storefront.currency,
    );
    map.set(row.internalOrderId, {
      internalOrderId: row.internalOrderId,
      storefrontOrderId: row.id,
      orderNumber: row.orderNumber ?? "—",
      storeSlug: row.storefront.storeSlug,
      publicToken: row.publicToken,
      paymentMode: row.paymentMode,
      paymentStatus: row.paymentStatus,
      currency: row.storefront.currency,
      marketId,
      marketName,
      taxMode: envelope?.taxMode ?? null,
      taxRegionCode: envelope?.taxRegionCode ?? null,
      taxTotal: Number(row.tax),
      taxBreakdownJson: envelope?.taxBreakdown?.length
        ? JSON.stringify(envelope.taxBreakdown)
        : null,
      schemaVersion: envelope?.schemaVersion ?? null,
      source: row.source,
      totals: {
        subtotal: Number(row.subtotal),
        tax: Number(row.tax),
        deliveryFee: Number(row.deliveryFee),
        discount: Number(row.discount),
        total: Number(row.total),
      },
    });
  }

  return map;
}
