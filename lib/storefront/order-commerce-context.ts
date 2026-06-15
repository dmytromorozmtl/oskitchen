import { parseStorefrontCartSnapshot } from "@/lib/storefront/cart-snapshot";

export { parseStorefrontCartSnapshot };
import type { ComputedTaxLine } from "@/lib/storefront/tax-engine";
import {
  defaultPilotMarket,
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";

export type OrderStorefrontCommerceTotals = {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export type OrderStorefrontCommerceContext = {
  storefrontOrderId: string;
  orderNumber: string;
  publicToken: string;
  storeSlug: string;
  currency: string;
  marketId: string | null;
  marketName: string | null;
  marketPublicPath: string | null;
  taxMode: string | null;
  taxRegionCode: string | null;
  taxBreakdown: ComputedTaxLine[];
  taxIncludedInPrices: boolean;
  totals: OrderStorefrontCommerceTotals;
  paymentMode: string;
  paymentStatus: string;
  fulfillmentType: string;
  source: string | null;
  guestTrackingUrl: string;
  reorderCartUrl: string;
  schemaVersion: number | null;
};

/** Parse `storefront:market:{id}` from StorefrontOrder.source. */
export function parseMarketIdFromOrderSource(source: string | null | undefined): string | null {
  const s = source?.trim();
  if (!s) return null;
  const idx = s.indexOf(":market:");
  if (idx === -1) return null;
  const id = s.slice(idx + ":market:".length).trim();
  return id || null;
}

export function resolveMarketIdFromStorefrontOrder(input: {
  cartJson: unknown;
  source: string | null;
}): string | null {
  const parsed = parseStorefrontCartSnapshot(input.cartJson);
  return parsed.marketId ?? parseMarketIdFromOrderSource(input.source);
}

export function resolveMarketDisplay(
  marketId: string | null,
  markets: StorefrontMarket[],
  storeSlug: string,
  currency: string,
): { name: string | null; publicPath: string | null } {
  if (!marketId) return { name: null, publicPath: null };
  const found = markets.find((m) => m.id === marketId);
  const market = found ?? (marketId === "default" ? defaultPilotMarket(storeSlug, currency) : null);
  if (!market) {
    return {
      name: marketId,
      publicPath: `/s/${storeSlug}/menu?market=${encodeURIComponent(marketId)}`,
    };
  }
  return {
    name: market.name,
    publicPath: `/s/${storeSlug}/menu?market=${encodeURIComponent(market.id)}`,
  };
}

export function buildOrderStorefrontCommerceContext(input: {
  storefrontOrder: {
    id: string;
    orderNumber: string | null;
    publicToken: string;
    source: string | null;
    cartJson: unknown;
    subtotal: { toString(): string };
    tax: { toString(): string };
    deliveryFee: { toString(): string };
    discount: { toString(): string };
    total: { toString(): string };
    paymentMode: string;
    paymentStatus: string;
    fulfillmentType: string;
  };
  storeSlug: string;
  currency: string;
  markets: StorefrontMarket[];
  taxIncludedInPrices?: boolean;
}): OrderStorefrontCommerceContext {
  const { envelope, marketId: fromCart } = parseStorefrontCartSnapshot(input.storefrontOrder.cartJson);
  const marketId = fromCart ?? parseMarketIdFromOrderSource(input.storefrontOrder.source);
  const { name: marketName, publicPath: marketPublicPath } = resolveMarketDisplay(
    marketId,
    input.markets,
    input.storeSlug,
    input.currency,
  );

  const taxBreakdown = envelope?.taxBreakdown ?? [];
  const storeSlug = input.storeSlug;

  return {
    storefrontOrderId: input.storefrontOrder.id,
    orderNumber: input.storefrontOrder.orderNumber ?? "—",
    publicToken: input.storefrontOrder.publicToken,
    storeSlug,
    currency: input.currency,
    marketId,
    marketName,
    marketPublicPath,
    taxMode: envelope?.taxMode ?? null,
    taxRegionCode: envelope?.taxRegionCode ?? null,
    taxBreakdown,
    taxIncludedInPrices: input.taxIncludedInPrices === true,
    totals: {
      subtotal: Number(input.storefrontOrder.subtotal),
      tax: Number(input.storefrontOrder.tax),
      deliveryFee: Number(input.storefrontOrder.deliveryFee),
      discount: Number(input.storefrontOrder.discount),
      total: Number(input.storefrontOrder.total),
    },
    paymentMode: input.storefrontOrder.paymentMode,
    paymentStatus: input.storefrontOrder.paymentStatus,
    fulfillmentType: input.storefrontOrder.fulfillmentType,
    source: input.storefrontOrder.source,
    guestTrackingUrl: `/s/${storeSlug}/order/${input.storefrontOrder.publicToken}`,
    reorderCartUrl: `/s/${storeSlug}/cart${marketId ? `?market=${encodeURIComponent(marketId)}` : ""}`,
    schemaVersion: envelope?.schemaVersion ?? null,
  };
}

export function marketsFromKitchenSettingsCenter(settingsCenterJson: unknown): StorefrontMarket[] {
  return parseStorefrontMarketsFromSettingsCenter(settingsCenterJson);
}
