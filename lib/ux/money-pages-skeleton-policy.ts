/**
 * Blueprint P1-29 — skeleton loaders on money-critical surfaces.
 */

export const MONEY_PAGES_SKELETON_POLICY_ID = "money-pages-skeleton-p1-29-v1" as const;

export const MONEY_PAGES_SKELETON_MODULE = "components/dashboard/money-page-skeletons.tsx" as const;

export const MONEY_PAGES_SKELETON_ROUTES = [
  {
    id: "pos_checkout",
    route: "app/dashboard/pos/terminal/loading.tsx",
    skeleton: "POSCheckoutSkeleton",
  },
  {
    id: "marketplace_cart",
    route: "app/dashboard/marketplace/checkout/loading.tsx",
    skeleton: "MarketplaceCartSkeleton",
  },
  {
    id: "vendor_finance",
    route: "app/vendor/(cabinet)/finance/loading.tsx",
    skeleton: "VendorFinanceSkeleton",
  },
] as const;

export const MONEY_PAGES_SKELETON_CI_SCRIPTS = ["test:ci:money-pages-skeleton"] as const;
