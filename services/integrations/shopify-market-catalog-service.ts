import type { IntegrationConnection } from "@prisma/client";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketCatalogImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  computeShopifyMarketCatalogHash,
} from "@/lib/storefront/revalidate-shopify-market-catalog";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import { gidTail } from "@/services/integrations/shopify-market-prices-service";

export type ShopifyMarketCatalogFetchResult =
  | {
      ok: true;
      shopifyCatalogId: string | null;
      shopifyPublicationId: string | null;
      externalProductIds: string[];
    }
  | { ok: false; error: string; scopeHint?: string };

const MARKET_CATALOG_QUERY = `
  query KitchenOSMarketCatalog($marketId: ID!, $catalogFirst: Int!, $productFirst: Int!) {
    market(id: $marketId) {
      id
      catalogs(first: $catalogFirst) {
        nodes {
          id
          title
          publication {
            id
            name
            products(first: $productFirst) {
              nodes {
                id
              }
            }
          }
        }
      }
    }
  }
`;

function adminEndpoint(shopDomain: string, apiVersion: string): string {
  const shop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

export function parseShopifyMarketCatalogGraphQLResponse(json: unknown): {
  shopifyMarketId: string | null;
  shopifyCatalogId: string | null;
  shopifyPublicationId: string | null;
  externalProductIds: string[];
} {
  const data =
    json && typeof json === "object" ? (json as Record<string, unknown>).data : undefined;
  const market =
    data && typeof data === "object" ? (data as Record<string, unknown>).market : undefined;
  if (!market || typeof market !== "object") {
    return {
      shopifyMarketId: null,
      shopifyCatalogId: null,
      shopifyPublicationId: null,
      externalProductIds: [],
    };
  }

  const marketRecord = market as Record<string, unknown>;
  const shopifyMarketId = typeof marketRecord.id === "string" ? marketRecord.id : null;
  const catalogs =
    marketRecord.catalogs && typeof marketRecord.catalogs === "object"
      ? (marketRecord.catalogs as Record<string, unknown>).nodes
      : undefined;

  if (!Array.isArray(catalogs) || catalogs.length === 0) {
    return {
      shopifyMarketId,
      shopifyCatalogId: null,
      shopifyPublicationId: null,
      externalProductIds: [],
    };
  }

  const catalog = catalogs[0] as Record<string, unknown>;
  const shopifyCatalogId = typeof catalog.id === "string" ? catalog.id : null;
  const publication =
    catalog.publication && typeof catalog.publication === "object"
      ? (catalog.publication as Record<string, unknown>)
      : null;
  const shopifyPublicationId =
    typeof publication?.id === "string" ? publication.id : null;
  const productNodes = publication?.products &&
    typeof publication.products === "object"
      ? (publication.products as Record<string, unknown>).nodes
      : undefined;

  const externalProductIds: string[] = [];
  if (Array.isArray(productNodes)) {
    for (const node of productNodes) {
      if (!node || typeof node !== "object") continue;
      const id = (node as Record<string, unknown>).id;
      if (typeof id === "string") externalProductIds.push(gidTail(id));
    }
  }

  return {
    shopifyMarketId,
    shopifyCatalogId,
    shopifyPublicationId,
    externalProductIds,
  };
}

export function mapExternalProductsToKitchenIds(input: {
  externalProductIds: string[];
  externalToProductId: Map<string, string>;
}): string[] {
  const productIds: string[] = [];
  const seen = new Set<string>();
  for (const externalId of input.externalProductIds) {
    const mapped = input.externalToProductId.get(externalId);
    if (!mapped || seen.has(mapped)) continue;
    seen.add(mapped);
    productIds.push(mapped);
  }
  return productIds.sort();
}

export function listCatalogImportableStorefrontMarkets(settingsCenterJson: unknown): StorefrontMarket[] {
  return parseStorefrontMarketsFromSettingsCenter(settingsCenterJson).filter(
    (market) =>
      market.enabled !== false &&
      (market.syncMode === "import" || market.syncMode === "bidirectional") &&
      Boolean(market.shopifyMarketId?.trim()),
  );
}

export async function fetchShopifyMarketCatalogPublication(
  creds: ShopifyCredentials,
  shopifyMarketId: string,
  productFirst = 250,
): Promise<ShopifyMarketCatalogFetchResult> {
  const version = creds.apiVersion ?? "2025-01";
  try {
    const res = await fetch(adminEndpoint(creds.shopDomain, version), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({
        query: MARKET_CATALOG_QUERY,
        variables: { marketId: shopifyMarketId, catalogFirst: 5, productFirst },
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
        ? "read_markets, read_products, or read_publications"
        : undefined;
      return { ok: false, error, scopeHint };
    }

    const parsed = parseShopifyMarketCatalogGraphQLResponse(json);
    return {
      ok: true,
      shopifyCatalogId: parsed.shopifyCatalogId,
      shopifyPublicationId: parsed.shopifyPublicationId,
      externalProductIds: parsed.externalProductIds,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function applyCatalogImportToMarketSettings(input: {
  userId: string;
  osMarketId: string;
  productIds: string[];
  shopifyCatalogId: string | null;
}): Promise<boolean> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  if (!kitchen?.settingsCenterJson || typeof kitchen.settingsCenterJson !== "object") {
    return false;
  }

  const root = { ...(kitchen.settingsCenterJson as Record<string, unknown>) };
  const storefront =
    root.storefront && typeof root.storefront === "object"
      ? { ...(root.storefront as Record<string, unknown>) }
      : {};
  const markets = parseStorefrontMarketsFromSettingsCenter(root);
  const index = markets.findIndex((m) => m.id === input.osMarketId);
  if (index < 0) return false;

  const market = markets[index]!;
  const shouldWriteProductIds =
    !market.productIds?.length ||
    market.catalogAuthority === "shopify" ||
    market.syncMode === "import";

  if (!shouldWriteProductIds) return false;

  const updatedMarkets = [...markets];
  updatedMarkets[index] = {
    ...market,
    productIds: input.productIds,
    shopifyCatalogId: input.shopifyCatalogId ?? market.shopifyCatalogId,
  };
  storefront.markets = updatedMarkets;
  root.storefront = storefront;

  await prisma.kitchenSettings.update({
    where: { userId: input.userId },
    data: { settingsCenterJson: toInputJsonValue(root) },
  });
  return true;
}

export async function importShopifyMarketCatalogForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  skipUnchanged?: boolean;
  applyToMarketSettings?: boolean;
}): Promise<
  | {
      ok: true;
      marketsImported: number;
      marketsUnchanged: number;
      totalProducts: number;
      imports: ShopifyMarketCatalogImportRow[];
    }
  | { ok: false; error: string }
> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  const importableMarkets = listCatalogImportableStorefrontMarkets(kitchen?.settingsCenterJson);
  if (importableMarkets.length === 0) {
    return {
      ok: false,
      error:
        "No OS Kitchen markets with syncMode=import/bidirectional and a linked Shopify market.",
    };
  }

  const externalProducts = await prisma.externalProduct.findMany({
    where: {
      connectionId: input.connection.id,
      mappedProductId: { not: null },
    },
    select: {
      externalProductId: true,
      mappedProductId: true,
    },
  });

  const externalToProductId = new Map<string, string>();
  for (const row of externalProducts) {
    if (!row.mappedProductId || !row.externalProductId) continue;
    externalToProductId.set(row.externalProductId, row.mappedProductId);
  }

  const now = new Date().toISOString();
  const imports: ShopifyMarketCatalogImportRow[] = [];
  let totalProducts = 0;
  let marketsUnchanged = 0;
  const errors: string[] = [];
  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);

  for (const market of importableMarkets) {
    const shopifyMarketId = market.shopifyMarketId!.trim();
    const fetched = await fetchShopifyMarketCatalogPublication(input.creds, shopifyMarketId);
    if (!fetched.ok) {
      errors.push(`${market.name}: ${fetched.error}`);
      continue;
    }

    const productIds = mapExternalProductsToKitchenIds({
      externalProductIds: fetched.externalProductIds,
      externalToProductId,
    });
    const catalogHash = computeShopifyMarketCatalogHash(productIds);
    const previous = current.marketCatalogImports[market.id];
    if (input.skipUnchanged && previous?.catalogHash === catalogHash) {
      marketsUnchanged += 1;
      continue;
    }

    const importRow: ShopifyMarketCatalogImportRow = {
      osMarketId: market.id,
      shopifyMarketId,
      shopifyCatalogId: fetched.shopifyCatalogId,
      shopifyPublicationId: fetched.shopifyPublicationId,
      importedAt: now,
      externalProductCount: fetched.externalProductIds.length,
      mappedProductCount: productIds.length,
      productIds,
      catalogHash,
    };
    imports.push(importRow);
    totalProducts += productIds.length;

    if (input.applyToMarketSettings !== false) {
      await applyCatalogImportToMarketSettings({
        userId: input.userId,
        osMarketId: market.id,
        productIds,
        shopifyCatalogId: fetched.shopifyCatalogId,
      });
    }
  }

  if (imports.length === 0 && marketsUnchanged === 0) {
    return {
      ok: false,
      error: errors[0] ?? "No market catalog publications imported.",
    };
  }

  const marketCatalogImports: Record<string, ShopifyMarketCatalogImportRow> = {
    ...current.marketCatalogImports,
  };
  for (const row of imports) {
    marketCatalogImports[row.osMarketId] = row;
  }

  const settings = mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
    lastCatalogImportAt: imports.length > 0 ? now : current.lastCatalogImportAt,
    catalogImportError: errors.length > 0 ? errors.join(" · ") : null,
    marketCatalogImports,
  });

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: { settingsJson: toInputJsonValue(settings) },
  });

  return {
    ok: true,
    marketsImported: imports.length,
    marketsUnchanged,
    totalProducts,
    imports,
  };
}

export function effectiveCatalogProductIdsForMarket(input: {
  market: StorefrontMarket;
  catalogImportRow: ShopifyMarketCatalogImportRow | null | undefined;
}): string[] | null {
  const configured = input.market.productIds?.filter(Boolean) ?? [];
  const imported = input.catalogImportRow?.productIds ?? [];

  if (input.market.syncMode === "import") {
    if (configured.length > 0) return configured;
    return imported.length > 0 ? imported : null;
  }

  if (input.market.syncMode === "bidirectional") {
    const authority = input.market.catalogAuthority ?? "kitchenos";
    if (authority === "shopify") return imported.length > 0 ? imported : configured.length > 0 ? configured : null;
    if (configured.length > 0) return configured;
    return imported.length > 0 ? imported : null;
  }

  return configured.length > 0 ? configured : null;
}
