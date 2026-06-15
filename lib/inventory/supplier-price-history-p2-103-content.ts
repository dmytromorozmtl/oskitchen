import {
  SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT,
  SUPPLIER_PRICE_HISTORY_P2_103_PURCHASING_ROUTE,
  SUPPLIER_PRICE_HISTORY_P2_103_ROUTE,
} from "@/lib/inventory/supplier-price-history-p2-103-policy";

export const SUPPLIER_PRICE_HISTORY_P2_103_EYEBROW =
  "Supplier price history · per ingredient graph" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_HEADLINE =
  "Per-ingredient supplier price graphs and trend summaries" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_SUBLINE =
  "Three price history views — per-ingredient line graph, multi-supplier trend comparison, and period change summary. BETA: verify with supplier invoices — typical directional history, not certified procurement audit." as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES = [
  {
    id: "ingredient-graph",
    label: "Per-ingredient graph",
    description: "Line chart of unit cost over time for each ingredient — one graph per item.",
    module: "components/purchasing/supplier-price-chart.tsx",
    route: SUPPLIER_PRICE_HISTORY_P2_103_ROUTE,
  },
  {
    id: "multi-supplier-trend",
    label: "Multi-supplier trend",
    description: "Compare supplier price lines on the same ingredient — spot divergence.",
    module: "services/purchasing/supplier-price-history-service.ts",
    route: SUPPLIER_PRICE_HISTORY_P2_103_ROUTE,
  },
  {
    id: "price-change-summary",
    label: "Price change summary",
    description: "Min, max, and change % over the lookback window per ingredient.",
    module: "lib/inventory/supplier-price-history-p2-103-operations.ts",
    route: SUPPLIER_PRICE_HISTORY_P2_103_ROUTE,
  },
] as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_OPERATOR_LINKS = [
  { label: "Purchasing", href: SUPPLIER_PRICE_HISTORY_P2_103_PURCHASING_ROUTE },
  { label: "Vendor price intelligence", href: "/dashboard/inventory/vendor-price-intelligence" },
  { label: "Purchase suggestions", href: "/dashboard/inventory/purchase-suggestions" },
] as const;

export { SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT, SUPPLIER_PRICE_HISTORY_P2_103_ROUTE };
