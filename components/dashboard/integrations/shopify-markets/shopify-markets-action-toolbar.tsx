"use client";

import {
  ArrowUpRight,
  BookOpen,
  Building2,
  DollarSign,
  Globe2,
  Link2,
  Loader2,
  Receipt,
  RefreshCw,
  Scale,
} from "lucide-react";
import {
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
} from "@/actions/shopify-markets";
import { Button } from "@/components/ui/button";
import type { ShopifyMarketsActionToolbarProps } from "@/components/dashboard/integrations/shopify-markets/shopify-markets-panel-types";

export function ShopifyMarketsActionToolbar(props: ShopifyMarketsActionToolbarProps) {
  const {
    canManage,
    connectionId,
    hasCredentials,
    pending,
    discoverPending,
    startDiscover,
    importPending,
    startImport,
    pushPending,
    startPush,
    reconcilePending,
    startReconcile,
    catalogImportPending,
    startCatalogImport,
    catalogPushPending,
    startCatalogPush,
    catalogReconcilePending,
    startCatalogReconcile,
    taxImportPending,
    startTaxImport,
    taxReconcilePending,
    startTaxReconcile,
    hostnameImportPending,
    startHostnameImport,
    hostnameReconcilePending,
    startHostnameReconcile,
    b2bImportPending,
    startB2bImport,
    b2bReconcilePending,
    startB2bReconcile,
    b2bLocationImportPending,
    startB2bLocationImport,
    b2bLocationReconcilePending,
    startB2bLocationReconcile,
  } = props;

  if (!canManage || !connectionId) return null;

  return (
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
  );
}