import type { IntegrationConnection } from "@prisma/client";

import {
  b2bCompanyNamesMatch,
  b2bEmailsMatch,
  isShopifyMarketsB2bGuardEnabled,
} from "@/lib/commercial/shopify-market-b2b-guard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyB2bCompanyConflictRow,
  type ShopifyB2bCompanyConflictType,
  type ShopifyB2bCompanyImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import { importShopifyB2bCompaniesForConnection } from "@/services/integrations/shopify-market-b2b-service";

export type ShopifyB2bGuardReconcileResult =
  | {
      ok: true;
      companiesReconciled: number;
      conflictsDetected: number;
      conflictsAutoResolved: number;
      conflictsOpen: number;
      companiesImported: number;
      companiesUnchanged: number;
      linksApplied: number;
    }
  | { ok: false; error: string; unavailable?: boolean };

export function buildShopifyB2bCompanyConflictKey(
  shopifyCompanyId: string,
  conflictType: ShopifyB2bCompanyConflictType,
): string {
  return `b2b:${shopifyCompanyId}:${conflictType}`;
}

function formatShopifyCompanySummary(importRow: ShopifyB2bCompanyImportRow): string {
  const regions =
    importRow.locationCountries.length > 0 ? importRow.locationCountries.join(", ") : "—";
  return [
    importRow.name,
    importRow.mainContactEmail ? `email=${importRow.mainContactEmail}` : null,
    `${importRow.locationCount} location(s)`,
    `regions=${regions}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function detectShopifyB2bCompanyConflicts(input: {
  b2bCompanyImports: Record<string, ShopifyB2bCompanyImportRow>;
  b2bCompanyLinks: Record<string, string>;
  companyAccounts: Array<{ id: string; name: string; billingEmail: string | null }>;
  b2bAuthority: "shopify" | "kitchenos" | "manual";
  existingConflicts: Record<string, ShopifyB2bCompanyConflictRow>;
  now?: string;
}): {
  conflicts: Record<string, ShopifyB2bCompanyConflictRow>;
  detected: number;
} {
  const now = input.now ?? new Date().toISOString();
  const conflicts: Record<string, ShopifyB2bCompanyConflictRow> = {
    ...input.existingConflicts,
  };
  let detected = 0;
  const activeKeys = new Set<string>();

  const accountById = new Map(input.companyAccounts.map((row) => [row.id, row]));
  const linkTargets = new Map<string, string[]>();

  for (const [shopifyCompanyId, companyAccountId] of Object.entries(input.b2bCompanyLinks)) {
    const list = linkTargets.get(companyAccountId) ?? [];
    list.push(shopifyCompanyId);
    linkTargets.set(companyAccountId, list);
  }

  for (const importRow of Object.values(input.b2bCompanyImports)) {
    const authority = input.b2bAuthority;
    const shopifySummary = formatShopifyCompanySummary(importRow);
    const linkedAccountId =
      input.b2bCompanyLinks[importRow.shopifyCompanyId] ??
      importRow.suggestedCompanyAccountId ??
      null;

    const candidates: Array<{
      type: ShopifyB2bCompanyConflictType;
      companyAccountId: string | null;
      kitchenosSummary: string;
    }> = [];

    if (!input.b2bCompanyLinks[importRow.shopifyCompanyId]) {
      candidates.push({
        type: "UNMAPPED",
        companyAccountId: linkedAccountId,
        kitchenosSummary: linkedAccountId
          ? `Suggested link to ${accountById.get(linkedAccountId)?.name ?? linkedAccountId}`
          : "No KitchenOS company account linked",
      });
    }

    const resolvedAccountId = input.b2bCompanyLinks[importRow.shopifyCompanyId];
    if (resolvedAccountId) {
      const account = accountById.get(resolvedAccountId);
      if (account && !b2bCompanyNamesMatch(account.name, importRow.name)) {
        candidates.push({
          type: "NAME_MISMATCH",
          companyAccountId: resolvedAccountId,
          kitchenosSummary: `KitchenOS name "${account.name}"`,
        });
      }
      if (
        account &&
        importRow.mainContactEmail &&
        account.billingEmail &&
        !b2bEmailsMatch(account.billingEmail, importRow.mainContactEmail)
      ) {
        candidates.push({
          type: "EMAIL_MISMATCH",
          companyAccountId: resolvedAccountId,
          kitchenosSummary: `KitchenOS billing ${account.billingEmail}`,
        });
      }

      const duplicates = linkTargets.get(resolvedAccountId) ?? [];
      if (duplicates.length > 1) {
        candidates.push({
          type: "DUPLICATE_LINK",
          companyAccountId: resolvedAccountId,
          kitchenosSummary: `${duplicates.length} Shopify companies linked to same account`,
        });
      }
    }

    for (const candidate of candidates) {
      const conflictKey = buildShopifyB2bCompanyConflictKey(importRow.shopifyCompanyId, candidate.type);
      activeKeys.add(conflictKey);
      detected += 1;

      const previous = conflicts[conflictKey];
      if (previous?.status !== "open" && previous?.status !== undefined) {
        continue;
      }

      conflicts[conflictKey] = {
        conflictKey,
        shopifyCompanyId: importRow.shopifyCompanyId,
        companyAccountId: candidate.companyAccountId,
        conflictType: candidate.type,
        shopifySummary,
        kitchenosSummary: candidate.kitchenosSummary,
        detectedAt: now,
        status: "open",
        b2bAuthority: authority,
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

export async function applyShopifyB2bImportToCompanyAccount(input: {
  userId: string;
  companyAccountId: string;
  importRow: ShopifyB2bCompanyImportRow;
}): Promise<boolean> {
  const account = await prisma.companyAccount.findFirst({
    where: { id: input.companyAccountId, userId: input.userId },
    select: { id: true },
  });
  if (!account) return false;

  await prisma.companyAccount.update({
    where: { id: input.companyAccountId },
    data: {
      name: input.importRow.name,
      billingEmail: input.importRow.mainContactEmail ?? undefined,
    },
  });
  return true;
}

export async function reconcileShopifyB2bGuardForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  origin?: "manual" | "webhook" | "full_reconcile";
  skipUnchanged?: boolean;
}): Promise<ShopifyB2bGuardReconcileResult> {
  if (!isShopifyMarketsB2bGuardEnabled()) {
    return {
      ok: false,
      error: "Shopify Markets B2B guard is disabled (SHOPIFY_MARKETS_B2B_GUARD).",
    };
  }

  const importResult = await importShopifyB2bCompaniesForConnection({
    userId: input.userId,
    connection: input.connection,
    creds: input.creds,
    skipUnchanged: input.skipUnchanged ?? true,
  });

  if (!importResult.ok) {
    return { ok: false, error: importResult.error, unavailable: importResult.unavailable };
  }

  const refreshedConn = await prisma.integrationConnection.findUnique({
    where: { id: input.connection.id },
  });
  if (!refreshedConn) {
    return { ok: false, error: "Connection not found after B2B import." };
  }

  const sync = parseShopifyMarketsSyncSettings(refreshedConn.settingsJson);
  const companyAccounts = await prisma.companyAccount.findMany({
    where: { userId: input.userId },
    select: { id: true, name: true, billingEmail: true },
  });

  const now = new Date().toISOString();
  const b2bCompanyLinks = { ...sync.b2bCompanyLinks };
  let linksApplied = 0;

  if (sync.b2bAuthority === "shopify") {
    for (const importRow of Object.values(sync.b2bCompanyImports)) {
      if (b2bCompanyLinks[importRow.shopifyCompanyId]) continue;
      if (!importRow.suggestedCompanyAccountId) continue;
      b2bCompanyLinks[importRow.shopifyCompanyId] = importRow.suggestedCompanyAccountId;
      linksApplied += 1;
    }
  }

  const { conflicts, detected } = detectShopifyB2bCompanyConflicts({
    b2bCompanyImports: sync.b2bCompanyImports,
    b2bCompanyLinks,
    companyAccounts,
    b2bAuthority: sync.b2bAuthority,
    existingConflicts: sync.b2bCompanyConflicts,
    now,
  });

  let autoResolved = 0;

  for (const conflict of Object.values(conflicts)) {
    if (conflict.status !== "open") continue;
    const authority = sync.b2bAuthority;
    if (authority === "manual") continue;

    if (authority === "shopify") {
      if (conflict.conflictType === "UNMAPPED" && conflict.companyAccountId) {
        b2bCompanyLinks[conflict.shopifyCompanyId] = conflict.companyAccountId;
        linksApplied += 1;
      }
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_shopify" };
      autoResolved += 1;
    } else {
      conflicts[conflict.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
      autoResolved += 1;
    }
  }

  if (sync.b2bAuthority === "shopify") {
    for (const [shopifyCompanyId, companyAccountId] of Object.entries(b2bCompanyLinks)) {
      const importRow = sync.b2bCompanyImports[shopifyCompanyId];
      if (!importRow) continue;
      const openForCompany = Object.values(conflicts).some(
        (row) => row.shopifyCompanyId === shopifyCompanyId && row.status === "open",
      );
      if (openForCompany) continue;
      await applyShopifyB2bImportToCompanyAccount({
        userId: input.userId,
        companyAccountId,
        importRow,
      });
    }
  }

  const openConflicts = Object.values(conflicts).filter((row) => row.status === "open").length;
  const resultSummary = [
    `imported=${importResult.companiesImported}`,
    `unchanged=${importResult.companiesUnchanged}`,
    `total=${importResult.companiesTotal}`,
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
          lastB2bReconcileAt: now,
          lastB2bReconcileError: null,
          lastB2bReconcileResult: resultSummary,
          b2bCompanyConflicts: conflicts,
          b2bCompanyLinks,
        }),
      ),
    },
  });

  return {
    ok: true,
    companiesReconciled: importResult.companiesTotal,
    conflictsDetected: detected,
    conflictsAutoResolved: autoResolved,
    conflictsOpen: openConflicts,
    companiesImported: importResult.companiesImported,
    companiesUnchanged: importResult.companiesUnchanged,
    linksApplied,
  };
}

export async function resolveShopifyB2bCompanyConflict(input: {
  userId: string;
  connection: IntegrationConnection;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
  companyAccountId?: string;
}): Promise<{ ok: true; linked: boolean; applied: boolean } | { ok: false; error: string }> {
  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const conflict = sync.b2bCompanyConflicts[input.conflictKey];
  if (!conflict) {
    return { ok: false, error: "B2B company conflict not found." };
  }

  const importRow = sync.b2bCompanyImports[conflict.shopifyCompanyId];
  const updatedConflicts = { ...sync.b2bCompanyConflicts };
  const b2bCompanyLinks = { ...sync.b2bCompanyLinks };
  let linked = false;
  let applied = false;

  if (input.resolution === "ignore") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "ignored" };
  } else if (input.resolution === "shopify") {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_shopify" };
    const targetAccountId =
      input.companyAccountId ?? conflict.companyAccountId ?? importRow?.suggestedCompanyAccountId;
    if (targetAccountId) {
      b2bCompanyLinks[conflict.shopifyCompanyId] = targetAccountId;
      linked = true;
      if (importRow) {
        applied = await applyShopifyB2bImportToCompanyAccount({
          userId: input.userId,
          companyAccountId: targetAccountId,
          importRow,
        });
      }
    }
  } else {
    updatedConflicts[input.conflictKey] = { ...conflict, status: "resolved_kitchenos" };
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          b2bCompanyConflicts: updatedConflicts,
          b2bCompanyLinks,
          lastB2bReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  return { ok: true, linked, applied };
}

export async function linkShopifyB2bCompanyToAccount(input: {
  userId: string;
  connection: IntegrationConnection;
  shopifyCompanyId: string;
  companyAccountId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const account = await prisma.companyAccount.findFirst({
    where: { id: input.companyAccountId, userId: input.userId },
    select: { id: true },
  });
  if (!account) {
    return { ok: false, error: "KitchenOS company account not found." };
  }

  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  if (!sync.b2bCompanyImports[input.shopifyCompanyId]) {
    return { ok: false, error: "Import Shopify B2B companies first." };
  }

  const b2bCompanyLinks = {
    ...sync.b2bCompanyLinks,
    [input.shopifyCompanyId]: input.companyAccountId,
  };

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          b2bCompanyLinks,
          lastB2bReconcileAt: new Date().toISOString(),
        }),
      ),
    },
  });

  return { ok: true };
}

export function countOpenShopifyB2bCompanyConflicts(
  conflicts: Record<string, ShopifyB2bCompanyConflictRow>,
): number {
  return Object.values(conflicts).filter((row) => row.status === "open").length;
}

export function hasB2bGuardShopifyConnection(sync: { b2bUnavailableReason?: string | null }): boolean {
  if (!isShopifyMarketsB2bGuardEnabled()) return false;
  return !sync.b2bUnavailableReason;
}
