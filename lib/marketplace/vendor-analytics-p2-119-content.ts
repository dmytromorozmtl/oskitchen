import {
  VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT,
  VENDOR_ANALYTICS_P2_119_COMPARE_ROUTE,
  VENDOR_ANALYTICS_P2_119_ROUTE,
  VENDOR_ANALYTICS_P2_119_VENDOR_ANALYTICS_ROUTE,
} from "@/lib/marketplace/vendor-analytics-p2-119-policy";

export const VENDOR_ANALYTICS_P2_119_EYEBROW = "Vendor analytics · B2B marketplace" as const;

export const VENDOR_ANALYTICS_P2_119_HEADLINE =
  "Top products, repeat buyers, lost carts, and price competitiveness" as const;

export const VENDOR_ANALYTICS_P2_119_SUBLINE =
  "Four vendor-side analytics capabilities — SKU performance, buyer retention, abandoned cart recovery, and competitive pricing signals. BETA: verify cohorts with finance — typical directional analytics, not certified BI audit." as const;

export const VENDOR_ANALYTICS_P2_119_CAPABILITIES = [
  {
    id: "top-products",
    label: "Top products",
    description: "Revenue-ranked SKU performance with units sold, order count, and conversion rate.",
    module: "services/marketplace/vendor-analytics-service.ts",
    route: VENDOR_ANALYTICS_P2_119_VENDOR_ANALYTICS_ROUTE,
  },
  {
    id: "repeat-buyers",
    label: "Repeat buyers",
    description: "30-day repeat purchase rate and buyer segment breakdown by workspace type.",
    module: "services/marketplace/vendor-analytics-service.ts",
    route: VENDOR_ANALYTICS_P2_119_VENDOR_ANALYTICS_ROUTE,
  },
  {
    id: "lost-carts",
    label: "Lost carts",
    description: "Draft POs and active cart lines with vendor SKUs that never converted to checkout.",
    module: "services/marketplace/cart-service.ts",
    route: VENDOR_ANALYTICS_P2_119_ROUTE,
  },
  {
    id: "price-competitiveness",
    label: "Price competitiveness",
    description: "SKUs at best price vs category peers — compare lane and price intelligence signals.",
    module: "services/marketplace/marketplace-compare-service.ts",
    route: VENDOR_ANALYTICS_P2_119_COMPARE_ROUTE,
  },
] as const;

export const VENDOR_ANALYTICS_P2_119_OPERATOR_LINKS = [
  { label: "Vendor analytics", href: VENDOR_ANALYTICS_P2_119_VENDOR_ANALYTICS_ROUTE },
  { label: "Compare prices", href: VENDOR_ANALYTICS_P2_119_COMPARE_ROUTE },
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
] as const;

export { VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT, VENDOR_ANALYTICS_P2_119_ROUTE };
