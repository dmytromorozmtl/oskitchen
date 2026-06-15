import {
  RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT,
  RESTAURANT_PURCHASING_P2_117_COMPARE_ROUTE,
  RESTAURANT_PURCHASING_P2_117_ORDERS_ROUTE,
  RESTAURANT_PURCHASING_P2_117_ROUTE,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-policy";

export const RESTAURANT_PURCHASING_P2_117_EYEBROW =
  "Restaurant purchasing · B2B marketplace" as const;

export const RESTAURANT_PURCHASING_P2_117_HEADLINE =
  "Compare suppliers, automate reorders, and track deliveries" as const;

export const RESTAURANT_PURCHASING_P2_117_SUBLINE =
  "Five procurement capabilities for restaurant buyers — supplier compare, recurring orders, substitutions, delivery tracking, and dispute resolution. BETA: verify vendor SLAs and substitution policies — typical directional purchasing workflow, not certified procurement audit." as const;

export const RESTAURANT_PURCHASING_P2_117_CAPABILITIES = [
  {
    id: "compare-suppliers",
    label: "Compare suppliers",
    description: "Side-by-side vendor pricing for the same SKU or GTIN — sort by price, MOQ, and rating.",
    module: "services/marketplace/marketplace-compare-service.ts",
    route: RESTAURANT_PURCHASING_P2_117_COMPARE_ROUTE,
  },
  {
    id: "recurring-orders",
    label: "Recurring orders",
    description: "Weekly or monthly staple reorders with approval gates — auto-run from saved cart templates.",
    module: "services/marketplace/recurring-orders-service.ts",
    route: `${RESTAURANT_PURCHASING_P2_117_ORDERS_ROUTE}?tab=recurring`,
  },
  {
    id: "substitutions",
    label: "Substitutions",
    description: "Backorder substitutes surfaced in catalog and vendor chat — approve swaps before PO confirm.",
    module: "lib/marketplace/marketplace-empty-states-policy.ts",
    route: RESTAURANT_PURCHASING_P2_117_ROUTE,
  },
  {
    id: "delivery-tracking",
    label: "Delivery tracking",
    description: "PO confirmed delivery dates and in-transit alerts on marketplace dashboard.",
    module: "services/marketplace/marketplace-dashboard-service.ts",
    route: RESTAURANT_PURCHASING_P2_117_ORDERS_ROUTE,
  },
  {
    id: "disputes",
    label: "Disputes",
    description: "Receiving issues route through platform dispute review — not hidden vendor DMs.",
    module: "services/marketplace/platform-dispute-resolution-service.ts",
    route: RESTAURANT_PURCHASING_P2_117_ORDERS_ROUTE,
  },
] as const;

export const RESTAURANT_PURCHASING_P2_117_OPERATOR_LINKS = [
  { label: "Compare prices", href: RESTAURANT_PURCHASING_P2_117_COMPARE_ROUTE },
  { label: "Marketplace orders", href: RESTAURANT_PURCHASING_P2_117_ORDERS_ROUTE },
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
] as const;

export {
  RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT,
  RESTAURANT_PURCHASING_P2_117_ROUTE,
};
