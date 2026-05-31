import type { IntegrationConnection } from "@prisma/client";

import {
  hostLabelsMatch,
  isShopifyMarketsHostnameGuardEnabled,
} from "@/lib/commercial/shopify-market-hostname-guard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketHostnameConflictRow,
  type ShopifyMarketHostnameConflictType,
  type ShopifyMarketHostnameImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import {
  applyHostnameImportToMarketSettings,
  importShopifyMarketHostnameForConnection,
  listHostnameGuardStorefrontMarkets,
} from "@/services/integrations/shopify-market-hostname-service";

export type ShopifyHostnameGuardReconcileResult =
  | {
      ok: true;
      marketsReconciled: number;
      conflictsDetected: number;
      conflictsAutoResolved: number;
      conflictsOpen: number;
      importedMarkets: number;
      marketsUnchanged: number;
      appliedMarkets: number;
    }
  | { ok: false; error: string };

export function buildShopifyMarketHostnameConflictKey(
  osMarketId: string,
  conflictType: ShopifyMarketHostnameConflictType,
): string {
  return `hostname:${osMarketId}:${conflictType}`;
}

export async function collectTakenHostSubdomains(input: {
  ownerUserId: string;
  excludeOsMarketId?: string;
}): Promise<Set<string>> {
  const taken = new Set<string>();

  const published = await prisma.storefrontSettings.findMany({
    where: { enabled: true, published: true },
    select: { userId: true, storeSlug: true, subdomain: true },
  });

  for (const sf of published) {
    if (sf.subdomain?.trim()) {
      taken.add(sf.subdomain.trim().toLowerCase());
    }
    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: sf.userId },
      select: { settingsCenterJson: true },
    });
    const markets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);
    for (const m of markets) {
      if (m.enabled === false) continue;
      if (sf.userId === input.ownerUserId && m.id === input.excludeOsMarketId) continue;
      const label = m.hostSubdomain?.trim().toLowerCase();
      if (label) taken.add(label);
    }
  }

  return taken;
}

export async function collectPublishedStoreSlugs(excludeStoreSlug?: string): Promise<Set<string>> {
  const rows = await prisma.storefrontSettings.findMany({
    where: { enabled: true, published: true },
    select: { storeSlug: true },
  });
  const slugs = new Set(rows.map((r) => r.storeSlug.trim().toLowerCase()));
  if (excludeStoreSlug?.trim()) {
    slugs.delete(excludeStoreSlug.trim().toLowerCase());
  }
  return slugs;
}

export function detectShopifyMarketHostnameConflicts(input: {
  markets: StorefrontMarket[];
  marketHostnameImports: Record<string, ShopifyMarketHostnameImportRow>;
  takenHostSubdomains: Set<string>;
  publishedStoreSlugs: Set<string>;
  primaryStoreSlug: string;
  existingConflicts: Record<string, ShopifyMarketHostnameConflictRow>;
  now?: string;
}): {
  conflicts: Record<string, ShopifyMarketHostnameConflictRow>;
  detected: number;
} {
  const now = input.now ?? new Date().toISOString();
  const conflicts: Record<string, ShopifyMarketHostnameConflictRow> = {
    ...input.existingConflicts,
  };
  let detected = 0;
  const activeKeys = new Set<string>();

  for (const market of input.markets) {
    if (market.syncMode !== "import" && market.syncMode !== "bidirectional") continue;
    const importRow = input.marketHostnameImports[market.id];
    if (!importRow) continue;

    const authority = market.hostnameAuthority ?? "kitchenos";
    const kitchenHost = market.hostSubdomain?.trim().toLowerCase() ?? "";
    const kitchenSlug = market.storeSlug?.trim().toLowerCase() ?? input.primaryStoreSlug;
    const shopifyHost = importRow.suggestedHostSubdomain.trim().toLowerCase();
    const shopifySlug = importRow.suggestedStoreSlug.trim().toLowerCase();

    const candidates: Array<{
      type: ShopifyMarketHostnameConflictType;
      shopifySummary: string;
      kitchenosSummary: string;
    }> = [];

    if (
      kitchenHost &&
      shopifyHost &&
      !hostLabelsMatch(kitchenHost, shopifyHost) &&
      importRow.shopifyHandle
    ) {
      candidates.push({
        type: "HANDLE_MISMATCH",
        shopifySummary: `handle ${importRow.shopifyHandle} → ${shopifyHost}`,
        kitchenosSummary: `configured ${kitchenHost}`,
      });
    }

    if (shopifyHost && input.takenHostSubdomains.has(shopifyHost) && !hostLabelsMatch(kitchenHost, shopifyHost)) {
      candidates.push({
        type: "SUBDOMAIN_TAKEN",
        shopifySummary: `${shopifyHost} already used`,
        kitchenosSummary: kitchenHost ? `current ${kitchenHost}` : "unset",
      });
    }

    if (
      shopifySlug &&
      shopifySlug !== input.primaryStoreSlug.toLowerCase() &&
      input.publishedStoreSlugs.has(shopifySlug) &&
      kitchenSlug !== shopifySlug
    ) {
      candidates.push({
        type: "SLUG_COLLISION",
        shopifySummary: `suggested slug /s/${shopifySlug}`,
        kitchenosSummary: `current /s/${kitchenSlug}`,
      });
    }

    for (const candidate of candidates) {
      const conflictKey = buildShopifyMarketHostnameConflictKey(market.id, candidate.type);
      activeKeys.add(conflictKey);
      detected += 1;

      const previous = conflicts[conflictKey];
      if (previous?.status !== "open" && previous?.status !== undefined) {
        continue;
      }

      conflicts[conflictKey] = {
        conflictKey,
        osMarketId: market.id,
        shopifyMarketId: importRow.shopifyMarketId,
        conflictType: candidate.type,
        shopifySummary: candidate.shopifySummary,
        kitchenosSummary: candidate.kitchenosSummary,
        detectedAt: now,
        status: "open",
        hostnameAuthority: authority,
      };
    }
  }

  for (const key of Object.keys(conflicts)) {
    if (conflicts[key]?.status === "open" && !activeKeys.has(key)) {
      delete conflicts[key];
    }
  }

  return { conflicts, detected };
}

export async function reconcileShopifyMarketHostnameGuardForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  primaryStoreSlug: string;
  origin?: "manual" | "webhook" | "markets_update";
  skipUnchanged?: boolean;
}): Promise<ShopifyHostnameGuardReconcileResult> {
  if (!isShopifyMarketsHostnameGuardEnabled()) {
    return {
      ok: false,
      error: "Shopify Markets hostname guard is disabled (SHOPIFY_MARKETS_HOSTNAME_GUARD).",
    };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });

  const guardMarkets = listHostnameGuardStorefrontMarkets(kitchen?.settingsCenterJson);
  if (guardMarkets.length === 0) {
    return {
      ok: false,
      error: "No OS Kitchen markets with syncMode import/bidirectional for hostname guard.",
    };
  }

  const importResult = await importShopifyMarketHostnameForConnection({
    userId: input.userId,
    connection: input.connection,
    primaryStoreSlug: input.primaryStoreSlug,
    skipUnchanged: input.skipUnchanged ?? true,
  });

  if (!importResult.ok) {
    return { ok: false, error: importResult.error };
  }

  const refreshedConn = await prisma.integrationConnection.findUnique({
    where: { id: input.connection.id },
  });
  if (!refreshedConn) {
    return { ok: false, error: "Connection not found after hostname import." };
  }

  const sync = parseShopifyMarketsSyncSettings(refreshedConn.settingsJson);
  const allMarkets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);
  const takenHostSubdomains = await collectTakenHostSubdomains({ ownerUserId: input.userId });
  const publishedStoreSlugs = await collectPublishedStoreSlugs(input.primaryStoreSlug);
  const now = new Date().toISOString();

  const { conflicts, detected } = detectShopifyMarketHostnameConflicts({
    markets: allMarkets,
    marketHostnameImports: sync.marketHostnameImports,
    takenHostSubdomains,
    publishedStoreSlugs,
    primaryStoreSlug: input.primaryStoreSlug,
    existingConflicts: sync.marketHostnameConflicts,
    now,
  });

  let autoResolved = 0;
  let appliedMarkets = 0;

  for (const conflict of Object.values(conflicts)) {
    if (conflict.status !== "open") continue;

    const market = allMarkets.find((row) => row.id === conflict.osMarketId);
    const authority = market?.hostnameAuthority ?? conflict.hostnameAuthority ?? "kitchenos";

    if (authority === "manual") continue;

    if (authority === "shopify") {
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_shopify" };
      autoResolved += 1;
    } else {
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
      autoResolved += 1;
    }
  }

  for (const market of guardMarkets) {
    const authority = market.hostnameAuthority ?? "kitchenos";
    if (authority !== "shopify") continue;

    const importRow = sync.marketHostnameImports[market.id];
    if (!importRow) continue;

    const openForMarket = Object.values(conflicts).some(
      (row) => row.osMarketId === market.id && row.status === "open",
    );
    if (openForMarket) continue;

    const applied = await applyHostnameImportToMarketSettings({
      userId: input.userId,
      osMarketId: market.id,
      hostSubdomain: importRow.suggestedHostSubdomain,
      storeSlug:
        importRow.suggestedStoreSlug !== input.primaryStoreSlug
          ? importRow.suggestedStoreSlug
          : undefined,
    });
    if (applied) appliedMarkets += 1;
  }

  const openConflicts = Object.values(conflicts).filter((row) => row.status === "open").length;

  const resultSummary = [
    `imported=${importResult.marketsImported}`,
    `unchanged=${importResult.marketsUnchanged}`,
    `conflicts=${detected}`,
    `auto=${autoResolved}`,
    `open=${openConflicts}`,
    `applied=${appliedMarkets}`,
  ].join("; ");

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
          lastHostnameReconcileAt: now,
          lastHostnameReconcileError: null,
          lastHostnameReconcileResult: resultSummary,
          marketHostnameConflicts: conflicts,
        }),
      ),
    },
  });

  return {
    ok: true,
    marketsReconciled: guardMarkets.length,
    conflictsDetected: detected,
    conflictsAutoResolved: autoResolved,
    conflictsOpen: openConflicts,
    importedMarkets: importResult.marketsImported,
    marketsUnchanged: importResult.marketsUnchanged,
    appliedMarkets,
  };
}

export async function resolveShopifyMarketHostnameConflict(input: {
  userId: string;
  connection: IntegrationConnection;
  primaryStoreSlug: string;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}): Promise<{ ok: true; applied: boolean } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const conflict = sync.marketHostnameConflicts[input.conflictKey];
  if (!conflict) {
    return { ok: false, error: "Hostname conflict not found." };
  }

  const updatedConflicts = { ...sync.marketHostnameConflicts };
  let applied = false;

  if (input.resolution === "ignore") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "ignored" };
  } else if (input.resolution === "shopify") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_shopify" };
    const importRow = sync.marketHostnameImports[conflict.osMarketId];
    if (importRow) {
      applied = await applyHostnameImportToMarketSettings({
        userId: input.userId,
        osMarketId: conflict.osMarketId,
        hostSubdomain: importRow.suggestedHostSubdomain,
        storeSlug:
          importRow.suggestedStoreSlug !== input.primaryStoreSlug
            ? importRow.suggestedStoreSlug
            : undefined,
      });
    }
  } else {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          marketHostnameConflicts: updatedConflicts,
          lastHostnameReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  return { ok: true, applied };
}

export async function applySuggestedShopifyMarketHostname(input: {
  userId: string;
  connection: IntegrationConnection;
  osMarketId: string;
  primaryStoreSlug: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const importRow = sync.marketHostnameImports[input.osMarketId];
  if (!importRow) {
    return { ok: false, error: "No cached hostname import for this market." };
  }

  const taken = await collectTakenHostSubdomains({
    ownerUserId: input.userId,
    excludeOsMarketId: input.osMarketId,
  });
  if (taken.has(importRow.suggestedHostSubdomain.trim().toLowerCase())) {
    return { ok: false, error: "Suggested subdomain is already taken." };
  }

  const applied = await applyHostnameImportToMarketSettings({
    userId: input.userId,
    osMarketId: input.osMarketId,
    hostSubdomain: importRow.suggestedHostSubdomain,
    storeSlug:
      importRow.suggestedStoreSlug !== input.primaryStoreSlug
        ? importRow.suggestedStoreSlug
        : undefined,
  });

  if (!applied) {
    return { ok: false, error: "Market not found in settings." };
  }

  return { ok: true };
}

export function countOpenShopifyMarketHostnameConflicts(
  conflicts: Record<string, ShopifyMarketHostnameConflictRow>,
): number {
  return Object.values(conflicts).filter((row) => row.status === "open").length;
}

export function hasHostnameGuardShopifyMarkets(settingsCenterJson: unknown): boolean {
  if (!isShopifyMarketsHostnameGuardEnabled()) return false;
  return listHostnameGuardStorefrontMarkets(settingsCenterJson).length > 0;
}
