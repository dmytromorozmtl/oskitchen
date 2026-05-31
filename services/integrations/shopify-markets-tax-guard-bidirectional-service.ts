import type { IntegrationConnection } from "@prisma/client";

import { isShopifyMarketsTaxGuardEnabled } from "@/lib/commercial/shopify-market-tax-guard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketTaxConflictRow,
  type ShopifyMarketTaxConflictType,
  type ShopifyMarketTaxImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import {
  buildKitchenosTaxSummaryForGuard,
  importShopifyMarketTaxForConnection,
  listTaxGuardStorefrontMarkets,
} from "@/services/integrations/shopify-market-tax-service";

export type ShopifyTaxGuardReconcileResult =
  | {
      ok: true;
      marketsReconciled: number;
      conflictsDetected: number;
      conflictsAutoResolved: number;
      conflictsOpen: number;
      importedMarkets: number;
      marketsUnchanged: number;
    }
  | { ok: false; error: string };

const RATE_TOLERANCE_PERCENT = 0.05;

export function buildShopifyMarketTaxConflictKey(
  osMarketId: string,
  conflictType: ShopifyMarketTaxConflictType,
): string {
  return `tax:${osMarketId}:${conflictType}`;
}

function formatShopifyTaxSummary(importRow: ShopifyMarketTaxImportRow): string {
  const regions = importRow.regionCodes.join(", ") || "—";
  const components = importRow.taxComponents
    .filter((c) => c.ratePercent > 0)
    .map((c) => `${c.label} ${c.ratePercent}%`)
    .join(" + ");
  return [
    `mode=${importRow.inferredMode}`,
    `regions=${regions}`,
    `rate=${importRow.totalRatePercent.toFixed(2)}%`,
    components ? `components=${components}` : null,
    importRow.taxIncludedInPrices ? "tax-included" : "tax-excluded",
    importRow.dutiesEnabled ? "duties=hint" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function formatKitchenosTaxSummary(summary: ReturnType<typeof buildKitchenosTaxSummaryForGuard>): string {
  return [
    `mode=${summary.mode}`,
    summary.regionCode ? `region=${summary.regionCode}` : null,
    `rate=${summary.totalRatePercent.toFixed(2)}%`,
    summary.componentSummary !== "No configured rates" ? summary.componentSummary : null,
    summary.taxIncludedInPrices ? "tax-included" : "tax-excluded",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detectShopifyMarketTaxConflicts(input: {
  markets: StorefrontMarket[];
  marketTaxImports: Record<string, ShopifyMarketTaxImportRow>;
  kitchenosTaxSummary: ReturnType<typeof buildKitchenosTaxSummaryForGuard>;
  existingConflicts: Record<string, ShopifyMarketTaxConflictRow>;
  now?: string;
}): {
  conflicts: Record<string, ShopifyMarketTaxConflictRow>;
  detected: number;
} {
  const now = input.now ?? new Date().toISOString();
  const conflicts: Record<string, ShopifyMarketTaxConflictRow> = {
    ...input.existingConflicts,
  };
  let detected = 0;

  const activeKeys = new Set<string>();

  for (const market of input.markets) {
    if (market.syncMode !== "import" && market.syncMode !== "bidirectional") continue;
    const importRow = input.marketTaxImports[market.id];
    if (!importRow) continue;

    const shopifySummary = formatShopifyTaxSummary(importRow);
    const kitchenSummary = formatKitchenosTaxSummary(input.kitchenosTaxSummary);
    const authority = market.taxAuthority ?? "kitchenos";

    const candidates: Array<{
      type: ShopifyMarketTaxConflictType;
      shopifySummary: string;
      kitchenosSummary: string;
    }> = [];

    if (importRow.inferredMode !== input.kitchenosTaxSummary.mode) {
      candidates.push({
        type: "MODE_MISMATCH",
        shopifySummary: `Shopify inferred ${importRow.inferredMode}`,
        kitchenosSummary: `KitchenOS configured ${input.kitchenosTaxSummary.mode}`,
      });
    }

    const rateDelta = Math.abs(importRow.totalRatePercent - input.kitchenosTaxSummary.totalRatePercent);
    if (rateDelta > RATE_TOLERANCE_PERCENT) {
      candidates.push({
        type: "RATE_MISMATCH",
        shopifySummary: `${importRow.totalRatePercent.toFixed(2)}% total`,
        kitchenosSummary: `${input.kitchenosTaxSummary.totalRatePercent.toFixed(2)}% total`,
      });
    }

    const kitchenRegion = input.kitchenosTaxSummary.regionCode;
    if (
      kitchenRegion &&
      importRow.regionCodes.length > 0 &&
      !importRow.regionCodes.some(
        (code) =>
          code === kitchenRegion ||
          (kitchenRegion === "EU" && code.length === 2) ||
          (kitchenRegion.startsWith("US") && (code === "US" || code.startsWith("US-"))),
      )
    ) {
      candidates.push({
        type: "JURISDICTION_MISSING",
        shopifySummary: `regions ${importRow.regionCodes.join(", ")}`,
        kitchenosSummary: `region ${kitchenRegion}`,
      });
    }

    if (importRow.dutiesEnabled === true) {
      candidates.push({
        type: "DUTY_UNCONFIGURED",
        shopifySummary: "Shopify market spans cross-border regions (duty hint)",
        kitchenosSummary: "KitchenOS has no automated duty engine — configure manually if needed",
      });
    }

    for (const candidate of candidates) {
      const conflictKey = buildShopifyMarketTaxConflictKey(market.id, candidate.type);
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
        shopifySummary: candidate.shopifySummary || shopifySummary,
        kitchenosSummary: candidate.kitchenosSummary || kitchenSummary,
        detectedAt: now,
        status: "open",
        taxAuthority: authority,
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

export async function reconcileShopifyMarketTaxGuardForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  origin?: "manual" | "webhook" | "markets_update";
  skipUnchanged?: boolean;
}): Promise<ShopifyTaxGuardReconcileResult> {
  if (!isShopifyMarketsTaxGuardEnabled()) {
    return { ok: false, error: "Shopify Markets tax guard is disabled (SHOPIFY_MARKETS_TAX_GUARD)." };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });

  const guardMarkets = listTaxGuardStorefrontMarkets(kitchen?.settingsCenterJson);
  if (guardMarkets.length === 0) {
    return {
      ok: false,
      error: "No OS Kitchen markets with syncMode import/bidirectional for tax guard.",
    };
  }

  const importResult = await importShopifyMarketTaxForConnection({
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
    return { ok: false, error: "Connection not found after tax import." };
  }

  const sync = parseShopifyMarketsSyncSettings(refreshedConn.settingsJson);
  const allMarkets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);
  const kitchenosTaxSummary = buildKitchenosTaxSummaryForGuard(kitchen?.settingsCenterJson);
  const now = new Date().toISOString();

  const { conflicts, detected } = detectShopifyMarketTaxConflicts({
    markets: allMarkets,
    marketTaxImports: sync.marketTaxImports,
    kitchenosTaxSummary,
    existingConflicts: sync.marketTaxConflicts,
    now,
  });

  let autoResolved = 0;
  let openConflicts = 0;

  for (const conflict of Object.values(conflicts)) {
    if (conflict.status !== "open") continue;

    const market = allMarkets.find((row) => row.id === conflict.osMarketId);
    const authority = market?.taxAuthority ?? conflict.taxAuthority ?? "kitchenos";

    if (authority === "manual") {
      openConflicts += 1;
      continue;
    }

    if (authority === "shopify") {
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_shopify" };
      autoResolved += 1;
      continue;
    }

    conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
    autoResolved += 1;
  }

  openConflicts = Object.values(conflicts).filter((row) => row.status === "open").length;

  const resultSummary = [
    `imported=${importResult.marketsImported}`,
    `unchanged=${importResult.marketsUnchanged}`,
    `conflicts=${detected}`,
    `auto=${autoResolved}`,
    `open=${openConflicts}`,
  ].join("; ");

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
          lastTaxReconcileAt: now,
          lastTaxReconcileError: null,
          lastTaxReconcileResult: resultSummary,
          marketTaxConflicts: conflicts,
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
  };
}

export async function resolveShopifyMarketTaxConflict(input: {
  connection: IntegrationConnection;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const conflict = sync.marketTaxConflicts[input.conflictKey];
  if (!conflict) {
    return { ok: false, error: "Tax conflict not found." };
  }

  const updatedConflicts = { ...sync.marketTaxConflicts };
  if (input.resolution === "ignore") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "ignored" };
  } else if (input.resolution === "shopify") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_shopify" };
  } else {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          marketTaxConflicts: updatedConflicts,
          lastTaxReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  return { ok: true };
}

export function countOpenShopifyMarketTaxConflicts(
  conflicts: Record<string, ShopifyMarketTaxConflictRow>,
): number {
  return Object.values(conflicts).filter((row) => row.status === "open").length;
}

export function hasTaxGuardShopifyMarkets(settingsCenterJson: unknown): boolean {
  if (!isShopifyMarketsTaxGuardEnabled()) return false;
  return listTaxGuardStorefrontMarkets(settingsCenterJson).length > 0;
}
