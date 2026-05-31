import {
  isShopifyMarketsB2bLocationRoutingEnabled,
  shopifyAdminGid,
} from "@/lib/commercial/shopify-market-b2b-location-routing";
import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import {
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import {
  applyB2bEnrichmentToNormalizedOrder,
  buildShopifyB2bOrderImportEnrichment,
  type ShopifyB2bOrderImportEnrichment,
} from "@/services/integrations/shopify-b2b-order-import-enrichment-service";

export type ShopifyB2bOrderRoutingHints = {
  shopifyCompanyId: string | null;
  shopifyLocationId: string | null;
  companyAccountId: string | null;
  osMarketId: string | null;
  routingSummary: string;
  resolvedAt: string;
};

function extractCompanyFromShopifyRestOrder(order: Record<string, unknown>): {
  shopifyCompanyId: string | null;
  shopifyLocationId: string | null;
} {
  const company =
    order.company && typeof order.company === "object"
      ? (order.company as Record<string, unknown>)
      : null;

  if (!company) {
    return { shopifyCompanyId: null, shopifyLocationId: null };
  }

  const companyId = company.id != null ? shopifyAdminGid("Company", String(company.id)) : null;
  const locationId =
    company.location_id != null
      ? shopifyAdminGid("CompanyLocation", String(company.location_id))
      : null;

  return {
    shopifyCompanyId: companyId || null,
    shopifyLocationId: locationId || null,
  };
}

export function resolveB2bRoutingForShopifyRestOrder(input: {
  order: Record<string, unknown>;
  marketsSync: ShopifyMarketsSyncSettings;
}): ShopifyB2bOrderRoutingHints | null {
  if (!isShopifyMarketsB2bLocationRoutingEnabled()) return null;

  const { shopifyCompanyId, shopifyLocationId } = extractCompanyFromShopifyRestOrder(input.order);
  if (!shopifyCompanyId && !shopifyLocationId) return null;

  const companyAccountIdFromCompany = shopifyCompanyId
    ? input.marketsSync.b2bCompanyLinks[shopifyCompanyId] ?? null
    : null;

  const locationLink = shopifyLocationId
    ? input.marketsSync.b2bLocationLinks[shopifyLocationId]
    : null;

  const companyAccountId =
    locationLink?.companyAccountId ?? companyAccountIdFromCompany ?? null;
  const osMarketId = locationLink?.osMarketId ?? null;

  const parts: string[] = [];
  if (shopifyCompanyId) parts.push(`company=${shopifyCompanyId}`);
  if (shopifyLocationId) parts.push(`location=${shopifyLocationId}`);
  if (companyAccountId) parts.push(`kitchenosCompany=${companyAccountId}`);
  if (osMarketId) parts.push(`market=${osMarketId}`);

  return {
    shopifyCompanyId,
    shopifyLocationId,
    companyAccountId,
    osMarketId,
    routingSummary: parts.join(" · ") || "b2b-order",
    resolvedAt: new Date().toISOString(),
  };
}

export function enrichShopifyOrderWithB2bRouting(input: {
  normalized: NormalizedKitchenOrder;
  connectionSettingsJson: unknown;
}): NormalizedKitchenOrder {
  const marketsSync = parseShopifyMarketsSyncSettings(input.connectionSettingsJson);
  const order =
    input.normalized.raw && typeof input.normalized.raw === "object"
      ? (input.normalized.raw as Record<string, unknown>)
      : null;
  if (!order) return input.normalized;

  const prior =
    order._kitchenosB2bEnrichment && typeof order._kitchenosB2bEnrichment === "object"
      ? (order._kitchenosB2bEnrichment as ShopifyB2bOrderImportEnrichment)
      : null;

  const enrichment = buildShopifyB2bOrderImportEnrichment({
    order,
    marketsSync,
    priorEnrichment: prior,
  });
  if (!enrichment) return input.normalized;

  return applyB2bEnrichmentToNormalizedOrder({
    normalized: input.normalized,
    enrichment,
  });
}

export type { ShopifyB2bOrderImportEnrichment };
