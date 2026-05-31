import { createHash } from "crypto";

import type { IntegrationConnection } from "@prisma/client";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketPriceExportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import {
  fetchShopifyMarketPriceList,
  gidTail,
  toShopifyPriceListGid,
  toShopifyVariantGid,
} from "@/services/integrations/shopify-market-prices-service";

export type ShopifyMarketPushPriceInput = {
  externalVariantId: string;
  variantGid: string;
  productId: string;
  amount: string;
  currencyCode: string;
};

export type ShopifyMarketPushMutationResult =
  | { ok: true; priceListId: string; variantsUpdated: number }
  | { ok: false; error: string; scopeHint?: string };

export const SHOPIFY_MARKETS_PUSH_DEBOUNCE_MS = 30_000;
export const SHOPIFY_MARKETS_PUSH_BATCH_SIZE = 50;

const PRICE_LIST_FIXED_PRICES_UPDATE = `
  mutation KitchenOSPriceListFixedPricesUpdate(
    $priceListId: ID!
    $pricesToAdd: [PriceListPriceInput!]!
    $pricesToDeleteByVariantId: [ID!]!
  ) {
    priceListFixedPricesUpdate(
      priceListId: $priceListId
      pricesToAdd: $pricesToAdd
      pricesToDeleteByVariantId: $pricesToDeleteByVariantId
    ) {
      priceList {
        id
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

export function listPushableStorefrontMarkets(settingsCenterJson: unknown): StorefrontMarket[] {
  return parseStorefrontMarketsFromSettingsCenter(settingsCenterJson).filter(
    (market) =>
      market.enabled !== false &&
      market.syncMode === "push" &&
      Boolean(market.shopifyMarketId?.trim()),
  );
}

export function isShopifyMarketsPushDebounced(
  lastTriggeredAt: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!lastTriggeredAt) return false;
  const elapsed = nowMs - new Date(lastTriggeredAt).getTime();
  return elapsed >= 0 && elapsed < SHOPIFY_MARKETS_PUSH_DEBOUNCE_MS;
}

export function computeShopifyMarketPushPriceHash(
  prices: Array<{ variantGid: string; amount: string }>,
): string {
  const canonical = prices
    .map((row) => `${gidTail(row.variantGid)}:${row.amount}`)
    .sort()
    .join("|");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

export function buildPushPricesForMarket(input: {
  market: StorefrontMarket;
  externalProducts: Array<{
    externalVariantId: string;
    mappedProductId: string | null;
  }>;
  productPrices: Map<string, string>;
}): ShopifyMarketPushPriceInput[] {
  const currencyCode = (input.market.currency ?? "USD").trim().toUpperCase();
  const prices: ShopifyMarketPushPriceInput[] = [];

  for (const row of input.externalProducts) {
    if (!row.mappedProductId || !row.externalVariantId.trim()) continue;
    const amount = input.productPrices.get(row.mappedProductId);
    if (!amount) continue;
    const variantGid = toShopifyVariantGid(row.externalVariantId);
    prices.push({
      externalVariantId: gidTail(row.externalVariantId),
      variantGid,
      productId: row.mappedProductId,
      amount,
      currencyCode,
    });
  }

  return prices.sort((a, b) => a.externalVariantId.localeCompare(b.externalVariantId));
}

export function parseShopifyPriceListFixedPricesUpdateResponse(json: unknown): {
  priceListId: string | null;
  userErrors: string[];
} {
  const data =
    json && typeof json === "object" ? (json as Record<string, unknown>).data : undefined;
  const payload =
    data && typeof data === "object"
      ? (data as Record<string, unknown>).priceListFixedPricesUpdate
      : undefined;
  if (!payload || typeof payload !== "object") {
    return { priceListId: null, userErrors: ["Missing priceListFixedPricesUpdate payload"] };
  }

  const record = payload as Record<string, unknown>;
  const priceList =
    record.priceList && typeof record.priceList === "object"
      ? (record.priceList as Record<string, unknown>)
      : null;
  const priceListId = typeof priceList?.id === "string" ? priceList.id : null;
  const userErrors = Array.isArray(record.userErrors)
    ? record.userErrors
        .map((row) =>
          row && typeof row === "object" && typeof (row as { message?: unknown }).message === "string"
            ? String((row as { message: string }).message)
            : null,
        )
        .filter((msg): msg is string => Boolean(msg))
    : [];

  return { priceListId, userErrors };
}

export async function resolveShopifyPriceListId(input: {
  creds: ShopifyCredentials;
  shopifyMarketId: string;
  osMarketId: string;
  syncSettings: ReturnType<typeof parseShopifyMarketsSyncSettings>;
  market: StorefrontMarket;
}): Promise<string | null> {
  const cached =
    input.syncSettings.marketPriceExports[input.osMarketId]?.shopifyPriceListId ??
    input.syncSettings.marketPriceImports[input.osMarketId]?.shopifyPriceListId ??
    input.market.shopifyPriceListId ??
    null;
  if (cached?.trim()) return toShopifyPriceListGid(cached);

  const fetched = await fetchShopifyMarketPriceList(input.creds, input.shopifyMarketId, 1);
  if (!fetched.ok || !fetched.priceListId) return null;
  return toShopifyPriceListGid(fetched.priceListId);
}

export async function pushShopifyMarketPriceBatch(
  creds: ShopifyCredentials,
  priceListId: string,
  prices: ShopifyMarketPushPriceInput[],
): Promise<ShopifyMarketPushMutationResult> {
  if (prices.length === 0) {
    return { ok: false, error: "No variant prices to push." };
  }

  const version = creds.apiVersion ?? "2025-01";
  try {
    const res = await fetch(adminEndpoint(creds.shopDomain, version), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({
        query: PRICE_LIST_FIXED_PRICES_UPDATE,
        variables: {
          priceListId: toShopifyPriceListGid(priceListId),
          pricesToAdd: prices.map((row) => ({
            variantId: row.variantGid,
            price: {
              amount: row.amount,
              currencyCode: row.currencyCode,
            },
          })),
          pricesToDeleteByVariantId: [],
        },
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
        ? "write_products"
        : undefined;
      return { ok: false, error, scopeHint };
    }

    const parsed = parseShopifyPriceListFixedPricesUpdateResponse(json);
    if (parsed.userErrors.length > 0) {
      return { ok: false, error: parsed.userErrors.join("; ") };
    }

    return {
      ok: true,
      priceListId: parsed.priceListId ?? toShopifyPriceListGid(priceListId),
      variantsUpdated: prices.length,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function pushShopifyMarketPricesForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  productIds?: string[];
  skipUnchanged?: boolean;
  origin?: "manual" | "product_update";
  respectDebounce?: boolean;
}): Promise<
  | {
      ok: true;
      marketsPushed: number;
      marketsUnchanged: number;
      totalVariantsPushed: number;
      exports: ShopifyMarketPriceExportRow[];
      skippedReason?: string;
    }
  | { ok: false; error: string; skippedReason?: string }
> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  const pushableMarkets = listPushableStorefrontMarkets(kitchen?.settingsCenterJson);
  if (pushableMarkets.length === 0) {
    return {
      ok: false,
      error:
        "No OS Kitchen markets with syncMode=push and a linked Shopify market. Configure on Storefront → Markets.",
    };
  }

  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const now = new Date().toISOString();

  if (
    input.respectDebounce !== false &&
    isShopifyMarketsPushDebounced(current.lastPricePushTriggeredAt)
  ) {
    await prisma.integrationConnection.update({
      where: { id: input.connection.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
            lastPricePushSkippedReason: "debounced",
            lastPricePushOrigin: input.origin ?? "manual",
          }),
        ),
      },
    });
    return { ok: false, error: "Push debounced — try again shortly.", skippedReason: "debounced" };
  }

  const externalProducts = await prisma.externalProduct.findMany({
    where: {
      connectionId: input.connection.id,
      mappedProductId: { not: null },
      ...(input.productIds?.length
        ? { mappedProductId: { in: input.productIds } }
        : {}),
    },
    select: {
      externalVariantId: true,
      mappedProductId: true,
    },
  });

  const mappedProductIds = [
    ...new Set(
      externalProducts
        .map((row) => row.mappedProductId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (mappedProductIds.length === 0) {
    return {
      ok: false,
      error: "No mapped external products found for this Shopify connection.",
    };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: mappedProductIds } },
    select: { id: true, price: true },
  });
  const productPrices = new Map<string, string>();
  for (const product of products) {
    productPrices.set(product.id, product.price.toFixed(2));
  }

  const exports: ShopifyMarketPriceExportRow[] = [];
  let totalVariantsPushed = 0;
  let marketsUnchanged = 0;
  const errors: string[] = [];

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastPricePushTriggeredAt: now,
          lastPricePushSkippedReason: null,
          lastPricePushOrigin: input.origin ?? "manual",
        }),
      ),
    },
  });

  for (const market of pushableMarkets) {
    const shopifyMarketId = market.shopifyMarketId!.trim();
    const pushPrices = buildPushPricesForMarket({
      market,
      externalProducts,
      productPrices,
    });
    if (pushPrices.length === 0) {
      errors.push(`${market.name}: no mapped variants with KitchenOS prices.`);
      continue;
    }

    const priceHash = computeShopifyMarketPushPriceHash(
      pushPrices.map((row) => ({ variantGid: row.variantGid, amount: row.amount })),
    );
    const previous = current.marketPriceExports[market.id];
    if (input.skipUnchanged && previous?.priceHash === priceHash) {
      marketsUnchanged += 1;
      continue;
    }

    const priceListId = await resolveShopifyPriceListId({
      creds: input.creds,
      shopifyMarketId,
      osMarketId: market.id,
      syncSettings: current,
      market,
    });
    if (!priceListId) {
      errors.push(`${market.name}: could not resolve Shopify price list.`);
      continue;
    }

    let variantsPushedForMarket = 0;
    for (let offset = 0; offset < pushPrices.length; offset += SHOPIFY_MARKETS_PUSH_BATCH_SIZE) {
      const batch = pushPrices.slice(offset, offset + SHOPIFY_MARKETS_PUSH_BATCH_SIZE);
      const pushed = await pushShopifyMarketPriceBatch(input.creds, priceListId, batch);
      if (!pushed.ok) {
        errors.push(`${market.name}: ${pushed.error}`);
        break;
      }
      variantsPushedForMarket += pushed.variantsUpdated;
    }

    if (variantsPushedForMarket === 0) continue;

    exports.push({
      osMarketId: market.id,
      shopifyMarketId,
      shopifyPriceListId: priceListId,
      currencyCode: pushPrices[0]?.currencyCode ?? market.currency ?? null,
      pushedAt: now,
      variantCount: pushPrices.length,
      pushedVariantCount: variantsPushedForMarket,
      priceHash,
    });
    totalVariantsPushed += variantsPushedForMarket;
  }

  if (exports.length === 0 && marketsUnchanged === 0) {
    await prisma.integrationConnection.update({
      where: { id: input.connection.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
            lastPricePushAt: now,
            lastPricePushError: errors[0] ?? "No market prices pushed.",
            lastPricePushSkippedReason: null,
          }),
        ),
      },
    });
    return {
      ok: false,
      error: errors[0] ?? "No market prices pushed.",
    };
  }

  const marketPriceExports: Record<string, ShopifyMarketPriceExportRow> = {
    ...current.marketPriceExports,
  };
  for (const row of exports) {
    marketPriceExports[row.osMarketId] = row;
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastPricePushAt: exports.length > 0 ? now : current.lastPricePushAt,
          lastPricePushError: errors.length > 0 ? errors.join(" · ") : null,
          lastPricePushSkippedReason:
            exports.length === 0 && marketsUnchanged > 0 ? "unchanged" : null,
          marketPriceExports,
        }),
      ),
    },
  });

  if (exports.length === 0 && marketsUnchanged > 0) {
    return {
      ok: true,
      marketsPushed: 0,
      marketsUnchanged,
      totalVariantsPushed: 0,
      exports: [],
      skippedReason: "unchanged",
    };
  }

  return {
    ok: true,
    marketsPushed: exports.length,
    marketsUnchanged,
    totalVariantsPushed,
    exports,
  };
}
