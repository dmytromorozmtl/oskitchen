"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Globe2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShopifyMarketsActionToolbar } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-action-toolbar";
import { ShopifyMarketsB2bSection } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-b2b-section";
import type { ShopifyMarketsPanelProps } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-panel-types";
import { ShopifyMarketsRoutingSection } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-routing-section";
import { ShopifyMarketsSyncSection } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-sync-section";

export type { ShopifyMarketsPanelProps } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-panel-types";

export function ShopifyMarketsPanel({
  connectionId,
  hasCredentials,
  syncSettings,
  canManage,
  b2bDunningDigestPreview = null,
  b2bCollectorDigestPreview = null,
}: ShopifyMarketsPanelProps) {
  const [discoverPending, startDiscover] = useTransition();
  const [importPending, startImport] = useTransition();
  const [pushPending, startPush] = useTransition();
  const [reconcilePending, startReconcile] = useTransition();
  const [resolvePending, startResolve] = useTransition();
  const [catalogImportPending, startCatalogImport] = useTransition();
  const [catalogPushPending, startCatalogPush] = useTransition();
  const [catalogReconcilePending, startCatalogReconcile] = useTransition();
  const [catalogResolvePending, startCatalogResolve] = useTransition();
  const [taxImportPending, startTaxImport] = useTransition();
  const [taxReconcilePending, startTaxReconcile] = useTransition();
  const [taxResolvePending, startTaxResolve] = useTransition();
  const [hostnameImportPending, startHostnameImport] = useTransition();
  const [hostnameReconcilePending, startHostnameReconcile] = useTransition();
  const [hostnameResolvePending, startHostnameResolve] = useTransition();
  const [hostnameApplyPending, startHostnameApply] = useTransition();
  const [b2bImportPending, startB2bImport] = useTransition();
  const [b2bReconcilePending, startB2bReconcile] = useTransition();
  const [b2bResolvePending, startB2bResolve] = useTransition();
  const [b2bLocationImportPending, startB2bLocationImport] = useTransition();
  const [b2bLocationReconcilePending, startB2bLocationReconcile] = useTransition();
  const [b2bLocationResolvePending, startB2bLocationResolve] = useTransition();
  const pending =
    discoverPending ||
    importPending ||
    pushPending ||
    reconcilePending ||
    resolvePending ||
    catalogImportPending ||
    catalogPushPending ||
    catalogReconcilePending ||
    catalogResolvePending ||
    taxImportPending ||
    taxReconcilePending ||
    taxResolvePending ||
    hostnameImportPending ||
    hostnameReconcilePending ||
    hostnameResolvePending ||
    hostnameApplyPending ||
    b2bImportPending ||
    b2bReconcilePending ||
    b2bResolvePending ||
    b2bLocationImportPending ||
    b2bLocationReconcilePending ||
    b2bLocationResolvePending;

  const importedMarkets = Object.values(syncSettings.marketPriceImports ?? {});
  const exportedMarkets = Object.values(syncSettings.marketPriceExports ?? {});
  const importedCatalogMarkets = Object.values(syncSettings.marketCatalogImports ?? {});
  const exportedCatalogMarkets = Object.values(syncSettings.marketCatalogExports ?? {});
  const openConflicts = Object.values(syncSettings.marketPriceConflicts ?? {}).filter(
    (row) => row.status === "open",
  );
  const openCatalogConflicts = Object.values(syncSettings.marketCatalogConflicts ?? {}).filter(
    (row) => row.status === "open",
  );
  const importedTaxMarkets = Object.values(syncSettings.marketTaxImports ?? {});
  const openTaxConflicts = Object.values(syncSettings.marketTaxConflicts ?? {}).filter(
    (row) => row.status === "open",
  );
  const importedHostnameMarkets = Object.values(syncSettings.marketHostnameImports ?? {});
  const openHostnameConflicts = Object.values(syncSettings.marketHostnameConflicts ?? {}).filter(
    (row) => row.status === "open",
  );
  const importedB2bCompanies = Object.values(syncSettings.b2bCompanyImports ?? {});
  const openB2bConflicts = Object.values(syncSettings.b2bCompanyConflicts ?? {}).filter(
    (row) => row.status === "open",
  );
  const linkedB2bCount = Object.keys(syncSettings.b2bCompanyLinks ?? {}).length;
  const importedB2bLocations = Object.values(syncSettings.b2bLocationImports ?? {});
  const openB2bLocationConflicts = Object.values(syncSettings.b2bLocationConflicts ?? {}).filter(
    (row) => row.status === "open",
  );
  const linkedB2bLocationCount = Object.keys(syncSettings.b2bLocationLinks ?? {}).length;
  const totalMappedPrices = importedMarkets.reduce(
    (sum, row) => sum + row.mappedProductCount,
    0,
  );
  const totalPushedVariants = exportedMarkets.reduce(
    (sum, row) => sum + row.pushedVariantCount,
    0,
  );

  return (
    <Card id="shopify-markets-discovery" className="scroll-mt-24 border-border/80">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe2 className="h-4 w-4" />
              Shopify Markets — Phase 8 BETA
            </CardTitle>
            <CardDescription>
              Discover Shopify markets, link them on Storefront → Markets, then sync prices, catalog,
              tax/duty hints, and hostname routing for mapped products. Bidirectional markets reconcile
              with priceAuthority, catalogAuthority, taxAuthority, and hostnameAuthority per market.
            </CardDescription>
          </div>
          <Badge variant="outline">markets_sync BETA</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Scopes: <code className="rounded bg-muted px-1">read_markets</code>,{" "}
          <code className="rounded bg-muted px-1">read_products</code>
          {", "}
          <code className="rounded bg-muted px-1">write_products</code> (push/bidirectional),{" "}
          <code className="rounded bg-muted px-1">write_publications</code> (catalog push). KitchenOS wins
          on menu composition when productIds is set; empty productIds fills from Shopify import.
        </p>

        {!connectionId || !hasCredentials ? (
          <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
            Save Shopify credentials above before running market discovery.
          </p>
        ) : null}

        {syncSettings.lastDiscoveryAt ? (
          <p className="text-xs text-muted-foreground">
            Last discovery{" "}
            {formatDistanceToNow(new Date(syncSettings.lastDiscoveryAt), { addSuffix: true })}
            {syncSettings.primaryShopifyMarketId ? (
              <>
                {" "}
                · primary{" "}
                <span className="font-mono">{syncSettings.primaryShopifyMarketId}</span>
              </>
            ) : null}
          </p>
        ) : null}

        {syncSettings.discoveryError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {syncSettings.discoveryError}
          </p>
        ) : null}

        <ShopifyMarketsActionToolbar
          canManage={canManage}
          connectionId={connectionId}
          hasCredentials={hasCredentials}
          pending={pending}
          discoverPending={discoverPending}
          startDiscover={startDiscover}
          importPending={importPending}
          startImport={startImport}
          pushPending={pushPending}
          startPush={startPush}
          reconcilePending={reconcilePending}
          startReconcile={startReconcile}
          catalogImportPending={catalogImportPending}
          startCatalogImport={startCatalogImport}
          catalogPushPending={catalogPushPending}
          startCatalogPush={startCatalogPush}
          catalogReconcilePending={catalogReconcilePending}
          startCatalogReconcile={startCatalogReconcile}
          taxImportPending={taxImportPending}
          startTaxImport={startTaxImport}
          taxReconcilePending={taxReconcilePending}
          startTaxReconcile={startTaxReconcile}
          hostnameImportPending={hostnameImportPending}
          startHostnameImport={startHostnameImport}
          hostnameReconcilePending={hostnameReconcilePending}
          startHostnameReconcile={startHostnameReconcile}
          b2bImportPending={b2bImportPending}
          startB2bImport={startB2bImport}
          b2bReconcilePending={b2bReconcilePending}
          startB2bReconcile={startB2bReconcile}
          b2bLocationImportPending={b2bLocationImportPending}
          startB2bLocationImport={startB2bLocationImport}
          b2bLocationReconcilePending={b2bLocationReconcilePending}
          startB2bLocationReconcile={startB2bLocationReconcile}
        />

        <ShopifyMarketsRoutingSection
          canManage={canManage}
          connectionId={connectionId}
          syncSettings={syncSettings}
          openHostnameConflicts={openHostnameConflicts}
          importedHostnameMarkets={importedHostnameMarkets}
          openTaxConflicts={openTaxConflicts}
          importedTaxMarkets={importedTaxMarkets}
          hostnameResolvePending={hostnameResolvePending}
          startHostnameResolve={startHostnameResolve}
          hostnameApplyPending={hostnameApplyPending}
          startHostnameApply={startHostnameApply}
          taxResolvePending={taxResolvePending}
          startTaxResolve={startTaxResolve}
        />

        <ShopifyMarketsB2bSection
          canManage={canManage}
          connectionId={connectionId}
          syncSettings={syncSettings}
          openB2bConflicts={openB2bConflicts}
          importedB2bCompanies={importedB2bCompanies}
          linkedB2bCount={linkedB2bCount}
          openB2bLocationConflicts={openB2bLocationConflicts}
          importedB2bLocations={importedB2bLocations}
          linkedB2bLocationCount={linkedB2bLocationCount}
          b2bDunningDigestPreview={b2bDunningDigestPreview}
          b2bCollectorDigestPreview={b2bCollectorDigestPreview}
          b2bResolvePending={b2bResolvePending}
          startB2bResolve={startB2bResolve}
          b2bLocationResolvePending={b2bLocationResolvePending}
          startB2bLocationResolve={startB2bLocationResolve}
        />

        <ShopifyMarketsSyncSection
          canManage={canManage}
          connectionId={connectionId}
          syncSettings={syncSettings}
          openConflicts={openConflicts}
          openCatalogConflicts={openCatalogConflicts}
          importedMarkets={importedMarkets}
          exportedMarkets={exportedMarkets}
          importedCatalogMarkets={importedCatalogMarkets}
          exportedCatalogMarkets={exportedCatalogMarkets}
          totalMappedPrices={totalMappedPrices}
          totalPushedVariants={totalPushedVariants}
          resolvePending={resolvePending}
          startResolve={startResolve}
          catalogResolvePending={catalogResolvePending}
          startCatalogResolve={startCatalogResolve}
        />
      </CardContent>
    </Card>
  );
}
