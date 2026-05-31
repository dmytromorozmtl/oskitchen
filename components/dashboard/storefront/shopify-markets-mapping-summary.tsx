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
  const priceRows = syncSettings ? Object.values(syncSettings.marketPriceImports ?? {}) : [];
  const mappedPrices = priceRows.reduce((sum, row) => sum + row.mappedProductCount, 0);

  return (
    <Card className="border-border/80 bg-muted/10">
      <CardHeader>
        <CardTitle className="text-base">Shopify Markets mapping</CardTitle>
        <CardDescription>
          Phase 2 — link OS Kitchen markets to Shopify, set syncMode import, and apply Shopify price list
          overrides on mapped products at checkout/menu display.
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
              {mappedPrices > 0 ? (
                <Badge variant="outline">{mappedPrices} Shopify price override(s)</Badge>
              ) : null}
            </div>
            {syncSettings?.lastPriceImportAt ? (
              <p className="text-xs text-muted-foreground">
                Last price import: {new Date(syncSettings.lastPriceImportAt).toLocaleString()}
              </p>
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
