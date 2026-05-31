import type { IntegrationConnection } from "@prisma/client";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketCatalogConflictRow,
} from "@/lib/integrations/shopify-markets-settings";
import { revalidateStorefrontCatalogForOwner } from "@/lib/storefront/revalidate-shopify-market-catalog";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import {
  applyCatalogImportToMarketSettings,
  importShopifyMarketCatalogForConnection,
  listCatalogImportableStorefrontMarkets,
} from "@/services/integrations/shopify-market-catalog-service";
import {
  listCatalogPushableStorefrontMarkets,
  pushShopifyMarketCatalogForConnection,
  resolveKitchenosCatalogProductIds,
} from "@/services/integrations/shopify-market-catalog-push-service";
import { listBidirectionalStorefrontMarkets } from "@/services/integrations/shopify-market-prices-push-service";

export type ShopifyCatalogReconcileResult =
  | {
      ok: true;
      marketsReconciled: number;
      conflictsDetected: number;
      conflictsAutoResolved: number;
      conflictsOpen: number;
      publishedProducts: number;
      unpublishedProducts: number;
      importedMarkets: number;
    }
  | { ok: false; error: string };

export function buildShopifyMarketCatalogConflictKey(osMarketId: string, productId: string): string {
  return `catalog:${osMarketId}:${productId}`;
}

export function detectShopifyMarketCatalogConflicts(input: {
  markets: StorefrontMarket[];
  marketCatalogImports: ReturnType<typeof parseShopifyMarketsSyncSettings>["marketCatalogImports"];
  kitchenosCatalogByMarket: Map<string, Set<string>>;
  externalProductIdByProductId: Map<string, string>;
  existingConflicts: Record<string, ShopifyMarketCatalogConflictRow>;
  now?: string;
}): {
  conflicts: Record<string, ShopifyMarketCatalogConflictRow>;
  detected: number;
} {
  const now = input.now ?? new Date().toISOString();
  const conflicts: Record<string, ShopifyMarketCatalogConflictRow> = {
    ...input.existingConflicts,
  };
  let detected = 0;

  for (const market of input.markets) {
    if (market.syncMode !== "bidirectional") continue;
    const importRow = input.marketCatalogImports[market.id];
    if (!importRow) continue;

    const shopifySet = new Set(importRow.productIds);
    const kitchenosSet = input.kitchenosCatalogByMarket.get(market.id) ?? new Set<string>();
    const allProductIds = new Set([...shopifySet, ...kitchenosSet]);

    for (const productId of allProductIds) {
      const shopifyPublished = shopifySet.has(productId);
      const kitchenosPublished = kitchenosSet.has(productId);
      if (shopifyPublished === kitchenosPublished) {
        const key = buildShopifyMarketCatalogConflictKey(market.id, productId);
        if (conflicts[key]?.status === "open") delete conflicts[key];
        continue;
      }

      detected += 1;
      const conflictKey = buildShopifyMarketCatalogConflictKey(market.id, productId);
      const previous = conflicts[conflictKey];
      if (previous?.status !== "open" && previous?.status !== undefined) continue;

      conflicts[conflictKey] = {
        conflictKey,
        osMarketId: market.id,
        shopifyMarketId: importRow.shopifyMarketId,
        productId,
        externalProductId: input.externalProductIdByProductId.get(productId) ?? "",
        shopifyPublished,
        kitchenosPublished,
        detectedAt: now,
        status: "open",
        catalogAuthority: market.catalogAuthority ?? "kitchenos",
      };
    }
  }

  return { conflicts, detected };
}

export async function reconcileBidirectionalShopifyMarketCatalogForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  origin?: "manual" | "webhook" | "product_update" | "markets_update";
  skipUnchanged?: boolean;
}): Promise<ShopifyCatalogReconcileResult> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });

  const bidirectionalMarkets = listBidirectionalStorefrontMarkets(kitchen?.settingsCenterJson);
  if (bidirectionalMarkets.length === 0) {
    return {
      ok: false,
      error: "No OS Kitchen markets with syncMode=bidirectional for catalog reconcile.",
    };
  }

  const importResult = await importShopifyMarketCatalogForConnection({
    userId: input.userId,
    connection: input.connection,
    creds: input.creds,
    skipUnchanged: input.skipUnchanged ?? true,
    applyToMarketSettings: false,
  });

  if (!importResult.ok) {
    return { ok: false, error: importResult.error };
  }

  const refreshedConn = await prisma.integrationConnection.findUnique({
    where: { id: input.connection.id },
  });
  if (!refreshedConn) {
    return { ok: false, error: "Connection not found after catalog import." };
  }

  const sync = parseShopifyMarketsSyncSettings(refreshedConn.settingsJson);
  const allMarkets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);

  const externalProducts = await prisma.externalProduct.findMany({
    where: {
      connectionId: input.connection.id,
      mappedProductId: { not: null },
    },
    select: { externalProductId: true, mappedProductId: true },
  });

  const externalProductIdByProductId = new Map<string, string>();
  for (const row of externalProducts) {
    if (!row.mappedProductId || !row.externalProductId) continue;
    externalProductIdByProductId.set(row.mappedProductId, row.externalProductId);
  }

  const kitchenosCatalogByMarket = new Map<string, Set<string>>();
  for (const market of bidirectionalMarkets) {
    const ids = await resolveKitchenosCatalogProductIds({
      userId: input.userId,
      market,
    });
    kitchenosCatalogByMarket.set(market.id, new Set(ids));
  }

  const now = new Date().toISOString();
  const { conflicts, detected } = detectShopifyMarketCatalogConflicts({
    markets: allMarkets,
    marketCatalogImports: sync.marketCatalogImports,
    kitchenosCatalogByMarket,
    externalProductIdByProductId,
    existingConflicts: sync.marketCatalogConflicts,
    now,
  });

  let autoResolved = 0;
  let openConflicts = 0;
  const pushProductIds = new Set<string>();
  const applyShopifyProductIdsByMarket = new Map<string, string[]>();

  for (const conflict of Object.values(conflicts)) {
    if (conflict.status !== "open") continue;

    const market = allMarkets.find((row) => row.id === conflict.osMarketId);
    const authority = market?.catalogAuthority ?? conflict.catalogAuthority ?? "kitchenos";

    if (authority === "manual") {
      openConflicts += 1;
      continue;
    }

    if (authority === "shopify") {
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_shopify" };
      const list = applyShopifyProductIdsByMarket.get(conflict.osMarketId) ?? [];
      if (conflict.shopifyPublished) list.push(conflict.productId);
      applyShopifyProductIdsByMarket.set(conflict.osMarketId, list);
      autoResolved += 1;
      continue;
    }

    conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
    pushProductIds.add(conflict.productId);
    autoResolved += 1;
  }

  openConflicts = Object.values(conflicts).filter((row) => row.status === "open").length;

  for (const [osMarketId, productIds] of applyShopifyProductIdsByMarket) {
    const importRow = sync.marketCatalogImports[osMarketId];
    if (!importRow) continue;
    const merged = new Set(importRow.productIds);
    for (const id of productIds) merged.add(id);
    for (const conflict of Object.values(conflicts)) {
      if (conflict.osMarketId !== osMarketId || conflict.status !== "resolved_shopify") continue;
      if (!conflict.shopifyPublished) merged.delete(conflict.productId);
    }
    await applyCatalogImportToMarketSettings({
      userId: input.userId,
      osMarketId,
      productIds: [...merged].sort(),
      shopifyCatalogId: importRow.shopifyCatalogId,
    });
  }

  let publishedProducts = 0;
  let unpublishedProducts = 0;
  if (pushProductIds.size > 0) {
    const pushResult = await pushShopifyMarketCatalogForConnection({
      userId: input.userId,
      connection: refreshedConn,
      creds: input.creds,
      productIds: [...pushProductIds],
      skipUnchanged: true,
      respectDebounce: input.origin !== "manual",
    });
    if (pushResult.ok) {
      publishedProducts = pushResult.publishedCount;
      unpublishedProducts = pushResult.unpublishedCount;
    }
  }

  const resultSummary = [
    `imported=${importResult.marketsImported}`,
    `conflicts=${detected}`,
    `auto=${autoResolved}`,
    `open=${openConflicts}`,
    `pub=${publishedProducts}`,
    `unpub=${unpublishedProducts}`,
  ].join("; ");

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
          lastCatalogReconcileAt: now,
          lastCatalogReconcileError: null,
          lastCatalogReconcileResult: resultSummary,
          marketCatalogConflicts: conflicts,
        }),
      ),
    },
  });

  if (importResult.marketsImported > 0 || publishedProducts > 0 || unpublishedProducts > 0) {
    await revalidateStorefrontCatalogForOwner(input.userId);
  }

  return {
    ok: true,
    marketsReconciled: bidirectionalMarkets.length,
    conflictsDetected: detected,
    conflictsAutoResolved: autoResolved,
    conflictsOpen: openConflicts,
    publishedProducts,
    unpublishedProducts,
    importedMarkets: importResult.marketsImported,
  };
}

export async function resolveShopifyMarketCatalogConflict(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const conflict = sync.marketCatalogConflicts[input.conflictKey];
  if (!conflict) {
    return { ok: false, error: "Catalog conflict not found." };
  }

  const updatedConflicts = { ...sync.marketCatalogConflicts };
  if (input.resolution === "ignore") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "ignored" };
  } else if (input.resolution === "shopify") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_shopify" };
    const importRow = sync.marketCatalogImports[conflict.osMarketId];
    if (importRow) {
      const productIds = new Set(importRow.productIds);
      if (conflict.shopifyPublished) productIds.add(conflict.productId);
      else productIds.delete(conflict.productId);
      await applyCatalogImportToMarketSettings({
        userId: input.userId,
        osMarketId: conflict.osMarketId,
        productIds: [...productIds].sort(),
        shopifyCatalogId: importRow.shopifyCatalogId,
      });
    }
  } else {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
    await pushShopifyMarketCatalogForConnection({
      userId: input.userId,
      connection: input.connection,
      creds: input.creds,
      productIds: [conflict.productId],
      skipUnchanged: false,
      respectDebounce: false,
    });
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          marketCatalogConflicts: updatedConflicts,
          lastCatalogReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  await revalidateStorefrontCatalogForOwner(input.userId);
  return { ok: true };
}

export function countOpenShopifyMarketCatalogConflicts(
  conflicts: Record<string, ShopifyMarketCatalogConflictRow>,
): number {
  return Object.values(conflicts).filter((row) => row.status === "open").length;
}

export function hasCatalogSyncShopifyMarkets(settingsCenterJson: unknown): boolean {
  return (
    listCatalogImportableStorefrontMarkets(settingsCenterJson).length > 0 ||
    listCatalogPushableStorefrontMarkets(settingsCenterJson).length > 0
  );
}
