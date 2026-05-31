import type { IntegrationConnection } from "@prisma/client";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketPriceConflictRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  listBidirectionalStorefrontMarkets,
  pushShopifyMarketPricesForConnection,
} from "@/services/integrations/shopify-market-prices-push-service";
import {
  importShopifyMarketPricesForConnection,
  listImportableStorefrontMarkets,
} from "@/services/integrations/shopify-market-prices-service";
import { revalidateStorefrontCatalogForOwner } from "@/lib/storefront/revalidate-shopify-market-catalog";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";

export type ShopifyBidirectionalReconcileResult =
  | {
      ok: true;
      marketsReconciled: number;
      conflictsDetected: number;
      conflictsAutoResolved: number;
      conflictsOpen: number;
      pushedProducts: number;
      importedMarkets: number;
    }
  | { ok: false; error: string };

export function buildShopifyMarketPriceConflictKey(osMarketId: string, productId: string): string {
  return `${osMarketId}:${productId}`;
}

function normalizeAmount(value: string | number): string {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toFixed(2);
}

export function detectShopifyMarketPriceConflicts(input: {
  markets: StorefrontMarket[];
  marketPriceImports: ReturnType<typeof parseShopifyMarketsSyncSettings>["marketPriceImports"];
  kitchenosPrices: Map<string, string>;
  variantByProductId: Map<string, string>;
  existingConflicts: Record<string, ShopifyMarketPriceConflictRow>;
  now?: string;
}): {
  conflicts: Record<string, ShopifyMarketPriceConflictRow>;
  detected: number;
} {
  const now = input.now ?? new Date().toISOString();
  const conflicts: Record<string, ShopifyMarketPriceConflictRow> = {
    ...input.existingConflicts,
  };
  let detected = 0;

  for (const market of input.markets) {
    if (market.syncMode !== "bidirectional") continue;
    const importRow = input.marketPriceImports[market.id];
    if (!importRow) continue;

    const authority = market.priceAuthority ?? "kitchenos";

    for (const [productId, shopifyAmountRaw] of Object.entries(importRow.productPrices)) {
      const kitchenosAmountRaw = input.kitchenosPrices.get(productId);
      if (!kitchenosAmountRaw) continue;

      const shopifyAmount = normalizeAmount(shopifyAmountRaw);
      const kitchenosAmount = normalizeAmount(kitchenosAmountRaw);
      if (shopifyAmount === kitchenosAmount) {
        const key = buildShopifyMarketPriceConflictKey(market.id, productId);
        if (conflicts[key]?.status === "open") {
          delete conflicts[key];
        }
        continue;
      }

      detected += 1;
      const conflictKey = buildShopifyMarketPriceConflictKey(market.id, productId);
      const previous = conflicts[conflictKey];
      if (previous?.status !== "open" && previous?.status !== undefined) {
        continue;
      }

      conflicts[conflictKey] = {
        conflictKey,
        osMarketId: market.id,
        shopifyMarketId: importRow.shopifyMarketId,
        productId,
        externalVariantId: input.variantByProductId.get(productId) ?? "",
        shopifyAmount,
        kitchenosAmount,
        detectedAt: now,
        status: authority === "manual" ? "open" : "open",
        priceAuthority: authority,
      };
    }
  }

  return { conflicts, detected };
}

export async function reconcileBidirectionalShopifyMarketsForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  origin?: "manual" | "webhook" | "product_update";
  skipUnchanged?: boolean;
}): Promise<ShopifyBidirectionalReconcileResult> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });

  const bidirectionalMarkets = listBidirectionalStorefrontMarkets(kitchen?.settingsCenterJson);
  if (bidirectionalMarkets.length === 0) {
    return {
      ok: false,
      error:
        "No OS Kitchen markets with syncMode=bidirectional. Configure on Storefront → Markets.",
    };
  }

  const importResult = await importShopifyMarketPricesForConnection({
    userId: input.userId,
    connection: input.connection,
    creds: input.creds,
    skipUnchanged: input.skipUnchanged ?? true,
  });

  if (!importResult.ok) {
    return { ok: false, error: importResult.error };
  }

  const refreshedConn = await prisma.integrationConnection.findUnique({
    where: { id: input.connection.id },
  });
  if (!refreshedConn) {
    return { ok: false, error: "Connection not found after import." };
  }

  const sync = parseShopifyMarketsSyncSettings(refreshedConn.settingsJson);
  const allMarkets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);

  const externalProducts = await prisma.externalProduct.findMany({
    where: {
      connectionId: input.connection.id,
      mappedProductId: { not: null },
    },
    select: { externalVariantId: true, mappedProductId: true },
  });

  const variantByProductId = new Map<string, string>();
  const productIds: string[] = [];
  for (const row of externalProducts) {
    if (!row.mappedProductId) continue;
    productIds.push(row.mappedProductId);
    if (row.externalVariantId) {
      variantByProductId.set(row.mappedProductId, row.externalVariantId);
    }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  });
  const kitchenosPrices = new Map<string, string>();
  for (const product of products) {
    kitchenosPrices.set(product.id, product.price.toFixed(2));
  }

  const now = new Date().toISOString();
  const { conflicts, detected } = detectShopifyMarketPriceConflicts({
    markets: allMarkets,
    marketPriceImports: sync.marketPriceImports,
    kitchenosPrices,
    variantByProductId,
    existingConflicts: sync.marketPriceConflicts,
    now,
  });

  let autoResolved = 0;
  let openConflicts = 0;
  const pushProductIds = new Set<string>();

  for (const conflict of Object.values(conflicts)) {
    if (conflict.status !== "open") continue;

    const market = allMarkets.find((row) => row.id === conflict.osMarketId);
    const authority = market?.priceAuthority ?? conflict.priceAuthority ?? "kitchenos";

    if (authority === "manual") {
      openConflicts += 1;
      continue;
    }

    if (authority === "shopify") {
      conflicts[conflict.conflictKey] = {
        ...conflict,
        status: "resolved_shopify",
      };
      autoResolved += 1;
      continue;
    }

    if (authority === "kitchenos") {
      conflicts[conflict.conflictKey] = {
        ...conflict,
        status: "resolved_kitchenos",
      };
      pushProductIds.add(conflict.productId);
      autoResolved += 1;
    }
  }

  openConflicts = Object.values(conflicts).filter((row) => row.status === "open").length;

  let pushedProducts = 0;
  if (pushProductIds.size > 0) {
    const pushResult = await pushShopifyMarketPricesForConnection({
      userId: input.userId,
      connection: refreshedConn,
      creds: input.creds,
      productIds: [...pushProductIds],
      skipUnchanged: true,
      origin: input.origin === "webhook" ? "product_update" : "manual",
      respectDebounce: input.origin !== "manual",
    });
    if (pushResult.ok) {
      pushedProducts = pushResult.totalVariantsPushed;
    }
  }

  const resultSummary = [
    `imported=${importResult.marketsImported}`,
    `conflicts=${detected}`,
    `auto=${autoResolved}`,
    `open=${openConflicts}`,
    `pushed=${pushedProducts}`,
  ].join("; ");

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
          lastBidirectionalReconcileAt: now,
          lastBidirectionalReconcileError: null,
          lastBidirectionalReconcileResult: resultSummary,
          marketPriceConflicts: conflicts,
        }),
      ),
    },
  });

  if (importResult.marketsImported > 0 || pushedProducts > 0) {
    await revalidateStorefrontCatalogForOwner(input.userId);
  }

  return {
    ok: true,
    marketsReconciled: bidirectionalMarkets.length,
    conflictsDetected: detected,
    conflictsAutoResolved: autoResolved,
    conflictsOpen: openConflicts,
    pushedProducts,
    importedMarkets: importResult.marketsImported,
  };
}

export async function resolveShopifyMarketPriceConflict(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const conflict = sync.marketPriceConflicts[input.conflictKey];
  if (!conflict) {
    return { ok: false, error: "Conflict not found." };
  }

  const updatedConflicts = { ...sync.marketPriceConflicts };
  if (input.resolution === "ignore") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "ignored" };
  } else if (input.resolution === "shopify") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_shopify" };
  } else {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
    await pushShopifyMarketPricesForConnection({
      userId: input.userId,
      connection: input.connection,
      creds: input.creds,
      productIds: [conflict.productId],
      skipUnchanged: false,
      origin: "manual",
      respectDebounce: false,
    });
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          marketPriceConflicts: updatedConflicts,
          lastBidirectionalReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  await revalidateStorefrontCatalogForOwner(input.userId);
  return { ok: true };
}

export function countOpenShopifyMarketPriceConflicts(
  conflicts: Record<string, ShopifyMarketPriceConflictRow>,
): number {
  return Object.values(conflicts).filter((row) => row.status === "open").length;
}

export function hasBidirectionalShopifyMarkets(settingsCenterJson: unknown): boolean {
  return listBidirectionalStorefrontMarkets(settingsCenterJson).length > 0;
}

export function hasImportableShopifyMarkets(settingsCenterJson: unknown): boolean {
  return listImportableStorefrontMarkets(settingsCenterJson).length > 0;
}
