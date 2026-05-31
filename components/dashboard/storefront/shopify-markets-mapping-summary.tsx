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
  const priceRows = syncSettings ? Object.values(syncSettings.marketPriceImports ?? {}) : [];
  const exportRows = syncSettings ? Object.values(syncSettings.marketPriceExports ?? {}) : [];
  const mappedPrices = priceRows.reduce((sum, row) => sum + row.mappedProductCount, 0);
  const pushedVariants = exportRows.reduce((sum, row) => sum + row.pushedVariantCount, 0);

  return (
    <Card className="border-border/80 bg-muted/10">
      <CardHeader>
        <CardTitle className="text-base">Shopify Markets mapping</CardTitle>
        <CardDescription>
          Phase 4 — link OS Kitchen markets to Shopify, set syncMode import or push, and sync mapped
          product prices via Shopify price lists.
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
              {mappedPrices > 0 ? (
                <Badge variant="outline">{mappedPrices} Shopify price override(s)</Badge>
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
