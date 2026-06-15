import {
  MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT,
  MARKETPLACE_COMPARISON_P2_124_CATALOG_ROUTE,
  MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE,
  MARKETPLACE_COMPARISON_P2_124_ROUTE,
} from "@/lib/marketplace/marketplace-comparison-p2-124-policy";

export const MARKETPLACE_COMPARISON_P2_124_EYEBROW = "Marketplace · Supplier comparison" as const;

export const MARKETPLACE_COMPARISON_P2_124_HEADLINE =
  "Side-by-side supplier comparison — price, MOQ, lead time, and rating" as const;

export const MARKETPLACE_COMPARISON_P2_124_SUBLINE =
  "Four comparison capabilities for HoReCa procurement — side-by-side table, name/GTIN search, multi-column sort, and catalog compare tray. BETA: verify vendor MOQ and lead times before PO — typical directional pricing, not certified bid audit." as const;

export const MARKETPLACE_COMPARISON_P2_124_CAPABILITIES = [
  {
    id: "side-by-side",
    label: "Side-by-side table",
    description:
      "ProductComparisonTable shows up to 4 vendors per SKU with price, MOQ, lead time, and rating columns.",
    module: "components/marketplace/product-comparison-table.tsx",
    route: MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE,
  },
  {
    id: "search-match",
    label: "Name / GTIN search",
    description:
      "Search by product name, SKU, or GTIN — loadMarketplaceCompare fans out matching offers across approved vendors.",
    module: "services/marketplace/marketplace-compare-service.ts",
    route: MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE,
  },
  {
    id: "multi-sort",
    label: "Multi-column sort",
    description:
      "Sort by price, vendor rating, fastest delivery, or lowest MOQ — best-price badge on lowest unit cost.",
    module: "lib/marketplace/compare-filters.ts",
    route: MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE,
  },
  {
    id: "compare-tray",
    label: "Catalog compare tray",
    description:
      "Add SKUs from catalog toolbar — localStorage tray persists slugs and deep-links to compare page.",
    module: "lib/marketplace/marketplace-compare-storage.ts",
    route: MARKETPLACE_COMPARISON_P2_124_CATALOG_ROUTE,
  },
] as const;

export const MARKETPLACE_COMPARISON_P2_124_OPERATOR_LINKS = [
  { label: "Compare prices", href: MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE },
  { label: "Browse catalog", href: MARKETPLACE_COMPARISON_P2_124_CATALOG_ROUTE },
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
] as const;

export { MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT, MARKETPLACE_COMPARISON_P2_124_ROUTE };
