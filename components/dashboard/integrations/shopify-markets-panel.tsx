"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Globe2, Loader2, RefreshCw } from "lucide-react";

import { discoverShopifyMarketsAction, importShopifyMarketPricesAction } from "@/actions/shopify-markets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import type { ShopifyMarketRow } from "@/services/integrations/shopify-markets-service";

type ShopifyMarketsPanelProps = {
  connectionId: string | null;
  hasCredentials: boolean;
  syncSettings: ShopifyMarketsSyncSettings;
  canManage: boolean;
};

function MarketRow({ market }: { market: ShopifyMarketRow }) {
  return (
    <div className="rounded-lg border border-border/70 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{market.name}</span>
        {market.primary ? <Badge variant="secondary">Primary</Badge> : null}
        <Badge variant={market.enabled ? "outline" : "destructive"}>
          {market.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{market.id}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {market.currencyCode ? <span>{market.currencyCode}</span> : null}
        {market.regionCodes.length > 0 ? (
          <span>{market.regionCodes.join(", ")}</span>
        ) : null}
        {market.handle ? <span>handle: {market.handle}</span> : null}
      </div>
    </div>
  );
}

export function ShopifyMarketsPanel({
  connectionId,
  hasCredentials,
  syncSettings,
  canManage,
}: ShopifyMarketsPanelProps) {
  const [discoverPending, startDiscover] = useTransition();
  const [importPending, startImport] = useTransition();
  const pending = discoverPending || importPending;

  const importedMarkets = Object.values(syncSettings.marketPriceImports ?? {});
  const totalMappedPrices = importedMarkets.reduce(
    (sum, row) => sum + row.mappedProductCount,
    0,
  );

  return (
    <Card id="shopify-markets-discovery" className="scroll-mt-24 border-border/80">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe2 className="h-4 w-4" />
              Shopify Markets — Phase 2 BETA
            </CardTitle>
            <CardDescription>
              Discover Shopify markets, link them on Storefront → Markets, set syncMode to import, then
              pull market-specific prices for mapped external products.
            </CardDescription>
          </div>
          <Badge variant="outline">markets_sync BETA</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Scopes: <code className="rounded bg-muted px-1">read_markets</code>,{" "}
          <code className="rounded bg-muted px-1">read_products</code>. Shopify wins on price when{" "}
          <code className="rounded bg-muted px-1">syncMode=import</code> — menu composition stays OS Kitchen.
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

        {canManage && connectionId ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startDiscover(async () => {
                  await discoverShopifyMarketsAction(connectionId);
                })
              }
            >
              {discoverPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Discover markets</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startImport(async () => {
                  await importShopifyMarketPricesAction(connectionId);
                })
              }
            >
              {importPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4" />
              )}
              <span className="ml-2">Import market prices</span>
            </Button>
          </div>
        ) : null}

        {syncSettings.lastPriceImportAt ? (
          <p className="text-xs text-muted-foreground">
            Last price import{" "}
            {formatDistanceToNow(new Date(syncSettings.lastPriceImportAt), { addSuffix: true })}
            {totalMappedPrices > 0 ? ` · ${totalMappedPrices} mapped product price(s)` : ""}
          </p>
        ) : null}

        {syncSettings.priceImportError ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
            Partial import notes: {syncSettings.priceImportError}
          </p>
        ) : null}

        {syncSettings.discoveredMarkets.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {syncSettings.discoveredMarkets.map((market) => (
              <MarketRow key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No cached markets — run discovery after adding read_markets scope.
          </p>
        )}

        {importedMarkets.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs">
            <p className="font-medium text-foreground">Cached price imports</p>
            {importedMarkets.map((row) => (
              <div key={row.osMarketId} className="flex flex-wrap justify-between gap-2 text-muted-foreground">
                <span>
                  OS market <span className="font-mono">{row.osMarketId}</span>
                </span>
                <span>
                  {row.mappedProductCount}/{row.variantCount} mapped · {row.currencyCode ?? "—"}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Product sync also attempts price import for import-mode markets. Map external products before
          importing. Tax/duty settings are never overwritten.
        </p>
      </CardContent>
    </Card>
  );
}
