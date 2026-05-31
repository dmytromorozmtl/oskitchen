import type { IntegrationConnection } from "@prisma/client";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketCatalogExportRow,
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
import {
  fetchShopifyMarketCatalogPublication,
  mapExternalProductsToKitchenIds,
} from "@/services/integrations/shopify-market-catalog-service";
import { gidTail } from "@/services/integrations/shopify-market-prices-service";

export const SHOPIFY_MARKETS_CATALOG_PUSH_DEBOUNCE_MS = 30_000;

const PUBLISHABLE_PUBLISH = `
  mutation KitchenOSPublishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Product {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PUBLISHABLE_UNPUBLISH = `
  mutation KitchenOSPublishableUnpublish($id: ID!, $input: [PublicationInput!]!) {
    publishableUnpublish(id: $id, input: $input) {
      publishable {
        ... on Product {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function adminEndpoint(shopDomain: string, apiVersion: string): string {
  const shop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

function toShopifyProductGid(externalProductId: string): string {
  const trimmed = externalProductId.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("gid://")) return trimmed;
  return `gid://shopify/Product/${trimmed}`;
}

export function listCatalogPushableStorefrontMarkets(settingsCenterJson: unknown): StorefrontMarket[] {
  return parseStorefrontMarketsFromSettingsCenter(settingsCenterJson).filter((market) => {
    if (market.enabled === false || !market.shopifyMarketId?.trim()) return false;
    if (market.syncMode === "push") return true;
    if (market.syncMode === "bidirectional") {
      return (market.catalogAuthority ?? "kitchenos") === "kitchenos";
    }
    return false;
  });
}

export function isShopifyMarketsCatalogPushDebounced(
  lastTriggeredAt: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!lastTriggeredAt) return false;
  const elapsed = nowMs - new Date(lastTriggeredAt).getTime();
  return elapsed >= 0 && elapsed < SHOPIFY_MARKETS_CATALOG_PUSH_DEBOUNCE_MS;
}

export async function resolveKitchenosCatalogProductIds(input: {
  userId: string;
  market: StorefrontMarket;
}): Promise<string[]> {
  if (input.market.productIds?.length) {
    return [...input.market.productIds];
  }

  const sf = await prisma.storefrontSettings.findFirst({
    where: { userId: input.userId },
    select: { activeMenuId: true },
  });
  const menuId = input.market.activeMenuId ?? sf?.activeMenuId;
  if (!menuId) return [];

  const menuProducts = await prisma.product.findMany({
    where: { menuId, active: true },
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });
  return menuProducts.map((row) => row.id);
}

async function mutatePublication(input: {
  creds: ShopifyCredentials;
  mutation: string;
  productGid: string;
  publicationId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const version = input.creds.apiVersion ?? "2025-01";
  const res = await fetch(adminEndpoint(input.creds.shopDomain, version), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": input.creds.adminAccessToken,
    },
    body: JSON.stringify({
      query: input.mutation,
      variables: {
        id: input.productGid,
        input: [{ publicationId: input.publicationId }],
      },
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    data?: Record<string, unknown>;
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok) return { ok: false, error: `Shopify Admin API HTTP ${res.status}` };
  if (json.errors?.length) {
    return { ok: false, error: json.errors.map((e) => e.message).join("; ") };
  }

  const root = json.data?.publishablePublish ?? json.data?.publishableUnpublish;
  if (root && typeof root === "object") {
    const userErrors = (root as Record<string, unknown>).userErrors;
    if (Array.isArray(userErrors) && userErrors.length > 0) {
      return {
        ok: false,
        error: userErrors
          .map((row) => (row && typeof row === "object" ? (row as { message?: string }).message : null))
          .filter(Boolean)
          .join("; "),
      };
    }
  }

  return { ok: true };
}

export async function pushShopifyMarketCatalogForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  productIds?: string[];
  skipUnchanged?: boolean;
  respectDebounce?: boolean;
}): Promise<
  | {
      ok: true;
      marketsPushed: number;
      marketsUnchanged: number;
      publishedCount: number;
      unpublishedCount: number;
      skippedReason?: string;
    }
  | { ok: false; error: string; skippedReason?: string }
> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  const pushableMarkets = listCatalogPushableStorefrontMarkets(kitchen?.settingsCenterJson);
  if (pushableMarkets.length === 0) {
    return {
      ok: false,
      error: "No OS Kitchen markets with catalog push enabled.",
    };
  }

  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  if (
    input.respectDebounce &&
    isShopifyMarketsCatalogPushDebounced(current.lastCatalogPushTriggeredAt)
  ) {
    return {
      ok: true,
      marketsPushed: 0,
      marketsUnchanged: 0,
      publishedCount: 0,
      unpublishedCount: 0,
      skippedReason: "debounced",
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

  const productToExternal = new Map<string, string>();
  const externalToProduct = new Map<string, string>();
  for (const row of externalProducts) {
    if (!row.mappedProductId || !row.externalProductId) continue;
    productToExternal.set(row.mappedProductId, row.externalProductId);
    externalToProduct.set(row.externalProductId, row.mappedProductId);
  }

  const now = new Date().toISOString();
  let marketsPushed = 0;
  let marketsUnchanged = 0;
  let publishedCount = 0;
  let unpublishedCount = 0;
  const errors: string[] = [];
  const marketCatalogExports: Record<string, ShopifyMarketCatalogExportRow> = {
    ...current.marketCatalogExports,
  };

  for (const market of pushableMarkets) {
    const shopifyMarketId = market.shopifyMarketId!.trim();
    const fetched = await fetchShopifyMarketCatalogPublication(input.creds, shopifyMarketId);
    if (!fetched.ok) {
      errors.push(`${market.name}: ${fetched.error}`);
      continue;
    }
    if (!fetched.shopifyPublicationId) {
      errors.push(`${market.name}: no publication on market catalog.`);
      continue;
    }

    let targetProductIds = await resolveKitchenosCatalogProductIds({
      userId: input.userId,
      market,
    });
    if (input.productIds?.length) {
      const filter = new Set(input.productIds);
      targetProductIds = targetProductIds.filter((id) => filter.has(id));
    }

    const targetExternal = targetProductIds
      .map((id) => productToExternal.get(id))
      .filter(Boolean) as string[];
    const targetExternalSet = new Set(targetExternal);
    const shopifyExternalSet = new Set(fetched.externalProductIds);

    const toPublish = targetExternal.filter((id) => !shopifyExternalSet.has(id));
    const toUnpublish = fetched.externalProductIds.filter((id) => !targetExternalSet.has(id));

    const catalogHash = computeShopifyMarketCatalogHash(
      mapExternalProductsToKitchenIds({
        externalProductIds: targetExternal,
        externalToProductId: externalToProduct,
      }),
    );
    const previous = current.marketCatalogExports[market.id];
    if (
      input.skipUnchanged &&
      previous?.catalogHash === catalogHash &&
      toPublish.length === 0 &&
      toUnpublish.length === 0
    ) {
      marketsUnchanged += 1;
      continue;
    }

    for (const externalProductId of toPublish) {
      const result = await mutatePublication({
        creds: input.creds,
        mutation: PUBLISHABLE_PUBLISH,
        productGid: toShopifyProductGid(externalProductId),
        publicationId: fetched.shopifyPublicationId,
      });
      if (result.ok) publishedCount += 1;
      else errors.push(`${market.name} publish ${externalProductId}: ${result.error}`);
    }

    for (const externalProductId of toUnpublish) {
      const result = await mutatePublication({
        creds: input.creds,
        mutation: PUBLISHABLE_UNPUBLISH,
        productGid: toShopifyProductGid(externalProductId),
        publicationId: fetched.shopifyPublicationId,
      });
      if (result.ok) unpublishedCount += 1;
      else errors.push(`${market.name} unpublish ${externalProductId}: ${result.error}`);
    }

    marketCatalogExports[market.id] = {
      osMarketId: market.id,
      shopifyMarketId,
      shopifyPublicationId: fetched.shopifyPublicationId,
      pushedAt: now,
      publishedCount: toPublish.length,
      unpublishedCount: toUnpublish.length,
      catalogHash,
    };
    marketsPushed += 1;
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastCatalogPushAt: marketsPushed > 0 ? now : current.lastCatalogPushAt,
          lastCatalogPushError: errors.length > 0 ? errors.join(" · ") : null,
          lastCatalogPushTriggeredAt: now,
          lastCatalogPushSkippedReason: null,
          marketCatalogExports,
        }),
      ),
    },
  });

  if (marketsPushed === 0 && marketsUnchanged === 0) {
    return { ok: false, error: errors[0] ?? "No catalog publications pushed." };
  }

  return {
    ok: true,
    marketsPushed,
    marketsUnchanged,
    publishedCount,
    unpublishedCount,
    skippedReason: errors.length > 0 ? errors.join(" · ") : undefined,
  };
}
