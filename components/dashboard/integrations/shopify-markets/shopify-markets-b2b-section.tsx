"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  resolveShopifyB2bCompanyConflictAction,
  resolveShopifyB2bLocationConflictAction,
} from "@/actions/shopify-markets";
import { Button } from "@/components/ui/button";
import { ShopifyMarketsB2bCollectorQueueCard } from "@/components/dashboard/integrations/shopify-markets-b2b-collector-queue-card";
import { ShopifyMarketsB2bDunningCard } from "@/components/dashboard/integrations/shopify-markets-b2b-dunning-card";
import { SHOPIFY_MARKET_B2B_GUARD_HONESTY } from "@/lib/commercial/shopify-market-b2b-guard";
import { SHOPIFY_MARKET_B2B_LOCATION_ROUTING_HONESTY } from "@/lib/commercial/shopify-market-b2b-location-routing";
import type { ShopifyMarketsB2bSectionProps } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-panel-types";

export function ShopifyMarketsB2bSection(props: ShopifyMarketsB2bSectionProps) {
  const {
    canManage,
    connectionId,
    syncSettings,
    openB2bConflicts,
    importedB2bCompanies,
    linkedB2bCount,
    openB2bLocationConflicts,
    importedB2bLocations,
    linkedB2bLocationCount,
    b2bDunningDigestPreview,
    b2bCollectorDigestPreview,
    b2bResolvePending,
    startB2bResolve,
    b2bLocationResolvePending,
    startB2bLocationResolve,
  } = props;

  return (

    <div id="shopify-markets-b2b-guard" className="scroll-mt-24 space-y-3">
      <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        {SHOPIFY_MARKET_B2B_GUARD_HONESTY}
      </p>

      {syncSettings.b2bUnavailableReason ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          B2B unavailable: {syncSettings.b2bUnavailableReason}. Requires Shopify Plus B2B and{" "}
          <span className="font-mono">read_companies</span> scope.
        </p>
      ) : null}

      {syncSettings.lastB2bReconcileAt ? (
        <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <p>
            Last B2B guard reconcile{" "}
            {formatDistanceToNow(new Date(syncSettings.lastB2bReconcileAt), { addSuffix: true })}
            {syncSettings.lastB2bReconcileResult ? (
              <> · {syncSettings.lastB2bReconcileResult}</>
            ) : null}
            {linkedB2bCount > 0 ? <> · {linkedB2bCount} linked</> : null}
          </p>
          {syncSettings.lastB2bReconcileError ? (
            <p className="mt-1 text-destructive">{syncSettings.lastB2bReconcileError}</p>
          ) : null}
        </div>
      ) : null}

      {openB2bConflicts.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <p className="font-medium text-foreground">
            Open B2B company conflicts ({openB2bConflicts.length})
          </p>
          {openB2bConflicts.map((conflict) => (
            <div
              key={conflict.conflictKey}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-muted-foreground"
            >
              <span>
                <span className="font-mono">{conflict.conflictType}</span> · Shopify{" "}
                {conflict.shopifySummary} vs KitchenOS {conflict.kitchenosSummary}
              </span>
              {canManage && connectionId ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={b2bResolvePending}
                    onClick={() =>
                      startB2bResolve(async () => {
                        await resolveShopifyB2bCompanyConflictAction({
                          connectionId,
                          conflictKey: conflict.conflictKey,
                          resolution: "shopify",
                          companyAccountId: conflict.companyAccountId ?? undefined,
                        });
                      })
                    }
                  >
                    Link Shopify
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={b2bResolvePending}
                    onClick={() =>
                      startB2bResolve(async () => {
                        await resolveShopifyB2bCompanyConflictAction({
                          connectionId,
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

      {importedB2bCompanies.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Cached B2B company hints</p>
          {importedB2bCompanies.map((row) => (
            <div key={row.shopifyCompanyId} className="flex flex-wrap justify-between gap-2">
              <span>
                {row.name}
                {row.mainContactEmail ? ` · ${row.mainContactEmail}` : ""}
              </span>
              <span>
                {row.locationCount} location(s)
                {row.suggestedCompanyAccountId ? " · match suggested" : " · unmapped"}
                {syncSettings.b2bCompanyLinks?.[row.shopifyCompanyId] ? " · linked" : ""}
              </span>
            </div>
          ))}
          <Link
            href="/dashboard/customers/companies"
            className="inline-flex items-center gap-1 text-xs underline"
          >
            Manage KitchenOS company accounts
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}

      <div id="shopify-markets-b2b-location-routing" className="scroll-mt-24 space-y-3 border-t border-border/60 pt-3">
        <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          {SHOPIFY_MARKET_B2B_LOCATION_ROUTING_HONESTY}
        </p>

        {syncSettings.lastB2bLocationReconcileAt ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <p>
              Last location routing reconcile{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bLocationReconcileAt), {
                addSuffix: true,
              })}
              {syncSettings.lastB2bLocationReconcileResult ? (
                <> · {syncSettings.lastB2bLocationReconcileResult}</>
              ) : null}
              {linkedB2bLocationCount > 0 ? <> · {linkedB2bLocationCount} linked</> : null}
            </p>
            {syncSettings.lastB2bLocationReconcileError ? (
              <p className="mt-1 text-destructive">{syncSettings.lastB2bLocationReconcileError}</p>
            ) : null}
          </div>
        ) : null}

        {openB2bLocationConflicts.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <p className="font-medium text-foreground">
              Open B2B location conflicts ({openB2bLocationConflicts.length})
            </p>
            {openB2bLocationConflicts.map((conflict) => (
              <div
                key={conflict.conflictKey}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-muted-foreground"
              >
                <span>
                  <span className="font-mono">{conflict.conflictType}</span> · Shopify{" "}
                  {conflict.shopifySummary} vs KitchenOS {conflict.kitchenosSummary}
                </span>
                {canManage && connectionId ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={b2bLocationResolvePending}
                      onClick={() =>
                        startB2bLocationResolve(async () => {
                          await resolveShopifyB2bLocationConflictAction({
                            connectionId,
                            conflictKey: conflict.conflictKey,
                            resolution: "shopify",
                            osMarketId: conflict.osMarketId ?? undefined,
                            companyAccountId: conflict.companyAccountId ?? undefined,
                          });
                        })
                      }
                    >
                      Apply routing
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={b2bLocationResolvePending}
                      onClick={() =>
                        startB2bLocationResolve(async () => {
                          await resolveShopifyB2bLocationConflictAction({
                            connectionId,
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

        {importedB2bLocations.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Cached B2B location hints</p>
            {importedB2bLocations.map((row) => (
              <div key={row.shopifyLocationId} className="flex flex-wrap justify-between gap-2">
                <span>
                  {row.companyName} — {row.locationName}
                  {row.countryCode ? ` · ${row.countryCode}` : ""}
                </span>
                <span>
                  {row.suggestedOsMarketId
                    ? `→ market ${row.suggestedOsMarketId}`
                    : "no market match"}
                  {syncSettings.b2bLocationLinks?.[row.shopifyLocationId] ? " · linked" : ""}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {syncSettings.b2bOrderEnrichmentStats ? (
        <p className="text-xs text-muted-foreground">
          B2B order enrichments: {syncSettings.b2bOrderEnrichmentStats.total} total ·{" "}
          {syncSettings.b2bOrderEnrichmentStats.complete} complete ·{" "}
          {syncSettings.b2bOrderEnrichmentStats.partial} partial ·{" "}
          {syncSettings.b2bOrderEnrichmentStats.unresolved} unresolved
          {syncSettings.lastB2bOrderEnrichmentAt ? (
            <>
              {" "}
              · last{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bOrderEnrichmentAt), {
                addSuffix: true,
              })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bKitchenOrderStats ? (
        <p className="text-xs text-muted-foreground">
          B2B kitchen orders: {syncSettings.b2bKitchenOrderStats.promoted} promoted ·{" "}
          {syncSettings.b2bKitchenOrderStats.complete} complete ·{" "}
          {syncSettings.b2bKitchenOrderStats.missingCompanyLink} missing company link
          {syncSettings.lastB2bKitchenOrderPromoteAt ? (
            <>
              {" "}
              · last promote{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bKitchenOrderPromoteAt), {
                addSuffix: true,
              })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bCateringRollupStats ? (
        <p className="text-xs text-muted-foreground">
          B2B catering rollups: {syncSettings.b2bCateringRollupStats.quotesCreated} draft quote(s)
          · {syncSettings.b2bCateringRollupStats.ordersAppended} order(s) appended ·{" "}
          {syncSettings.b2bCateringRollupStats.linesRolled} line(s)
          {syncSettings.b2bCateringRollupMinTotal ? (
            <> · min total {syncSettings.b2bCateringRollupMinTotal}</>
          ) : null}
          {syncSettings.lastB2bCateringRollupAt ? (
            <>
              {" "}
              · last{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bCateringRollupAt), {
                addSuffix: true,
              })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bNetTermsStats ? (
        <p className="text-xs text-muted-foreground">
          B2B net terms: {syncSettings.b2bNetTermsStats.withNetTerms} with terms ·{" "}
          {syncSettings.b2bNetTermsStats.withPoNumber} with PO
          {syncSettings.b2bRequirePurchaseOrder ? " · PO required" : ""}
          {syncSettings.b2bNetTermsStats.missingPoWhenRequired > 0 ? (
            <> · {syncSettings.b2bNetTermsStats.missingPoWhenRequired} missing PO</>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bInvoiceStats ? (
        <p className="text-xs text-muted-foreground">
          B2B invoice drafts: {syncSettings.b2bInvoiceStats.draftsCreated} created
          {!syncSettings.b2bAutoGenerateInvoice ? " · auto-generate off" : ""}
          {syncSettings.b2bInvoiceStats.skippedMissingPo > 0 ? (
            <> · {syncSettings.b2bInvoiceStats.skippedMissingPo} skipped (missing PO)</>
          ) : null}
          {syncSettings.lastB2bInvoiceGeneratedAt ? (
            <>
              {" "}
              · last{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bInvoiceGeneratedAt), {
                addSuffix: true,
              })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bPaymentCollectionStats ? (
        <p className="text-xs text-muted-foreground">
          B2B payment collection: {syncSettings.b2bPaymentCollectionStats.markedPaid} paid ·{" "}
          {syncSettings.b2bPaymentCollectionStats.markedPartial} partial
          {syncSettings.b2bPaymentCollectionStats.overdueOpen > 0 ? (
            <> · {syncSettings.b2bPaymentCollectionStats.overdueOpen} overdue open</>
          ) : null}
          {syncSettings.lastB2bPaymentCollectedAt ? (
            <>
              {" "}
              · last{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bPaymentCollectedAt), {
                addSuffix: true,
              })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bArAgingStats ? (
        <p className="text-xs text-muted-foreground">
          B2B AR aging: {syncSettings.b2bArAgingStats.lastSnapshotOpen} open · 0–30d{" "}
          {syncSettings.b2bArAgingStats.bucket0_30} · 31–60d {syncSettings.b2bArAgingStats.bucket31_60} · 61+d{" "}
          {syncSettings.b2bArAgingStats.bucket61Plus}
          {!syncSettings.b2bArReminderEnabled ? " · reminders off" : ""}
          {syncSettings.b2bArAgingStats.remindersSent > 0 ? (
            <> · {syncSettings.b2bArAgingStats.remindersSent} reminder(s) sent</>
          ) : null}
          {syncSettings.lastB2bArReminderAt ? (
            <>
              {" "}
              · last reminder{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bArReminderAt), { addSuffix: true })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bDunningStats ? (
        <p className="text-xs text-muted-foreground">
          B2B dunning: {syncSettings.b2bDunningStats.digestsSent} digest(s) ·{" "}
          {syncSettings.b2bDunningStats.autoRemindersSent} auto reminder(s)
          {!syncSettings.b2bAutoDunningEnabled ? " · auto off" : ""}
          {syncSettings.lastB2bDunningRunAt ? (
            <>
              {" "}
              · last run{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bDunningRunAt), { addSuffix: true })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bPayPortalStats ? (
        <p className="text-xs text-muted-foreground">
          B2B pay portal: {syncSettings.b2bPayPortalStats.linksMinted} link(s) ·{" "}
          {syncSettings.b2bPayPortalStats.checkoutCompleted} paid online
          {!syncSettings.b2bPayPortalEnabled ? " · portal off" : ""}
          {syncSettings.lastB2bPayPortalCheckoutAt ? (
            <>
              {" "}
              · last checkout{" "}
              {formatDistanceToNow(new Date(syncSettings.lastB2bPayPortalCheckoutAt), {
                addSuffix: true,
              })}
            </>
          ) : null}
        </p>
      ) : null}
      {syncSettings.b2bArHealthScore != null || syncSettings.b2bArDashboardStats ? (
        <p className="text-xs text-muted-foreground">
          B2B AR dashboard:{" "}
          {syncSettings.b2bArHealthScore != null ? `${syncSettings.b2bArHealthScore}/100 health` : "—"}
          {syncSettings.b2bFinancialMirrorStats?.lastDriftCount ? (
            <> · {syncSettings.b2bFinancialMirrorStats.lastDriftCount} Shopify drift</>
          ) : null}
          {syncSettings.b2bFinancialMirrorStats?.capturedAtPromote ? (
            <> · {syncSettings.b2bFinancialMirrorStats.capturedAtPromote} mirror capture(s)</>
          ) : null}
          {syncSettings.b2bConsolidatedPayStats?.batchesMinted ? (
            <> · {syncSettings.b2bConsolidatedPayStats.batchesMinted} consolidated pay batch(es)</>
          ) : null}
          {syncSettings.b2bConsolidatedPayStats?.staleCheckoutOpen ? (
            <> · {syncSettings.b2bConsolidatedPayStats.staleCheckoutOpen} stale checkout(s)</>
          ) : null}
          {syncSettings.b2bArDashboardStats
            ? ` · ${syncSettings.b2bArDashboardStats.views} view(s) · ${syncSettings.b2bArDashboardStats.csvExports} export(s)`
            : ""}
          {!syncSettings.b2bArDashboardEnabled ? " · dashboard off" : ""}
          {" · "}
          <Link href="/dashboard/receivables" className="text-primary hover:underline">
            Open receivables
          </Link>
        </p>
      ) : null}
      <ShopifyMarketsB2bDunningCard
        connectionId={connectionId}
        syncSettings={syncSettings}
        digestPreview={b2bDunningDigestPreview}
        canManage={canManage}
      />
      <ShopifyMarketsB2bCollectorQueueCard
        connectionId={connectionId}
        syncSettings={syncSettings}
        digestPreview={b2bCollectorDigestPreview ?? null}
        canManage={canManage}
      />
    </div>
  );
}
