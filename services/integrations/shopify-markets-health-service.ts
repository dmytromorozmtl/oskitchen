import type { IntegrationConnection } from "@prisma/client";

import {
  computeMarketsHealthScore,
  isShopifyMarketsHealthDashboardEnabled,
  isTimestampStale,
  levelFromScore,
  overallLevelFromDomains,
  SHOPIFY_MARKETS_DISCOVERY_STALE_MS,
  type MarketsHealthDomainStatus,
  type MarketsHealthLevel,
  type ShopifyMarketsHealthSnapshot,
} from "@/lib/commercial/shopify-markets-health-dashboard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import { importShopifyMarketCatalogForConnection } from "@/services/integrations/shopify-market-catalog-service";
import { importShopifyMarketPricesForConnection } from "@/services/integrations/shopify-market-prices-service";
import {
  hasBidirectionalShopifyMarkets,
  hasImportableShopifyMarkets,
  reconcileBidirectionalShopifyMarketsForConnection,
  countOpenShopifyMarketPriceConflicts,
} from "@/services/integrations/shopify-markets-bidirectional-service";
import { reconcileShopifyMarketHostnameGuardForConnection } from "@/services/integrations/shopify-markets-hostname-guard-bidirectional-service";
import { reconcileShopifyB2bGuardForConnection } from "@/services/integrations/shopify-markets-b2b-guard-bidirectional-service";
import { reconcileShopifyMarketTaxGuardForConnection } from "@/services/integrations/shopify-markets-tax-guard-bidirectional-service";
import { syncShopifyMarketsWebhookRegistryForConnection } from "@/services/integrations/shopify-markets-webhook-registry-service";
import { listShopifyMarkets } from "@/services/integrations/shopify-markets-service";
import {
  hasCatalogSyncShopifyMarkets,
  reconcileBidirectionalShopifyMarketCatalogForConnection,
  countOpenShopifyMarketCatalogConflicts,
} from "@/services/integrations/shopify-markets-catalog-bidirectional-service";
import { countOpenShopifyMarketTaxConflicts } from "@/services/integrations/shopify-markets-tax-guard-bidirectional-service";
import { countOpenShopifyMarketHostnameConflicts } from "@/services/integrations/shopify-markets-hostname-guard-bidirectional-service";
import { countOpenShopifyB2bCompanyConflicts } from "@/services/integrations/shopify-markets-b2b-guard-bidirectional-service";
import { countWebhookRegistryDrift } from "@/services/integrations/shopify-markets-webhook-registry-service";
import { revalidateStorefrontCatalogForOwner } from "@/lib/storefront/revalidate-shopify-market-catalog";

function countSyncModes(markets: StorefrontMarket[]) {
  return {
    import: markets.filter((m) => m.syncMode === "import").length,
    push: markets.filter((m) => m.syncMode === "push").length,
    bidirectional: markets.filter((m) => m.syncMode === "bidirectional").length,
    none: markets.filter((m) => !m.syncMode || m.syncMode === "none").length,
  };
}

function webhookDriftCounts(sync: ShopifyMarketsSyncSettings) {
  const rows = Object.values(sync.marketWebhookRegistry ?? {});
  let missingOrWrong = 0;
  let staleOrNever = 0;
  for (const row of rows) {
    if (row.driftStatus === "missing" || row.driftStatus === "wrong_url") {
      missingOrWrong += 1;
    } else if (row.driftStatus === "stale" || row.driftStatus === "never_delivered") {
      staleOrNever += 1;
    }
  }
  return { missingOrWrong, staleOrNever, total: countWebhookRegistryDrift(sync.marketWebhookRegistry) };
}

function domainLevel(openIssues: number, hasError: boolean, stale: boolean): MarketsHealthLevel {
  if (hasError || openIssues > 0) return "critical";
  if (stale) return "attention";
  return "healthy";
}

export function buildShopifyMarketsHealthSnapshot(input: {
  syncSettings: ShopifyMarketsSyncSettings | null;
  osMarkets: StorefrontMarket[];
  shopifyConnected: boolean;
  computedAt?: string;
}): ShopifyMarketsHealthSnapshot {
  const computedAt = input.computedAt ?? new Date().toISOString();
  const sync = input.syncSettings;
  const linkedMarkets = input.osMarkets.filter((m) => m.shopifyMarketId?.trim() && m.enabled !== false)
    .length;

  const openPriceConflicts = sync
    ? countOpenShopifyMarketPriceConflicts(sync.marketPriceConflicts ?? {})
    : 0;
  const openCatalogConflicts = sync
    ? countOpenShopifyMarketCatalogConflicts(sync.marketCatalogConflicts ?? {})
    : 0;
  const openTaxConflicts = sync ? countOpenShopifyMarketTaxConflicts(sync.marketTaxConflicts ?? {}) : 0;
  const openHostnameConflicts = sync
    ? countOpenShopifyMarketHostnameConflicts(sync.marketHostnameConflicts ?? {})
    : 0;
  const openB2bConflicts = sync
    ? countOpenShopifyB2bCompanyConflicts(sync.b2bCompanyConflicts ?? {})
    : 0;

  const drift = sync ? webhookDriftCounts(sync) : { missingOrWrong: 0, staleOrNever: 0, total: 0 };
  const discoveryStale =
    linkedMarkets > 0 &&
    isTimestampStale(sync?.lastDiscoveryAt ?? null, SHOPIFY_MARKETS_DISCOVERY_STALE_MS);
  const linkedWithoutDiscovery =
    linkedMarkets > 0 && !sync?.lastDiscoveryAt && !sync?.discoveryError;

  const domains: MarketsHealthDomainStatus[] = [
    {
      key: "discovery",
      label: "Market discovery",
      level: domainLevel(0, Boolean(sync?.discoveryError), discoveryStale || linkedWithoutDiscovery),
      summary: sync?.discoveryError
        ? sync.discoveryError
        : sync?.lastDiscoveryAt
          ? `${sync.discoveredMarkets.length} Shopify market(s) cached`
          : linkedMarkets > 0
            ? "Run discovery to cache Shopify markets"
            : "No linked markets",
      lastActivityAt: sync?.lastDiscoveryAt ?? null,
      openIssues: sync?.discoveryError ? 1 : 0,
      linkHref: "/dashboard/integrations/shopify#shopify-markets-discovery",
    },
    {
      key: "prices",
      label: "Price sync",
      level: domainLevel(
        openPriceConflicts,
        Boolean(sync?.priceImportError || sync?.lastBidirectionalReconcileError),
        false,
      ),
      summary:
        openPriceConflicts > 0
          ? `${openPriceConflicts} open price conflict(s)`
          : sync?.lastBidirectionalReconcileAt
            ? `Last reconcile ${sync.lastBidirectionalReconcileResult ?? "ok"}`
            : sync?.lastPriceImportAt
              ? "Price imports cached"
              : "No price sync activity",
      lastActivityAt:
        sync?.lastBidirectionalReconcileAt ?? sync?.lastPriceImportAt ?? sync?.lastWebhookPriceImportAt ?? null,
      openIssues: openPriceConflicts,
      linkHref: "/dashboard/integrations/shopify#shopify-markets-discovery",
    },
    {
      key: "catalog",
      label: "Catalog publications",
      level: domainLevel(
        openCatalogConflicts,
        Boolean(sync?.catalogImportError || sync?.lastCatalogReconcileError),
        false,
      ),
      summary:
        openCatalogConflicts > 0
          ? `${openCatalogConflicts} open catalog conflict(s)`
          : sync?.lastCatalogReconcileAt
            ? `Last reconcile ${sync.lastCatalogReconcileResult ?? "ok"}`
            : sync?.lastCatalogImportAt
              ? "Catalog imports cached"
              : "No catalog sync activity",
      lastActivityAt: sync?.lastCatalogReconcileAt ?? sync?.lastCatalogImportAt ?? null,
      openIssues: openCatalogConflicts,
      linkHref: "/dashboard/integrations/shopify#shopify-markets-discovery",
    },
    {
      key: "tax",
      label: "Tax guard",
      level: domainLevel(openTaxConflicts, Boolean(sync?.taxImportError || sync?.lastTaxReconcileError), false),
      summary:
        openTaxConflicts > 0
          ? `${openTaxConflicts} open tax hint conflict(s)`
          : sync?.lastTaxReconcileAt
            ? `Last reconcile ${sync.lastTaxReconcileResult ?? "ok"}`
            : Object.keys(sync?.marketTaxImports ?? {}).length > 0
              ? "Tax hints cached (reference only)"
              : "No tax guard activity",
      lastActivityAt: sync?.lastTaxReconcileAt ?? sync?.lastTaxImportAt ?? null,
      openIssues: openTaxConflicts,
      linkHref: "/dashboard/storefront/markets",
    },
    {
      key: "hostname",
      label: "Hostname routing",
      level: domainLevel(
        openHostnameConflicts,
        Boolean(sync?.hostnameImportError || sync?.lastHostnameReconcileError),
        false,
      ),
      summary:
        openHostnameConflicts > 0
          ? `${openHostnameConflicts} open hostname conflict(s)`
          : sync?.lastHostnameReconcileAt
            ? `Last reconcile ${sync.lastHostnameReconcileResult ?? "ok"}`
            : Object.keys(sync?.marketHostnameImports ?? {}).length > 0
              ? "Hostname hints cached"
              : "No hostname guard activity",
      lastActivityAt: sync?.lastHostnameReconcileAt ?? sync?.lastHostnameImportAt ?? null,
      openIssues: openHostnameConflicts,
      linkHref: "/dashboard/storefront/domains",
    },
    {
      key: "webhooks",
      label: "Webhook registry",
      level: domainLevel(
        drift.missingOrWrong,
        Boolean(sync?.webhookRegistrySyncError),
        drift.staleOrNever > 0,
      ),
      summary:
        drift.total > 0
          ? `${drift.total} webhook drift issue(s)`
          : sync?.lastWebhookRegistrySyncAt
            ? "All markets webhooks healthy"
            : "Registry not synced yet",
      lastActivityAt: sync?.lastWebhookRegistrySyncAt ?? null,
      openIssues: drift.total,
      linkHref: "/dashboard/integrations/shopify#shopify-markets-webhook-registry",
    },
    {
      key: "b2b",
      label: "B2B companies",
      level: domainLevel(
        openB2bConflicts,
        Boolean(sync?.b2bImportError || sync?.lastB2bReconcileError),
        Boolean(sync?.b2bUnavailableReason),
      ),
      summary:
        sync?.b2bUnavailableReason
          ? sync.b2bUnavailableReason
          : openB2bConflicts > 0
            ? `${openB2bConflicts} open B2B company conflict(s)`
            : sync?.lastB2bReconcileAt
              ? `Last reconcile ${sync.lastB2bReconcileResult ?? "ok"}`
              : Object.keys(sync?.b2bCompanyImports ?? {}).length > 0
                ? `${Object.keys(sync?.b2bCompanyImports ?? {}).length} Shopify B2B company hint(s) cached`
                : "No B2B guard activity",
      lastActivityAt: sync?.lastB2bReconcileAt ?? sync?.lastB2bImportAt ?? null,
      openIssues: openB2bConflicts,
      linkHref: "/dashboard/integrations/shopify#shopify-markets-b2b-guard",
    },
  ];

  const overallScore = computeMarketsHealthScore({
    openPriceConflicts,
    openCatalogConflicts,
    openTaxConflicts,
    openHostnameConflicts,
    openB2bConflicts,
    webhookMissingOrWrong: drift.missingOrWrong,
    webhookStaleOrNever: drift.staleOrNever,
    discoveryError: Boolean(sync?.discoveryError),
    linkedMarketsWithoutDiscovery: linkedWithoutDiscovery,
    discoveryStale,
    b2bUnavailable: Boolean(sync?.b2bUnavailableReason),
  });

  const overallLevel = overallLevelFromDomains(domains);
  const scoreLevel = levelFromScore(overallScore);
  const finalLevel: MarketsHealthLevel =
    overallLevel === "critical" || scoreLevel === "critical"
      ? "critical"
      : overallLevel === "attention" || scoreLevel === "attention"
        ? "attention"
        : "healthy";

  const recommendations: string[] = [];
  if (!input.shopifyConnected) {
    recommendations.push("Connect Shopify under Integrations → Shopify.");
  }
  if (linkedMarkets > 0 && !sync?.lastDiscoveryAt) {
    recommendations.push("Run market discovery after linking OS Kitchen markets.");
  }
  if (openPriceConflicts > 0 || openCatalogConflicts > 0) {
    recommendations.push("Resolve open price or catalog conflicts on the Shopify integration panel.");
  }
  if (drift.missingOrWrong > 0) {
    recommendations.push("Register missing markets webhooks from the webhook registry panel.");
  }
  if (openTaxConflicts > 0 || openHostnameConflicts > 0) {
    recommendations.push("Review tax and hostname conflicts on Storefront → Markets.");
  }
  if (openB2bConflicts > 0) {
    recommendations.push(
      "Link Shopify B2B companies to KitchenOS company accounts on Integrations → Shopify.",
    );
  }
  if (recommendations.length === 0 && linkedMarkets > 0) {
    recommendations.push("Run full reconcile weekly to keep import-mode markets fresh.");
  }

  return {
    computedAt,
    overallLevel: finalLevel,
    overallScore: overallScore,
    shopifyConnected: input.shopifyConnected,
    linkedMarkets,
    totalMarkets: input.osMarkets.filter((m) => m.enabled !== false).length,
    syncModeSummary: countSyncModes(input.osMarkets),
    domains,
    openPriceConflicts,
    openCatalogConflicts,
    openTaxConflicts,
    openHostnameConflicts,
    openB2bConflicts,
    webhookDriftCount: drift.total,
    recommendations,
  };
}

export type FullMarketsReconcileResult =
  | {
      ok: true;
      steps: string[];
      snapshot: ShopifyMarketsHealthSnapshot;
    }
  | { ok: false; error: string; steps: string[] };

export async function runFullShopifyMarketsReconcileForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  primaryStoreSlug: string;
  settingsCenterJson: unknown;
}): Promise<FullMarketsReconcileResult> {
  if (!isShopifyMarketsHealthDashboardEnabled()) {
    return { ok: false, error: "Markets health dashboard is disabled.", steps: [] };
  }

  const steps: string[] = [];
  let conn = input.connection;

  const discovery = await listShopifyMarkets(input.creds);
  const now = new Date().toISOString();
  if (discovery.ok) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(conn.settingsJson, {
            lastDiscoveryAt: now,
            discoveredMarkets: discovery.markets,
            primaryShopifyMarketId: discovery.primaryMarketId,
            discoveryError: null,
          }),
        ),
      },
    });
    steps.push(`discovery: ${discovery.markets.length} markets`);
  } else {
    steps.push(`discovery: failed (${discovery.error})`);
  }

  conn =
    (await prisma.integrationConnection.findUnique({ where: { id: conn.id } })) ?? conn;

  const webhookSync = await syncShopifyMarketsWebhookRegistryForConnection({
    connection: conn,
    creds: input.creds,
  });
  steps.push(
    webhookSync.ok
      ? `webhooks: drift=${webhookSync.driftOpen}`
      : `webhooks: failed (${webhookSync.error})`,
  );

  conn =
    (await prisma.integrationConnection.findUnique({ where: { id: conn.id } })) ?? conn;

  if (hasBidirectionalShopifyMarkets(input.settingsCenterJson)) {
    const priceReconcile = await reconcileBidirectionalShopifyMarketsForConnection({
      userId: input.userId,
      connection: conn,
      creds: input.creds,
      origin: "manual",
      skipUnchanged: false,
    });
    steps.push(
      priceReconcile.ok
        ? `prices: reconcile open=${priceReconcile.conflictsOpen}`
        : `prices: failed (${priceReconcile.error})`,
    );
  } else if (hasImportableShopifyMarkets(input.settingsCenterJson)) {
    const priceImport = await importShopifyMarketPricesForConnection({
      userId: input.userId,
      connection: conn,
      creds: input.creds,
    });
    steps.push(
      priceImport.ok
        ? `prices: imported=${priceImport.marketsImported}`
        : `prices: failed (${priceImport.error})`,
    );
  } else {
    steps.push("prices: skipped (no import/bidirectional markets)");
  }

  conn =
    (await prisma.integrationConnection.findUnique({ where: { id: conn.id } })) ?? conn;

  if (hasCatalogSyncShopifyMarkets(input.settingsCenterJson)) {
    const catalogReconcile = await reconcileBidirectionalShopifyMarketCatalogForConnection({
      userId: input.userId,
      connection: conn,
      creds: input.creds,
      origin: "manual",
      skipUnchanged: false,
    });
    steps.push(
      catalogReconcile.ok
        ? `catalog: reconcile open=${catalogReconcile.conflictsOpen}`
        : `catalog: failed (${catalogReconcile.error})`,
    );
  } else {
    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: input.userId },
      select: { settingsCenterJson: true },
    });
    const { listCatalogImportableStorefrontMarkets } = await import(
      "@/services/integrations/shopify-market-catalog-service"
    );
    if (listCatalogImportableStorefrontMarkets(kitchen?.settingsCenterJson).length > 0) {
      const catalogImport = await importShopifyMarketCatalogForConnection({
        userId: input.userId,
        connection: conn,
        creds: input.creds,
      });
      steps.push(
        catalogImport.ok
          ? `catalog: imported=${catalogImport.marketsImported}`
          : `catalog: failed (${catalogImport.error})`,
      );
    } else {
      steps.push("catalog: skipped");
    }
  }

  conn =
    (await prisma.integrationConnection.findUnique({ where: { id: conn.id } })) ?? conn;

  const taxReconcile = await reconcileShopifyMarketTaxGuardForConnection({
    userId: input.userId,
    connection: conn,
    creds: input.creds,
    origin: "manual",
    skipUnchanged: false,
  });
  steps.push(
    taxReconcile.ok
      ? `tax: open=${taxReconcile.conflictsOpen}`
      : `tax: skipped/failed (${taxReconcile.error})`,
  );

  conn =
    (await prisma.integrationConnection.findUnique({ where: { id: conn.id } })) ?? conn;

  const hostnameReconcile = await reconcileShopifyMarketHostnameGuardForConnection({
    userId: input.userId,
    connection: conn,
    creds: input.creds,
    primaryStoreSlug: input.primaryStoreSlug,
    origin: "manual",
    skipUnchanged: false,
  });
  steps.push(
    hostnameReconcile.ok
      ? `hostname: open=${hostnameReconcile.conflictsOpen} applied=${hostnameReconcile.appliedMarkets}`
      : `hostname: skipped/failed (${hostnameReconcile.error})`,
  );

  conn =
    (await prisma.integrationConnection.findUnique({ where: { id: conn.id } })) ?? conn;

  const b2bReconcile = await reconcileShopifyB2bGuardForConnection({
    userId: input.userId,
    connection: conn,
    creds: input.creds,
    origin: "full_reconcile",
    skipUnchanged: false,
  });
  steps.push(
    b2bReconcile.ok
      ? `b2b: open=${b2bReconcile.conflictsOpen} links=${b2bReconcile.linksApplied}`
      : b2bReconcile.unavailable
        ? `b2b: unavailable (${b2bReconcile.error})`
        : `b2b: skipped/failed (${b2bReconcile.error})`,
  );

  conn =
    (await prisma.integrationConnection.findUnique({ where: { id: conn.id } })) ?? conn;

  const resultSummary = steps.join("; ");
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(conn.settingsJson, {
          lastFullMarketsReconcileAt: now,
          lastFullMarketsReconcileResult: resultSummary,
          lastFullMarketsReconcileError: null,
        }),
      ),
    },
  });

  await revalidateStorefrontCatalogForOwner(input.userId);

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  const refreshedConn = await prisma.integrationConnection.findUnique({ where: { id: conn.id } });
  const osMarkets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);
  const sync = parseShopifyMarketsSyncSettings(refreshedConn?.settingsJson);

  const snapshot = buildShopifyMarketsHealthSnapshot({
    syncSettings: sync,
    osMarkets,
    shopifyConnected: true,
    computedAt: now,
  });

  if (!discovery.ok && steps.filter((s) => s.includes("failed")).length === steps.length) {
    return { ok: false, error: discovery.error, steps };
  }

  return { ok: true, steps, snapshot };
}
