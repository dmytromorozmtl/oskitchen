"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Building2, DollarSign, Globe2, Link2, Loader2, Receipt, RefreshCw, Scale } from "lucide-react";

import {
  applySuggestedShopifyMarketHostnameAction,
  discoverShopifyMarketsAction,
  importShopifyB2bCompaniesAction,
  importShopifyB2bLocationsAction,
  importShopifyMarketCatalogAction,
  importShopifyMarketHostnameAction,
  importShopifyMarketPricesAction,
  importShopifyMarketTaxAction,
  pushShopifyMarketCatalogAction,
  pushShopifyMarketPricesAction,
  reconcileBidirectionalShopifyMarketCatalogAction,
  reconcileBidirectionalShopifyMarketsAction,
  reconcileShopifyB2bGuardAction,
  reconcileShopifyB2bLocationRoutingAction,
  reconcileShopifyMarketHostnameGuardAction,
  reconcileShopifyMarketTaxGuardAction,
  resolveShopifyB2bCompanyConflictAction,
  resolveShopifyB2bLocationConflictAction,
  resolveShopifyMarketCatalogConflictAction,
  resolveShopifyMarketHostnameConflictAction,
  resolveShopifyMarketPriceConflictAction,
  resolveShopifyMarketTaxConflictAction,
} from "@/actions/shopify-markets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SHOPIFY_MARKET_B2B_GUARD_HONESTY } from "@/lib/commercial/shopify-market-b2b-guard";
import { SHOPIFY_MARKET_B2B_LOCATION_ROUTING_HONESTY } from "@/lib/commercial/shopify-market-b2b-location-routing";
import { SHOPIFY_MARKET_HOSTNAME_GUARD_HONESTY } from "@/lib/commercial/shopify-market-hostname-guard";
import { SHOPIFY_MARKET_TAX_GUARD_HONESTY } from "@/lib/commercial/shopify-market-tax-guard";
import {
  SHOPIFY_MARKETS_CATALOG_PUSH_REQUIRED_SCOPES,
  SHOPIFY_MARKETS_PUSH_REQUIRED_SCOPES,
  type ShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import type { B2bOperatorDigestPreview } from "@/lib/integrations/shopify-b2b-dunning-metadata";
import { ShopifyMarketsB2bDunningCard } from "@/components/dashboard/integrations/shopify-markets-b2b-dunning-card";
import { ShopifyMarketsB2bCollectorQueueCard } from "@/components/dashboard/integrations/shopify-markets-b2b-collector-queue-card";
import type { ShopifyMarketRow } from "@/services/integrations/shopify-markets-service";

type ShopifyMarketsPanelProps = {
  connectionId: string | null;
  hasCredentials: boolean;
  syncSettings: ShopifyMarketsSyncSettings;
  canManage: boolean;
  b2bDunningDigestPreview?: B2bOperatorDigestPreview | null;
  b2bCollectorDigestPreview?: {
    openCount: number;
    slaBreachedCount: number;
    tasksByAssignee: Array<{
      assignee: string;
      tasks: Array<{ companyName: string; maxDaysPastDue: number; openAmountCents: number }>;
    }>;
  } | null;
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startPush(async () => {
                  await pushShopifyMarketPricesAction(connectionId);
                })
              }
            >
              {pushPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
              <span className="ml-2">Push market prices</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startReconcile(async () => {
                  await reconcileBidirectionalShopifyMarketsAction(connectionId);
                })
              }
            >
              {reconcilePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scale className="h-4 w-4" />
              )}
              <span className="ml-2">Reconcile prices</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startCatalogImport(async () => {
                  await importShopifyMarketCatalogAction(connectionId);
                })
              }
            >
              {catalogImportPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              <span className="ml-2">Import catalog</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startCatalogPush(async () => {
                  await pushShopifyMarketCatalogAction(connectionId);
                })
              }
            >
              {catalogPushPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
              <span className="ml-2">Push catalog</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startCatalogReconcile(async () => {
                  await reconcileBidirectionalShopifyMarketCatalogAction(connectionId);
                })
              }
            >
              {catalogReconcilePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scale className="h-4 w-4" />
              )}
              <span className="ml-2">Reconcile catalog</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startTaxImport(async () => {
                  await importShopifyMarketTaxAction(connectionId);
                })
              }
            >
              {taxImportPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Receipt className="h-4 w-4" />
              )}
              <span className="ml-2">Import tax hints</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startTaxReconcile(async () => {
                  await reconcileShopifyMarketTaxGuardAction(connectionId);
                })
              }
            >
              {taxReconcilePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scale className="h-4 w-4" />
              )}
              <span className="ml-2">Reconcile tax guard</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startHostnameImport(async () => {
                  await importShopifyMarketHostnameAction(connectionId);
                })
              }
            >
              {hostnameImportPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              <span className="ml-2">Import hostname hints</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startHostnameReconcile(async () => {
                  await reconcileShopifyMarketHostnameGuardAction(connectionId);
                })
              }
            >
              {hostnameReconcilePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe2 className="h-4 w-4" />
              )}
              <span className="ml-2">Reconcile hostname guard</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startB2bImport(async () => {
                  await importShopifyB2bCompaniesAction(connectionId);
                })
              }
            >
              {b2bImportPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span className="ml-2">Import B2B companies</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startB2bReconcile(async () => {
                  await reconcileShopifyB2bGuardAction(connectionId);
                })
              }
            >
              {b2bReconcilePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scale className="h-4 w-4" />
              )}
              <span className="ml-2">Reconcile B2B guard</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startB2bLocationImport(async () => {
                  await importShopifyB2bLocationsAction(connectionId);
                })
              }
            >
              {b2bLocationImportPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span className="ml-2">Import B2B locations</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              disabled={pending || !hasCredentials}
              onClick={() =>
                startB2bLocationReconcile(async () => {
                  await reconcileShopifyB2bLocationRoutingAction(connectionId);
                })
              }
            >
              {b2bLocationReconcilePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe2 className="h-4 w-4" />
              )}
              <span className="ml-2">Reconcile location routing</span>
            </Button>
          </div>
        ) : null}

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
            digestPreview={b2bCollectorDigestPreview}
            canManage={canManage}
          />
        </div>

        {syncSettings.lastCatalogReconcileAt ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <p>
              Last catalog reconcile{" "}
              {formatDistanceToNow(new Date(syncSettings.lastCatalogReconcileAt), { addSuffix: true })}
              {syncSettings.lastCatalogReconcileResult ? (
                <> · {syncSettings.lastCatalogReconcileResult}</>
              ) : null}
            </p>
            {syncSettings.lastCatalogReconcileError ? (
              <p className="mt-1 text-destructive">{syncSettings.lastCatalogReconcileError}</p>
            ) : null}
          </div>
        ) : null}

        {openCatalogConflicts.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <p className="font-medium text-foreground">
              Open catalog conflicts ({openCatalogConflicts.length})
            </p>
            {openCatalogConflicts.map((conflict) => (
              <div
                key={conflict.conflictKey}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-muted-foreground"
              >
                <span>
                  Market <span className="font-mono">{conflict.osMarketId}</span> · product{" "}
                  <span className="font-mono">{conflict.productId.slice(0, 8)}…</span> · Shopify{" "}
                  {conflict.shopifyPublished ? "published" : "unpublished"} vs KitchenOS{" "}
                  {conflict.kitchenosPublished ? "published" : "unpublished"}
                </span>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={catalogResolvePending}
                      onClick={() =>
                        startCatalogResolve(async () => {
                          await resolveShopifyMarketCatalogConflictAction({
                            connectionId: connectionId!,
                            conflictKey: conflict.conflictKey,
                            resolution: "shopify",
                          });
                        })
                      }
                    >
                      Use Shopify
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={catalogResolvePending}
                      onClick={() =>
                        startCatalogResolve(async () => {
                          await resolveShopifyMarketCatalogConflictAction({
                            connectionId: connectionId!,
                            conflictKey: conflict.conflictKey,
                            resolution: "kitchenos",
                          });
                        })
                      }
                    >
                      Use KitchenOS
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {importedCatalogMarkets.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Cached catalog imports</p>
            {importedCatalogMarkets.map((row) => (
              <p key={row.osMarketId}>
                {row.osMarketId}: {row.mappedProductCount} mapped / {row.externalProductCount} Shopify
                products
              </p>
            ))}
          </div>
        ) : null}

        {exportedCatalogMarkets.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Cached catalog exports (push)</p>
            {exportedCatalogMarkets.map((row) => (
              <p key={row.osMarketId}>
                {row.osMarketId}: +{row.publishedCount} / -{row.unpublishedCount} publications
              </p>
            ))}
            <p className="text-[11px]">
              Requires {SHOPIFY_MARKETS_CATALOG_PUSH_REQUIRED_SCOPES.join(", ")} scopes.
            </p>
          </div>
        ) : null}

        {syncSettings.lastBidirectionalReconcileAt ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <p>
              Last bidirectional reconcile{" "}
              {formatDistanceToNow(new Date(syncSettings.lastBidirectionalReconcileAt), {
                addSuffix: true,
              })}
              {syncSettings.lastBidirectionalReconcileResult ? (
                <> · {syncSettings.lastBidirectionalReconcileResult}</>
              ) : null}
            </p>
            {syncSettings.lastBidirectionalReconcileError ? (
              <p className="mt-1 text-destructive">{syncSettings.lastBidirectionalReconcileError}</p>
            ) : null}
          </div>
        ) : null}

        {openConflicts.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <p className="font-medium text-foreground">Open price conflicts ({openConflicts.length})</p>
            {openConflicts.map((conflict) => (
              <div
                key={conflict.conflictKey}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-muted-foreground"
              >
                <span>
                  Market <span className="font-mono">{conflict.osMarketId}</span> · product{" "}
                  <span className="font-mono">{conflict.productId.slice(0, 8)}…</span> · Shopify{" "}
                  {conflict.shopifyAmount} vs KitchenOS {conflict.kitchenosAmount}
                </span>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={resolvePending}
                      onClick={() =>
                        startResolve(async () => {
                          await resolveShopifyMarketPriceConflictAction({
                            connectionId: connectionId!,
                            conflictKey: conflict.conflictKey,
                            resolution: "shopify",
                          });
                        })
                      }
                    >
                      Use Shopify
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={resolvePending}
                      onClick={() =>
                        startResolve(async () => {
                          await resolveShopifyMarketPriceConflictAction({
                            connectionId: connectionId!,
                            conflictKey: conflict.conflictKey,
                            resolution: "kitchenos",
                          });
                        })
                      }
                    >
                      Use KitchenOS
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {syncSettings.lastPricePushAt ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <p>
              Last price push{" "}
              {formatDistanceToNow(new Date(syncSettings.lastPricePushAt), { addSuffix: true })}
              {totalPushedVariants > 0 ? ` · ${totalPushedVariants} variant(s)` : ""}
              {syncSettings.lastPricePushOrigin ? (
                <>
                  {" "}
                  · origin{" "}
                  <code className="rounded bg-muted px-1">{syncSettings.lastPricePushOrigin}</code>
                </>
              ) : null}
            </p>
            {syncSettings.lastPricePushSkippedReason === "debounced" ? (
              <p className="mt-1 text-amber-700 dark:text-amber-200">
                Skipped — product update push debounced (30s window).
              </p>
            ) : null}
            {syncSettings.lastPricePushSkippedReason === "unchanged" ? (
              <p className="mt-1">Skipped — outgoing price hash unchanged for push-mode markets.</p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Set <code className="rounded bg-muted px-1">syncMode=push</code> on Storefront → Markets to
            send KitchenOS prices to Shopify. Requires{" "}
            {SHOPIFY_MARKETS_PUSH_REQUIRED_SCOPES.map((scope) => (
              <code key={scope} className="mx-0.5 rounded bg-muted px-1">
                {scope}
              </code>
            ))}
            .
          </p>
        )}

        {syncSettings.lastPricePushError ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
            Push notes: {syncSettings.lastPricePushError}
          </p>
        ) : null}

        {syncSettings.lastPriceImportAt ? (
          <p className="text-xs text-muted-foreground">
            Last manual price import{" "}
            {formatDistanceToNow(new Date(syncSettings.lastPriceImportAt), { addSuffix: true })}
            {totalMappedPrices > 0 ? ` · ${totalMappedPrices} mapped product price(s)` : ""}
          </p>
        ) : null}

        {syncSettings.lastWebhookPriceImportAt ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <p>
              Last webhook price sync{" "}
              {formatDistanceToNow(new Date(syncSettings.lastWebhookPriceImportAt), { addSuffix: true })}
              {syncSettings.lastWebhookPriceImportTopic ? (
                <>
                  {" "}
                  · topic{" "}
                  <code className="rounded bg-muted px-1">{syncSettings.lastWebhookPriceImportTopic}</code>
                </>
              ) : null}
            </p>
            {syncSettings.lastWebhookPriceImportSkippedReason === "debounced" ? (
              <p className="mt-1 text-amber-700 dark:text-amber-200">
                Skipped — another webhook triggered import within the last 60 seconds.
              </p>
            ) : null}
            {syncSettings.lastWebhookPriceImportSkippedReason === "unchanged" ? (
              <p className="mt-1">Skipped — price hash unchanged for all import-mode markets.</p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Register <code className="rounded bg-muted px-1">products/update</code> and{" "}
            <code className="rounded bg-muted px-1">markets/*</code> webhooks below to auto-refresh
            import-mode prices.
          </p>
        )}

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
                  {row.priceHash ? (
                    <>
                      {" "}
                      · hash <span className="font-mono">{row.priceHash.slice(0, 8)}</span>
                    </>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {exportedMarkets.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 p-3 text-xs">
            <p className="font-medium text-foreground">Cached price exports (push)</p>
            {exportedMarkets.map((row) => (
              <div key={row.osMarketId} className="flex flex-wrap justify-between gap-2 text-muted-foreground">
                <span>
                  OS market <span className="font-mono">{row.osMarketId}</span>
                </span>
                <span>
                  {row.pushedVariantCount}/{row.variantCount} variants · {row.currencyCode ?? "—"}
                  {row.priceHash ? (
                    <>
                      {" "}
                      · hash <span className="font-mono">{row.priceHash.slice(0, 8)}</span>
                    </>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Product sync imports for import/bidirectional markets; product price saves auto-reconcile
          bidirectional or push (30s debounce). Map external products first. Tax/duty settings are never
          overwritten.
        </p>
      </CardContent>
    </Card>
  );
}
