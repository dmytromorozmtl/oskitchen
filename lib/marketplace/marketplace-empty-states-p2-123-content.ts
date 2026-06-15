import {
  MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT,
  MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_ROUTE,
  MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_ROUTE,
  MARKETPLACE_EMPTY_STATES_P2_123_ROUTE,
  MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_ROUTE,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-policy";

export const MARKETPLACE_EMPTY_STATES_P2_123_EYEBROW = "Marketplace UX · Empty states" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_HEADLINE =
  "No vendors, orders, or products — illustration, value prop, and CTA" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_SUBLINE =
  "Three core procurement empty states when catalog, PO history, or vendor roster is blank. BETA: verify wiring on live pages — typical directional UX, not certified design audit." as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES = [
  {
    id: "no-products",
    label: "No products",
    scenario: "catalog_empty" as const,
    description:
      "Catalog page shows illustration + value props when no SKUs are published for the workspace.",
    module: "app/dashboard/marketplace/catalog/page.tsx",
    route: MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_ROUTE,
  },
  {
    id: "no-orders",
    label: "No orders",
    scenario: "orders_empty" as const,
    description:
      "Orders list shows engaging empty state with browse-catalog CTA when PO history is blank.",
    module: "app/dashboard/marketplace/orders/page.tsx",
    route: MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_ROUTE,
  },
  {
    id: "no-vendors",
    label: "No vendors",
    scenario: "vendors_empty" as const,
    description:
      "Vendors roster shows inline empty state when no approved suppliers are on the list.",
    module: "components/marketplace/marketplace-vendors-list-client.tsx",
    route: MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_ROUTE,
  },
] as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_OPERATOR_LINKS = [
  { label: "Browse catalog", href: MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_ROUTE },
  { label: "View orders", href: MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_ROUTE },
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
] as const;

export { MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT, MARKETPLACE_EMPTY_STATES_P2_123_ROUTE };
