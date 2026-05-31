import type { IntegrationConnection } from "@prisma/client";

import { isShopifyMarketsB2bLocationRoutingEnabled } from "@/lib/commercial/shopify-market-b2b-location-routing";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyB2bLocationConflictRow,
  type ShopifyB2bLocationConflictType,
  type ShopifyB2bLocationImportRow,
  type ShopifyB2bLocationLinkRow,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import { importShopifyB2bLocationsForConnection } from "@/services/integrations/shopify-market-b2b-location-service";

export type ShopifyB2bLocationRoutingReconcileResult =
  | {
      ok: true;
      locationsReconciled: number;
      conflictsDetected: number;
      conflictsAutoResolved: number;
      conflictsOpen: number;
      locationsImported: number;
      locationsUnchanged: number;
      linksApplied: number;
    }
  | { ok: false; error: string; unavailable?: boolean };

export function buildShopifyB2bLocationConflictKey(
  shopifyLocationId: string,
  conflictType: ShopifyB2bLocationConflictType,
): string {
  return `b2b-loc:${shopifyLocationId}:${conflictType}`;
}

function formatShopifyLocationSummary(importRow: ShopifyB2bLocationImportRow): string {
  return [
    importRow.companyName,
    importRow.locationName,
    importRow.countryCode ? `country=${importRow.countryCode}` : "country=—",
    importRow.city ? `city=${importRow.city}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detectShopifyB2bLocationConflicts(input: {
  b2bLocationImports: Record<string, ShopifyB2bLocationImportRow>;
  b2bLocationLinks: Record<string, ShopifyB2bLocationLinkRow>;
  b2bCompanyLinks: Record<string, string>;
  b2bLocationAuthority: "shopify" | "kitchenos" | "manual";
  existingConflicts: Record<string, ShopifyB2bLocationConflictRow>;
  now?: string;
}): {
  conflicts: Record<string, ShopifyB2bLocationConflictRow>;
  detected: number;
} {
  const now = input.now ?? new Date().toISOString();
  const conflicts: Record<string, ShopifyB2bLocationConflictRow> = {
    ...input.existingConflicts,
  };
  let detected = 0;
  const activeKeys = new Set<string>();

  for (const importRow of Object.values(input.b2bLocationImports)) {
    const authority = input.b2bLocationAuthority;
    const shopifySummary = formatShopifyLocationSummary(importRow);
    const linked = input.b2bLocationLinks[importRow.shopifyLocationId];
    const companyAccountId =
      linked?.companyAccountId ??
      input.b2bCompanyLinks[importRow.shopifyCompanyId] ??
      importRow.suggestedCompanyAccountId;

    const candidates: Array<{
      type: ShopifyB2bLocationConflictType;
      osMarketId: string | null;
      companyAccountId: string | null;
      kitchenosSummary: string;
    }> = [];

    if (!input.b2bCompanyLinks[importRow.shopifyCompanyId]) {
      candidates.push({
        type: "COMPANY_UNLINKED",
        osMarketId: importRow.suggestedOsMarketId,
        companyAccountId,
        kitchenosSummary: "Parent Shopify company not linked to KitchenOS account",
      });
    }

    if (!linked) {
      candidates.push({
        type: "LOCATION_ORPHAN",
        osMarketId: importRow.suggestedOsMarketId,
        companyAccountId,
        kitchenosSummary: importRow.suggestedOsMarketId
          ? `Suggested market ${importRow.suggestedOsMarketId}`
          : "No location link configured",
      });
    }

    if (!importRow.suggestedOsMarketId && importRow.countryCode) {
      candidates.push({
        type: "REGION_UNMAPPED",
        osMarketId: null,
        companyAccountId,
        kitchenosSummary: `No OS Kitchen market for ${importRow.countryCode}`,
      });
    }

    if (
      linked?.osMarketId &&
      importRow.suggestedOsMarketId &&
      linked.osMarketId !== importRow.suggestedOsMarketId
    ) {
      candidates.push({
        type: "MARKET_MISMATCH",
        osMarketId: linked.osMarketId,
        companyAccountId: linked.companyAccountId,
        kitchenosSummary: `Linked market ${linked.osMarketId}, suggested ${importRow.suggestedOsMarketId}`,
      });
    }

    for (const candidate of candidates) {
      const conflictKey = buildShopifyB2bLocationConflictKey(importRow.shopifyLocationId, candidate.type);
      activeKeys.add(conflictKey);
      detected += 1;

      const previous = conflicts[conflictKey];
      if (previous?.status !== "open" && previous?.status !== undefined) {
        continue;
      }

      conflicts[conflictKey] = {
        conflictKey,
        shopifyLocationId: importRow.shopifyLocationId,
        shopifyCompanyId: importRow.shopifyCompanyId,
        osMarketId: candidate.osMarketId,
        companyAccountId: candidate.companyAccountId,
        conflictType: candidate.type,
        shopifySummary,
        kitchenosSummary: candidate.kitchenosSummary,
        detectedAt: now,
        status: "open",
        b2bLocationAuthority: authority,
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

export async function reconcileShopifyB2bLocationRoutingForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  settingsCenterJson: unknown;
  origin?: "manual" | "full_reconcile";
  skipUnchanged?: boolean;
}): Promise<ShopifyB2bLocationRoutingReconcileResult> {
  if (!isShopifyMarketsB2bLocationRoutingEnabled()) {
    return {
      ok: false,
      error: "Shopify B2B location routing is disabled (SHOPIFY_MARKETS_B2B_LOCATION_ROUTING).",
    };
  }

  const importResult = await importShopifyB2bLocationsForConnection({
    userId: input.userId,
    connection: input.connection,
    creds: input.creds,
    settingsCenterJson: input.settingsCenterJson,
    skipUnchanged: input.skipUnchanged ?? true,
  });

  if (!importResult.ok) {
    return { ok: false, error: importResult.error, unavailable: importResult.unavailable };
  }

  const refreshedConn = await prisma.integrationConnection.findUnique({
    where: { id: input.connection.id },
  });
  if (!refreshedConn) {
    return { ok: false, error: "Connection not found after B2B location import." };
  }

  const sync = parseShopifyMarketsSyncSettings(refreshedConn.settingsJson);
  const now = new Date().toISOString();
  const b2bLocationLinks: Record<string, ShopifyB2bLocationLinkRow> = {
    ...sync.b2bLocationLinks,
  };
  let linksApplied = 0;

  if (sync.b2bLocationAuthority === "shopify") {
    for (const importRow of Object.values(sync.b2bLocationImports)) {
      if (b2bLocationLinks[importRow.shopifyLocationId]) continue;
      if (!importRow.suggestedOsMarketId && !importRow.suggestedCompanyAccountId) continue;
      b2bLocationLinks[importRow.shopifyLocationId] = {
        shopifyLocationId: importRow.shopifyLocationId,
        shopifyCompanyId: importRow.shopifyCompanyId,
        osMarketId: importRow.suggestedOsMarketId,
        companyAccountId:
          importRow.suggestedCompanyAccountId ??
          sync.b2bCompanyLinks[importRow.shopifyCompanyId] ??
          null,
        linkedAt: now,
      };
      linksApplied += 1;
    }
  }

  const { conflicts, detected } = detectShopifyB2bLocationConflicts({
    b2bLocationImports: sync.b2bLocationImports,
    b2bLocationLinks,
    b2bCompanyLinks: sync.b2bCompanyLinks,
    b2bLocationAuthority: sync.b2bLocationAuthority,
    existingConflicts: sync.b2bLocationConflicts,
    now,
  });

  let autoResolved = 0;
  for (const conflict of Object.values(conflicts)) {
    if (conflict.status !== "open") continue;
    if (sync.b2bLocationAuthority === "manual") continue;

    if (sync.b2bLocationAuthority === "shopify") {
      const importRow = sync.b2bLocationImports[conflict.shopifyLocationId];
      if (importRow && !b2bLocationLinks[conflict.shopifyLocationId]) {
        b2bLocationLinks[conflict.shopifyLocationId] = {
          shopifyLocationId: importRow.shopifyLocationId,
          shopifyCompanyId: importRow.shopifyCompanyId,
          osMarketId: importRow.suggestedOsMarketId,
          companyAccountId:
            importRow.suggestedCompanyAccountId ??
            sync.b2bCompanyLinks[importRow.shopifyCompanyId] ??
            null,
          linkedAt: now,
        };
        linksApplied += 1;
      }
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_shopify" };
      autoResolved += 1;
    } else {
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
      autoResolved += 1;
    }
  }

  const openConflicts = Object.values(conflicts).filter((row) => row.status === "open").length;
  const resultSummary = [
    `imported=${importResult.locationsImported}`,
    `unchanged=${importResult.locationsUnchanged}`,
    `total=${importResult.locationsTotal}`,
    `conflicts=${detected}`,
    `auto=${autoResolved}`,
    `open=${openConflicts}`,
    `links=${linksApplied}`,
  ].join("; ");

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
          lastB2bLocationReconcileAt: now,
          lastB2bLocationReconcileError: null,
          lastB2bLocationReconcileResult: resultSummary,
          b2bLocationConflicts: conflicts,
          b2bLocationLinks,
        }),
      ),
    },
  });

  return {
    ok: true,
    locationsReconciled: importResult.locationsTotal,
    conflictsDetected: detected,
    conflictsAutoResolved: autoResolved,
    conflictsOpen: openConflicts,
    locationsImported: importResult.locationsImported,
    locationsUnchanged: importResult.locationsUnchanged,
    linksApplied,
  };
}

export async function resolveShopifyB2bLocationConflict(input: {
  connection: IntegrationConnection;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
  osMarketId?: string;
  companyAccountId?: string;
}): Promise<{ ok: true; linked: boolean } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const conflict = sync.b2bLocationConflicts[input.conflictKey];
  if (!conflict) {
    return { ok: false, error: "B2B location conflict not found." };
  }

  const importRow = sync.b2bLocationImports[conflict.shopifyLocationId];
  const updatedConflicts = { ...sync.b2bLocationConflicts };
  const b2bLocationLinks = { ...sync.b2bLocationLinks };
  let linked = false;

  if (input.resolution === "ignore") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "ignored" };
  } else if (input.resolution === "shopify") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_shopify" };
    if (importRow) {
      b2bLocationLinks[conflict.shopifyLocationId] = {
        shopifyLocationId: conflict.shopifyLocationId,
        shopifyCompanyId: importRow.shopifyCompanyId,
        osMarketId: input.osMarketId ?? importRow.suggestedOsMarketId,
        companyAccountId:
          input.companyAccountId ??
          importRow.suggestedCompanyAccountId ??
          sync.b2bCompanyLinks[importRow.shopifyCompanyId] ??
          null,
        linkedAt: new Date().toISOString(),
      };
      linked = true;
    }
  } else {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          b2bLocationConflicts: updatedConflicts,
          b2bLocationLinks,
          lastB2bLocationReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  return { ok: true, linked };
}

export async function linkShopifyB2bLocation(input: {
  connection: IntegrationConnection;
  shopifyLocationId: string;
  osMarketId?: string | null;
  companyAccountId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const importRow = sync.b2bLocationImports[input.shopifyLocationId];
  if (!importRow) {
    return { ok: false, error: "Import B2B locations first." };
  }

  const b2bLocationLinks = {
    ...sync.b2bLocationLinks,
    [input.shopifyLocationId]: {
      shopifyLocationId: input.shopifyLocationId,
      shopifyCompanyId: importRow.shopifyCompanyId,
      osMarketId: input.osMarketId ?? importRow.suggestedOsMarketId,
      companyAccountId:
        input.companyAccountId ??
        importRow.suggestedCompanyAccountId ??
        sync.b2bCompanyLinks[importRow.shopifyCompanyId] ??
        null,
      linkedAt: new Date().toISOString(),
    },
  };

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          b2bLocationLinks,
          lastB2bLocationReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  return { ok: true };
}

export function countOpenShopifyB2bLocationConflicts(
  conflicts: Record<string, ShopifyB2bLocationConflictRow>,
): number {
  return Object.values(conflicts).filter((row) => row.status === "open").length;
}
