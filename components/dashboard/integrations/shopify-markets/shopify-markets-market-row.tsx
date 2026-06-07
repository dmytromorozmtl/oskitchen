"use client";

import { Badge } from "@/components/ui/badge";
import type { ShopifyMarketRow } from "@/services/integrations/shopify-markets-service";

export function ShopifyMarketsMarketRow({ market }: { market: ShopifyMarketRow }) {
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
