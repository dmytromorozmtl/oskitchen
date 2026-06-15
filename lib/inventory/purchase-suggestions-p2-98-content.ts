import {
  PURCHASE_SUGGESTIONS_P2_98_AUTO_ORDERING_ROUTE,
  PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT,
  PURCHASE_SUGGESTIONS_P2_98_PURCHASING_AI_ROUTE,
  PURCHASE_SUGGESTIONS_P2_98_ROUTE,
} from "@/lib/inventory/purchase-suggestions-p2-98-policy";

export const PURCHASE_SUGGESTIONS_P2_98_EYEBROW =
  "Purchase suggestions · AI-assisted inventory" as const;

export const PURCHASE_SUGGESTIONS_P2_98_HEADLINE =
  "Forecast, low stock, menu demand, and vendor price change signals" as const;

export const PURCHASE_SUGGESTIONS_P2_98_SUBLINE =
  "Four purchase signals per ingredient — 14-day forecast, reorder coverage, menu-driven demand, and vendor price deltas. BETA: verify with supplier invoices — typical AI-assisted suggestions, not certified procurement audit." as const;

export const PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES = [
  {
    id: "forecast",
    label: "Forecast",
    description: "14-day predicted demand from usage history and production forecast.",
    module: "lib/ai/ai-purchasing-builders.ts",
    route: PURCHASE_SUGGESTIONS_P2_98_ROUTE,
  },
  {
    id: "low-stock",
    label: "Low stock",
    description: "Days remaining vs reorder point and lead time — critical/high urgency.",
    module: "lib/inventory/purchase-suggestions-p2-98-operations.ts",
    route: PURCHASE_SUGGESTIONS_P2_98_ROUTE,
  },
  {
    id: "menu-demand",
    label: "Menu demand",
    description: "Ingredient pull from open orders, recipes, and menu mix.",
    module: "services/ingredient-demand/demand-service.ts",
    route: PURCHASE_SUGGESTIONS_P2_98_ROUTE,
  },
  {
    id: "vendor-price",
    label: "Vendor price changes",
    description: "Best vs alternative supplier — switch, bulk, or hold recommendations.",
    module: "lib/ai/ai-purchasing-builders.ts",
    route: PURCHASE_SUGGESTIONS_P2_98_PURCHASING_AI_ROUTE,
  },
] as const;

export const PURCHASE_SUGGESTIONS_P2_98_OPERATOR_LINKS = [
  { label: "AI Purchasing", href: PURCHASE_SUGGESTIONS_P2_98_PURCHASING_AI_ROUTE },
  { label: "Auto-ordering", href: PURCHASE_SUGGESTIONS_P2_98_AUTO_ORDERING_ROUTE },
  { label: "Purchase orders", href: "/dashboard/purchasing/purchase-orders" },
] as const;

export { PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT, PURCHASE_SUGGESTIONS_P2_98_ROUTE };
