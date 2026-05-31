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

  return (
    <Card className="border-border/80 bg-muted/10">
      <CardHeader>
        <CardTitle className="text-base">Shopify Markets mapping</CardTitle>
        <CardDescription>
          Phase 1 — manual link between OS Kitchen markets and Shopify Markets. Read-only discovery;
          no automatic price or catalog sync.
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
            </div>
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
