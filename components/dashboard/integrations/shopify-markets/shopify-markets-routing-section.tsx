"use client";

import { formatDistanceToNow } from "date-fns";
import {
  applySuggestedShopifyMarketHostnameAction,
  resolveShopifyMarketHostnameConflictAction,
  resolveShopifyMarketTaxConflictAction,
} from "@/actions/shopify-markets";
import { Button } from "@/components/ui/button";
import { SHOPIFY_MARKET_HOSTNAME_GUARD_HONESTY } from "@/lib/commercial/shopify-market-hostname-guard";
import { SHOPIFY_MARKET_TAX_GUARD_HONESTY } from "@/lib/commercial/shopify-market-tax-guard";
import type { ShopifyMarketsRoutingSectionProps } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-panel-types";

export function ShopifyMarketsRoutingSection(props: ShopifyMarketsRoutingSectionProps) {
  const {
    canManage,
    connectionId,
    syncSettings,
    openHostnameConflicts,
    importedHostnameMarkets,
    openTaxConflicts,
    importedTaxMarkets,
    hostnameResolvePending,
    startHostnameResolve,
    hostnameApplyPending,
    startHostnameApply,
    taxResolvePending,
    startTaxResolve,
  } = props;

  return (
    <>
    <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
      {SHOPIFY_MARKET_HOSTNAME_GUARD_HONESTY}
    </p>

    {syncSettings.lastHostnameReconcileAt ? (
      <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <p>
          Last hostname guard reconcile{" "}
          {formatDistanceToNow(new Date(syncSettings.lastHostnameReconcileAt), { addSuffix: true })}
          {syncSettings.lastHostnameReconcileResult ? (
            <> · {syncSettings.lastHostnameReconcileResult}</>
          ) : null}
        </p>
        {syncSettings.lastHostnameReconcileError ? (
          <p className="mt-1 text-destructive">{syncSettings.lastHostnameReconcileError}</p>
        ) : null}
      </div>
    ) : null}

    {openHostnameConflicts.length > 0 ? (
      <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <p className="font-medium text-foreground">
          Open hostname conflicts ({openHostnameConflicts.length})
        </p>
        {openHostnameConflicts.map((conflict) => (
          <div
            key={conflict.conflictKey}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-muted-foreground"
          >
            <span>
              Market <span className="font-mono">{conflict.osMarketId}</span> ·{" "}
              <span className="font-mono">{conflict.conflictType}</span> · Shopify{" "}
              {conflict.shopifySummary} vs KitchenOS {conflict.kitchenosSummary}
            </span>
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={hostnameResolvePending}
                  onClick={() =>
                    startHostnameResolve(async () => {
                      await resolveShopifyMarketHostnameConflictAction({
                        connectionId: connectionId!,
                        conflictKey: conflict.conflictKey,
                        resolution: "shopify",
                      });
                    })
                  }
                >
                  Apply Shopify
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={hostnameResolvePending}
                  onClick={() =>
                    startHostnameResolve(async () => {
                      await resolveShopifyMarketHostnameConflictAction({
                        connectionId: connectionId!,
                        conflictKey: conflict.conflictKey,
                        resolution: "kitchenos",
                      });
                    })
                  }
                >
                  Keep KitchenOS
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    ) : null}

    {importedHostnameMarkets.length > 0 ? (
      <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Cached hostname hints</p>
        {importedHostnameMarkets.map((row) => (
          <div
            key={row.osMarketId}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <span>
              {row.osMarketId}:{" "}
              <span className="font-mono">{row.suggestedHostSubdomain}</span>
              {row.shopifyHandle ? ` (handle ${row.shopifyHandle})` : ""}
            </span>
            {canManage && connectionId ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={hostnameApplyPending}
                onClick={() =>
                  startHostnameApply(async () => {
                    await applySuggestedShopifyMarketHostnameAction({
                      connectionId,
                      osMarketId: row.osMarketId,
                    });
                  })
                }
              >
                Apply subdomain
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    ) : null}

    {syncSettings.lastHostnameImportAt ? (
      <p className="text-xs text-muted-foreground">
        Last hostname import{" "}
        {formatDistanceToNow(new Date(syncSettings.lastHostnameImportAt), { addSuffix: true })}
        {syncSettings.hostnameImportError ? ` · notes: ${syncSettings.hostnameImportError}` : ""}
      </p>
    ) : null}

    <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
      {SHOPIFY_MARKET_TAX_GUARD_HONESTY}
    </p>

    {syncSettings.lastTaxReconcileAt ? (
      <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <p>
          Last tax guard reconcile{" "}
          {formatDistanceToNow(new Date(syncSettings.lastTaxReconcileAt), { addSuffix: true })}
          {syncSettings.lastTaxReconcileResult ? (
            <> · {syncSettings.lastTaxReconcileResult}</>
          ) : null}
        </p>
        {syncSettings.lastTaxReconcileError ? (
          <p className="mt-1 text-destructive">{syncSettings.lastTaxReconcileError}</p>
        ) : null}
      </div>
    ) : null}

    {openTaxConflicts.length > 0 ? (
      <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <p className="font-medium text-foreground">
          Open tax/duty conflicts ({openTaxConflicts.length})
        </p>
        {openTaxConflicts.map((conflict) => (
          <div
            key={conflict.conflictKey}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-muted-foreground"
          >
            <span>
              Market <span className="font-mono">{conflict.osMarketId}</span> ·{" "}
              <span className="font-mono">{conflict.conflictType}</span> · Shopify{" "}
              {conflict.shopifySummary} vs KitchenOS {conflict.kitchenosSummary}
            </span>
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={taxResolvePending}
                  onClick={() =>
                    startTaxResolve(async () => {
                      await resolveShopifyMarketTaxConflictAction({
                        connectionId: connectionId!,
                        conflictKey: conflict.conflictKey,
                        resolution: "shopify",
                      });
                    })
                  }
                >
                  Ack Shopify hint
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={taxResolvePending}
                  onClick={() =>
                    startTaxResolve(async () => {
                      await resolveShopifyMarketTaxConflictAction({
                        connectionId: connectionId!,
                        conflictKey: conflict.conflictKey,
                        resolution: "kitchenos",
                      });
                    })
                  }
                >
                  Keep KitchenOS
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    ) : null}

    {importedTaxMarkets.length > 0 ? (
      <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Cached tax hint imports (reference only)</p>
        {importedTaxMarkets.map((row) => (
          <p key={row.osMarketId}>
            {row.osMarketId}: {row.inferredMode} · {row.regionCodes.join(", ") || "—"} ·{" "}
            {row.totalRatePercent.toFixed(2)}% · hash{" "}
            <span className="font-mono">{row.taxHash.slice(0, 8)}</span>
          </p>
        ))}
      </div>
    ) : null}

    {syncSettings.lastTaxImportAt ? (
      <p className="text-xs text-muted-foreground">
        Last tax import{" "}
        {formatDistanceToNow(new Date(syncSettings.lastTaxImportAt), { addSuffix: true })}
        {syncSettings.taxImportError ? ` · notes: ${syncSettings.taxImportError}` : ""}
      </p>
    ) : null}
      </>
  );
}