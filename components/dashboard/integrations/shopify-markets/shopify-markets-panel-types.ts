import type { TransitionStartFunction } from "react";

import type { B2bOperatorDigestPreview } from "@/lib/integrations/shopify-b2b-dunning-metadata";
import type {
  ShopifyMarketCatalogConflictRow,
  ShopifyMarketCatalogExportRow,
  ShopifyMarketCatalogImportRow,
  ShopifyMarketHostnameConflictRow,
  ShopifyMarketHostnameImportRow,
  ShopifyMarketPriceConflictRow,
  ShopifyMarketPriceExportRow,
  ShopifyMarketPriceImportRow,
  ShopifyMarketTaxConflictRow,
  ShopifyMarketTaxImportRow,
  ShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";

export type ShopifyMarketsPanelProps = {
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

export type ShopifyMarketsActionToolbarProps = {
  canManage: boolean;
  connectionId: string | null;
  hasCredentials: boolean;
  pending: boolean;
  discoverPending: boolean;
  startDiscover: TransitionStartFunction;
  importPending: boolean;
  startImport: TransitionStartFunction;
  pushPending: boolean;
  startPush: TransitionStartFunction;
  reconcilePending: boolean;
  startReconcile: TransitionStartFunction;
  catalogImportPending: boolean;
  startCatalogImport: TransitionStartFunction;
  catalogPushPending: boolean;
  startCatalogPush: TransitionStartFunction;
  catalogReconcilePending: boolean;
  startCatalogReconcile: TransitionStartFunction;
  taxImportPending: boolean;
  startTaxImport: TransitionStartFunction;
  taxReconcilePending: boolean;
  startTaxReconcile: TransitionStartFunction;
  hostnameImportPending: boolean;
  startHostnameImport: TransitionStartFunction;
  hostnameReconcilePending: boolean;
  startHostnameReconcile: TransitionStartFunction;
  b2bImportPending: boolean;
  startB2bImport: TransitionStartFunction;
  b2bReconcilePending: boolean;
  startB2bReconcile: TransitionStartFunction;
  b2bLocationImportPending: boolean;
  startB2bLocationImport: TransitionStartFunction;
  b2bLocationReconcilePending: boolean;
  startB2bLocationReconcile: TransitionStartFunction;
};

export type ShopifyMarketsRoutingSectionProps = {
  canManage: boolean;
  connectionId: string | null;
  syncSettings: ShopifyMarketsSyncSettings;
  openHostnameConflicts: ShopifyMarketHostnameConflictRow[];
  importedHostnameMarkets: ShopifyMarketHostnameImportRow[];
  openTaxConflicts: ShopifyMarketTaxConflictRow[];
  importedTaxMarkets: ShopifyMarketTaxImportRow[];
  hostnameResolvePending: boolean;
  startHostnameResolve: TransitionStartFunction;
  hostnameApplyPending: boolean;
  startHostnameApply: TransitionStartFunction;
  taxResolvePending: boolean;
  startTaxResolve: TransitionStartFunction;
};

export type ShopifyMarketsB2bSectionProps = {
  canManage: boolean;
  connectionId: string | null;
  syncSettings: ShopifyMarketsSyncSettings;
  openB2bConflicts: Array<
    NonNullable<ShopifyMarketsSyncSettings["b2bCompanyConflicts"]>[string]
  >;
  importedB2bCompanies: Array<
    NonNullable<ShopifyMarketsSyncSettings["b2bCompanyImports"]>[string]
  >;
  linkedB2bCount: number;
  openB2bLocationConflicts: Array<
    NonNullable<ShopifyMarketsSyncSettings["b2bLocationConflicts"]>[string]
  >;
  importedB2bLocations: Array<
    NonNullable<ShopifyMarketsSyncSettings["b2bLocationImports"]>[string]
  >;
  linkedB2bLocationCount: number;
  b2bDunningDigestPreview: B2bOperatorDigestPreview | null;
  b2bCollectorDigestPreview: ShopifyMarketsPanelProps["b2bCollectorDigestPreview"];
  b2bResolvePending: boolean;
  startB2bResolve: TransitionStartFunction;
  b2bLocationResolvePending: boolean;
  startB2bLocationResolve: TransitionStartFunction;
};

export type ShopifyMarketsSyncSectionProps = {
  canManage: boolean;
  connectionId: string | null;
  syncSettings: ShopifyMarketsSyncSettings;
  openConflicts: ShopifyMarketPriceConflictRow[];
  openCatalogConflicts: ShopifyMarketCatalogConflictRow[];
  importedMarkets: ShopifyMarketPriceImportRow[];
  exportedMarkets: ShopifyMarketPriceExportRow[];
  importedCatalogMarkets: ShopifyMarketCatalogImportRow[];
  exportedCatalogMarkets: ShopifyMarketCatalogExportRow[];
  totalMappedPrices: number;
  totalPushedVariants: number;
  resolvePending: boolean;
  startResolve: TransitionStartFunction;
  catalogResolvePending: boolean;
  startCatalogResolve: TransitionStartFunction;
};
