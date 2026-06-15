import {
  VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT,
  VENDOR_PRICE_INTELLIGENCE_P2_100_PURCHASING_ROUTE,
  VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-policy";

export const VENDOR_PRICE_INTELLIGENCE_P2_100_EYEBROW =
  "Vendor price intelligence · supplier economics" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_HEADLINE =
  "Price history, substitutions, and cheaper vendor recommendations" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_SUBLINE =
  "Three vendor intelligence signals — per-ingredient price history, approved substitutions, and cheaper vendor switch opportunities. BETA: verify with supplier invoices — typical directional intelligence, not certified procurement audit." as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES = [
  {
    id: "price-history",
    label: "Price history",
    description: "Per-ingredient unit cost trend across suppliers from invoice and catalog updates.",
    module: "services/purchasing/supplier-price-history-service.ts",
    route: VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE,
  },
  {
    id: "substitutions",
    label: "Substitutions",
    description: "Approved ingredient substitutions when primary vendor is out or overpriced.",
    module: "lib/inventory/vendor-price-intelligence-p2-100-operations.ts",
    route: VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE,
  },
  {
    id: "cheaper-vendor",
    label: "Cheaper vendor",
    description: "Best vs current supplier — savings per order and switch recommendation.",
    module: "lib/ai/ai-purchasing-builders.ts",
    route: VENDOR_PRICE_INTELLIGENCE_P2_100_PURCHASING_ROUTE,
  },
] as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATOR_LINKS = [
  { label: "Purchasing", href: VENDOR_PRICE_INTELLIGENCE_P2_100_PURCHASING_ROUTE },
  { label: "Purchase suggestions", href: "/dashboard/inventory/purchase-suggestions" },
  { label: "Marketplace price intel", href: "/dashboard/marketplace/price-intelligence" },
] as const;

export { VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT, VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE };
