"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import type { ShopifyMarketRow } from "@/services/integrations/shopify-markets-service";

type ShopifyMarketsMappingSummaryProps = {
  osMarkets: StorefrontMarket[];
  shopifyMarkets: ShopifyMarketRow[];
  syncSettings: ShopifyMarketsSyncSettings | null;
  shopifyConnected: boolean;
};

export function ShopifyMarketsMappingSummary({
  osMarkets,
  shopifyMarkets,
  syncSettings,
  shopifyConnected,
}: ShopifyMarketsMappingSummaryProps) {
  const linked = osMarkets.filter((m) => m.shopifyMarketId).length;
  const importMode = osMarkets.filter((m) => m.syncMode === "import").length;
  const pushMode = osMarkets.filter((m) => m.syncMode === "push").length;
  const bidirectionalMode = osMarkets.filter((m) => m.syncMode === "bidirectional").length;
  const openConflicts = syncSettings
    ? Object.values(syncSettings.marketPriceConflicts ?? {}).filter((row) => row.status === "open").length
    : 0;
  const openCatalogConflicts = syncSettings
    ? Object.values(syncSettings.marketCatalogConflicts ?? {}).filter((row) => row.status === "open").length
    : 0;
  const openTaxConflicts = syncSettings
    ? Object.values(syncSettings.marketTaxConflicts ?? {}).filter((row) => row.status === "open").length
    : 0;
  const openHostnameConflicts = syncSettings
    ? Object.values(syncSettings.marketHostnameConflicts ?? {}).filter((row) => row.status === "open")
        .length
    : 0;
  const priceRows = syncSettings ? Object.values(syncSettings.marketPriceImports ?? {}) : [];
  const exportRows = syncSettings ? Object.values(syncSettings.marketPriceExports ?? {}) : [];
  const catalogRows = syncSettings ? Object.values(syncSettings.marketCatalogImports ?? {}) : [];
  const taxRows = syncSettings ? Object.values(syncSettings.marketTaxImports ?? {}) : [];
  const hostnameRows = syncSettings ? Object.values(syncSettings.marketHostnameImports ?? {}) : [];
  const mappedPrices = priceRows.reduce((sum, row) => sum + row.mappedProductCount, 0);
  const pushedVariants = exportRows.reduce((sum, row) => sum + row.pushedVariantCount, 0);
  const mappedCatalogProducts = catalogRows.reduce((sum, row) => sum + row.mappedProductCount, 0);

  return (
    <Card className="border-border/80 bg-muted/10">
      <CardHeader>
        <CardTitle className="text-base">Shopify Markets mapping</CardTitle>
        <CardDescription>
          Phase 10 — operational health dashboard below. Link OS Kitchen markets to Shopify, sync
          prices, catalog, tax/duty hints, and hostname routing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!shopifyConnected ? (
          <p className="text-muted-foreground">
            Connect Shopify under{" "}
            <Link href="/dashboard/integrations/shopify" className="underline">
              Integrations → Shopify
            </Link>{" "}
            to discover markets.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{shopifyMarkets.length} Shopify market(s) cached</Badge>
              <Badge variant="secondary">
                {linked}/{osMarkets.length} OS market(s) linked
              </Badge>
              {importMode > 0 ? (
                <Badge variant="secondary">{importMode} import-mode</Badge>
              ) : null}
              {pushMode > 0 ? (
                <Badge variant="secondary">{pushMode} push-mode</Badge>
              ) : null}
              {bidirectionalMode > 0 ? (
                <Badge variant="secondary">{bidirectionalMode} bidirectional</Badge>
              ) : null}
              {openConflicts > 0 ? (
                <Badge variant="destructive">{openConflicts} price conflict(s)</Badge>
              ) : null}
              {openCatalogConflicts > 0 ? (
                <Badge variant="destructive">{openCatalogConflicts} catalog conflict(s)</Badge>
              ) : null}
              {openTaxConflicts > 0 ? (
                <Badge variant="destructive">{openTaxConflicts} tax conflict(s)</Badge>
              ) : null}
              {openHostnameConflicts > 0 ? (
                <Badge variant="destructive">{openHostnameConflicts} hostname conflict(s)</Badge>
              ) : null}
              {mappedPrices > 0 ? (
                <Badge variant="outline">{mappedPrices} Shopify price override(s)</Badge>
              ) : null}
              {mappedCatalogProducts > 0 ? (
                <Badge variant="outline">{mappedCatalogProducts} catalog product(s)</Badge>
              ) : null}
              {taxRows.length > 0 ? (
                <Badge variant="outline">{taxRows.length} tax hint(s) cached</Badge>
              ) : null}
              {hostnameRows.length > 0 ? (
                <Badge variant="outline">{hostnameRows.length} hostname hint(s) cached</Badge>
              ) : null}
              {pushedVariants > 0 ? (
                <Badge variant="outline">{pushedVariants} variant(s) pushed</Badge>
              ) : null}
            </div>
            {syncSettings?.lastPriceImportAt ? (
              <p className="text-xs text-muted-foreground">
                Last manual price import: {new Date(syncSettings.lastPriceImportAt).toLocaleString()}
              </p>
            ) : null}
            {syncSettings?.lastWebhookPriceImportAt ? (
              <p className="text-xs text-muted-foreground">
                Last webhook price sync:{" "}
                {new Date(syncSettings.lastWebhookPriceImportAt).toLocaleString()}
                {syncSettings.lastWebhookPriceImportTopic
                  ? ` (${syncSettings.lastWebhookPriceImportTopic})`
                  : ""}
                {syncSettings.lastWebhookPriceImportSkippedReason === "debounced"
                  ? " — debounced"
                  : syncSettings.lastWebhookPriceImportSkippedReason === "unchanged"
                    ? " — unchanged"
                    : ""}
              </p>
            ) : null}
            {syncSettings?.lastPricePushAt ? (
              <p className="text-xs text-muted-foreground">
                Last price push: {new Date(syncSettings.lastPricePushAt).toLocaleString()}
                {syncSettings.lastPricePushOrigin ? ` (${syncSettings.lastPricePushOrigin})` : ""}
                {syncSettings.lastPricePushSkippedReason === "debounced"
                  ? " — debounced"
                  : syncSettings.lastPricePushSkippedReason === "unchanged"
                    ? " — unchanged"
                    : ""}
              </p>
            ) : null}
            {syncSettings?.lastPricePushError ? (
              <p className="text-xs text-amber-700 dark:text-amber-200">{syncSettings.lastPricePushError}</p>
            ) : null}
            {syncSettings?.priceImportError ? (
              <p className="text-xs text-amber-700 dark:text-amber-200">{syncSettings.priceImportError}</p>
            ) : null}
            {syncSettings?.lastDiscoveryAt ? (
              <p className="text-xs text-muted-foreground">
                Last Shopify discovery: {new Date(syncSettings.lastDiscoveryAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Run discovery on{" "}
                <Link href="/dashboard/integrations/shopify#shopify-markets-discovery" className="underline">
                  Shopify integration
                </Link>
                .
              </p>
            )}
            {syncSettings?.discoveryError ? (
              <p className="text-xs text-destructive">{syncSettings.discoveryError}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
