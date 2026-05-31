import type { IntegrationConnection } from "@prisma/client";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketPriceImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  computeShopifyMarketPriceHash,
} from "@/lib/storefront/revalidate-shopify-market-catalog";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";

export type ShopifyMarketPriceNode = {
  externalProductId: string;
  externalVariantId: string;
  price: string;
  currencyCode: string | null;
};

export type ShopifyMarketPricesFetchResult =
  | { ok: true; prices: ShopifyMarketPriceNode[]; priceListId: string | null }
  | { ok: false; error: string; scopeHint?: string };

function adminEndpoint(shopDomain: string, apiVersion: string): string {
  const shop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

export function gidTail(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? gid;
}

const MARKET_PRICES_QUERY = `
  query KitchenOSMarketPrices($marketId: ID!, $first: Int!) {
    market(id: $marketId) {
      id
      name
      priceList {
        id
        prices(first: $first) {
          nodes {
            price {
              amount
              currencyCode
            }
            variant {
              id
              sku
              product {
                id
              }
            }
          }
        }
      }
    }
  }
`;

type GraphQLPriceNode = {
  price?: { amount?: string | null; currencyCode?: string | null } | null;
  variant?: {
    id?: string | null;
    sku?: string | null;
    product?: { id?: string | null } | null;
  } | null;
};

export function parseShopifyMarketPricesGraphQLResponse(json: unknown): {
  shopifyMarketId: string | null;
  priceListId: string | null;
  prices: ShopifyMarketPriceNode[];
} {
  const data =
    json && typeof json === "object" ? (json as Record<string, unknown>).data : undefined;
  const market =
    data && typeof data === "object" ? (data as Record<string, unknown>).market : undefined;
  if (!market || typeof market !== "object") {
    return { shopifyMarketId: null, priceListId: null, prices: [] };
  }

  const marketRecord = market as Record<string, unknown>;
  const shopifyMarketId = typeof marketRecord.id === "string" ? marketRecord.id : null;
  const priceList =
    marketRecord.priceList && typeof marketRecord.priceList === "object"
      ? (marketRecord.priceList as Record<string, unknown>)
      : null;
  const priceListId = typeof priceList?.id === "string" ? priceList.id : null;
  const nodes =
    priceList?.prices && typeof priceList.prices === "object"
      ? (priceList.prices as Record<string, unknown>).nodes
      : undefined;

  if (!Array.isArray(nodes)) {
    return { shopifyMarketId, priceListId, prices: [] };
  }

  const prices: ShopifyMarketPriceNode[] = [];
  for (const raw of nodes) {
    if (!raw || typeof raw !== "object") continue;
    const node = raw as GraphQLPriceNode;
    const variantId = node.variant?.id;
    const productId = node.variant?.product?.id;
    const amount = node.price?.amount;
    if (!variantId || !productId || amount == null) continue;
    prices.push({
      externalProductId: gidTail(String(productId)),
      externalVariantId: gidTail(String(variantId)),
      price: String(amount),
      currencyCode: node.price?.currencyCode?.trim() || null,
    });
  }

  return { shopifyMarketId, priceListId, prices };
}

export function mergeVariantPricesIntoProductMap(
  variantPrices: ShopifyMarketPriceNode[],
  variantToProductId: Map<string, string>,
): Record<string, string> {
  const productPrices: Record<string, string> = {};
  for (const row of variantPrices) {
    const mappedProductId = variantToProductId.get(row.externalVariantId);
    if (!mappedProductId) continue;
    const next = Number(row.price);
    if (!Number.isFinite(next)) continue;
    const existing = productPrices[mappedProductId];
    if (!existing) {
      productPrices[mappedProductId] = row.price;
      continue;
    }
    if (next < Number(existing)) {
      productPrices[mappedProductId] = row.price;
    }
  }
  return productPrices;
}

export async function fetchShopifyMarketPriceList(
  creds: ShopifyCredentials,
  shopifyMarketId: string,
  first = 250,
): Promise<ShopifyMarketPricesFetchResult> {
  const version = creds.apiVersion ?? "2025-01";
  try {
    const res = await fetch(adminEndpoint(creds.shopDomain, version), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({
        query: MARKET_PRICES_QUERY,
        variables: { marketId: shopifyMarketId, first },
      }),
      cache: "no-store",
    });

    const json = (await res.json()) as {
      data?: unknown;
      errors?: Array<{ message?: string }>;
    };

    if (!res.ok) {
      return { ok: false, error: `Shopify Admin API HTTP ${res.status}` };
    }

    if (json.errors?.length) {
      const error = json.errors.map((e) => e.message).join("; ");
      const scopeHint = /access denied|not authorized|scope/i.test(error)
        ? "read_markets or read_products"
        : undefined;
      return { ok: false, error, scopeHint };
    }

    const parsed = parseShopifyMarketPricesGraphQLResponse(json);
    return {
      ok: true,
      prices: parsed.prices,
      priceListId: parsed.priceListId,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export function listImportableStorefrontMarkets(settingsCenterJson: unknown): StorefrontMarket[] {
  return parseStorefrontMarketsFromSettingsCenter(settingsCenterJson).filter(
    (market) =>
      market.enabled !== false &&
      market.syncMode === "import" &&
      Boolean(market.shopifyMarketId?.trim()),
  );
}

export async function importShopifyMarketPricesForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  skipUnchanged?: boolean;
}): Promise<
  | {
      ok: true;
      marketsImported: number;
      marketsUnchanged: number;
      totalProductPrices: number;
      imports: ShopifyMarketPriceImportRow[];
    }
  | { ok: false; error: string }
> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  const importableMarkets = listImportableStorefrontMarkets(kitchen?.settingsCenterJson);
  if (importableMarkets.length === 0) {
    return {
      ok: false,
      error:
        "No OS Kitchen markets with syncMode=import and a linked Shopify market. Configure on Storefront → Markets.",
    };
  }

  const externalProducts = await prisma.externalProduct.findMany({
    where: {
      connectionId: input.connection.id,
      mappedProductId: { not: null },
    },
    select: {
      externalVariantId: true,
      mappedProductId: true,
    },
  });

  const variantToProductId = new Map<string, string>();
  for (const row of externalProducts) {
    if (!row.mappedProductId || !row.externalVariantId) continue;
    variantToProductId.set(row.externalVariantId, row.mappedProductId);
  }

  const now = new Date().toISOString();
  const imports: ShopifyMarketPriceImportRow[] = [];
  let totalProductPrices = 0;
  let marketsUnchanged = 0;
  const errors: string[] = [];
  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);

  for (const market of importableMarkets) {
    const shopifyMarketId = market.shopifyMarketId!.trim();
    const fetched = await fetchShopifyMarketPriceList(input.creds, shopifyMarketId);
    if (!fetched.ok) {
      errors.push(`${market.name}: ${fetched.error}`);
      continue;
    }

    const productPrices = mergeVariantPricesIntoProductMap(fetched.prices, variantToProductId);
    const priceHash = computeShopifyMarketPriceHash(productPrices);
    const previous = current.marketPriceImports[market.id];
    if (input.skipUnchanged && previous?.priceHash === priceHash) {
      marketsUnchanged += 1;
      continue;
    }

    const currencyCode =
      fetched.prices.find((p) => p.currencyCode)?.currencyCode ??
      market.currency ??
      null;

    const importRow: ShopifyMarketPriceImportRow = {
      osMarketId: market.id,
      shopifyMarketId,
      shopifyPriceListId: fetched.priceListId,
      currencyCode,
      importedAt: now,
      variantCount: fetched.prices.length,
      mappedProductCount: Object.keys(productPrices).length,
      productPrices,
      priceHash,
    };
    imports.push(importRow);
    totalProductPrices += Object.keys(productPrices).length;
  }

  if (imports.length === 0 && marketsUnchanged === 0) {
    return {
      ok: false,
      error: errors[0] ?? "No market prices imported.",
    };
  }

  const marketPriceImports: Record<string, ShopifyMarketPriceImportRow> = {
    ...current.marketPriceImports,
  };
  for (const row of imports) {
    marketPriceImports[row.osMarketId] = row;
  }

  const settings = mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
    lastPriceImportAt: imports.length > 0 ? now : current.lastPriceImportAt,
    priceImportError: errors.length > 0 ? errors.join(" · ") : null,
    marketPriceImports,
  });

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: { settingsJson: toInputJsonValue(settings) },
  });

  return {
    ok: true,
    marketsImported: imports.length,
    marketsUnchanged,
    totalProductPrices,
    imports,
  };
}

export function productPriceOverridesFromImportRow(
  row: ShopifyMarketPriceImportRow | null | undefined,
): Map<string, number> {
  const map = new Map<string, number>();
  if (!row) return map;
  for (const [productId, priceStr] of Object.entries(row.productPrices)) {
    const price = Number(priceStr);
    if (Number.isFinite(price)) map.set(productId, price);
  }
  return map;
}
