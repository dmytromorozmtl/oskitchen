import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Package,
  PackageSearch,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

/**
 * P1-25 — marketplace empty-state copy + CTA registry.
 *
 * @see components/marketplace/marketplace-empty-state.tsx
 */

export const MARKETPLACE_EMPTY_STATES_POLICY_ID = "marketplace-empty-states-p1-25-v1" as const;

export type MarketplaceEmptyStateScenario =
  | "dashboard_unavailable"
  | "order_again"
  | "recommendations"
  | "featured_vendors"
  | "popular_region"
  | "new_arrivals"
  | "pending_actions"
  | "lane_products"
  | "catalog_empty"
  | "catalog_filtered"
  | "orders_empty"
  | "orders_filtered"
  | "vendors_empty"
  | "cart_empty";

export type MarketplaceEmptyStateDefinition = {
  icon: LucideIcon;
  title: string;
  description: string;
  valueProps: readonly string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export const MARKETPLACE_EMPTY_STATE_SCENARIOS: readonly MarketplaceEmptyStateScenario[] = [
  "dashboard_unavailable",
  "order_again",
  "recommendations",
  "featured_vendors",
  "popular_region",
  "new_arrivals",
  "pending_actions",
  "lane_products",
  "catalog_empty",
  "catalog_filtered",
  "orders_empty",
  "orders_filtered",
  "vendors_empty",
  "cart_empty",
] as const;

const DEFINITIONS: Record<MarketplaceEmptyStateScenario, MarketplaceEmptyStateDefinition> = {
  dashboard_unavailable: {
    icon: Store,
    title: "Marketplace temporarily unavailable",
    description: "We could not load procurement data for this workspace. Your catalog and vendors are still accessible.",
    valueProps: [
      "Browse verified HoReCa suppliers by category",
      "Build multi-vendor carts with one checkout",
      "Track POs through delivery and receiving",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "Integration health",
    secondaryHref: "/dashboard/integration-health",
  },
  order_again: {
    icon: ShoppingBag,
    title: "No reorder shortcuts yet",
    description: "Your last marketplace purchases appear here for one-click reorder — cut weekly procurement time.",
    valueProps: [
      "Reorder disposables, dry goods, and packaging in seconds",
      "Split POs automatically by vendor at checkout",
      "Sync received items into inventory counts",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "Compare suppliers",
    secondaryHref: "/dashboard/marketplace/compare",
  },
  recommendations: {
    icon: Sparkles,
    title: "Recommendations unlock after your first order",
    description: "We match SKUs to your business type, menu mix, and purchase history once catalog data is available.",
    valueProps: [
      "Personalized picks for packaging, proteins, and prep supplies",
      "Price and lead-time signals from verified vendors",
      "Save favorites for faster weekly buying",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "View vendors",
    secondaryHref: "/dashboard/marketplace/vendors",
  },
  featured_vendors: {
    icon: Store,
    title: "No featured vendors this week",
    description: "Featured suppliers rotate weekly once catalogs are approved and actively stocked.",
    valueProps: [
      "Verified HoReCa distributors with SLA-backed delivery",
      "Side-by-side supplier comparison before you commit",
      "Net terms and card checkout on the same cart",
    ],
    primaryLabel: "Browse vendors",
    primaryHref: "/dashboard/marketplace/vendors",
    secondaryLabel: "Browse catalog",
    secondaryHref: "/dashboard/marketplace/catalog",
  },
  popular_region: {
    icon: Truck,
    title: "No regional trends yet",
    description: "Popular SKUs populate as nearby operators place marketplace orders in your metro.",
    valueProps: [
      "See what peer restaurants reorder each week",
      "Discover vetted substitutes when items go backorder",
      "Add trending items to cart without leaving the dashboard",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
  },
  new_arrivals: {
    icon: Package,
    title: "No new listings yet",
    description: "Recently onboarded vendors and SKUs show here as catalogs go live.",
    valueProps: [
      "Get early access to new packaging and equipment lines",
      "Request samples through vendor profiles",
      "Set recurring orders for staple items",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "View vendors",
    secondaryHref: "/dashboard/marketplace/vendors",
  },
  pending_actions: {
    icon: ClipboardList,
    title: "All caught up",
    description: "No approvals, deliveries, disputes, or recurring runs need attention right now.",
    valueProps: [
      "Manager approvals route here when carts exceed limits",
      "Shipment and receiving exceptions surface automatically",
      "Recurring vendor schedules run without manual PO entry",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "View orders",
    secondaryHref: "/dashboard/marketplace/orders",
  },
  lane_products: {
    icon: PackageSearch,
    title: "Lane catalog coming soon",
    description: "Approved vendors publish food, packaging, and equipment SKUs lane by lane.",
    valueProps: [
      "One-click reorder from your last lane purchase",
      "MOQ, lead time, and stock badges on every SKU",
      "Split checkout across multiple suppliers",
    ],
    primaryLabel: "Browse lane",
    primaryHref: "/dashboard/marketplace/catalog",
  },
  catalog_empty: {
    icon: PackageSearch,
    title: "Build your first vendor catalog",
    description: "Marketplace products appear once verified suppliers publish active SKUs for your workspace.",
    valueProps: [
      "Eight HoReCa categories — dry goods, packaging, equipment, and more",
      "Filter by price, MOQ, lead time, and vendor rating",
      "Add to cart from any device — checkout splits by vendor",
    ],
    primaryLabel: "Marketplace home",
    primaryHref: "/dashboard/marketplace",
    secondaryLabel: "Browse vendors",
    secondaryHref: "/dashboard/marketplace/vendors",
  },
  catalog_filtered: {
    icon: PackageSearch,
    title: "No products match your filters",
    description: "Try widening category, vendor, price, or stock filters to see more catalog items.",
    valueProps: [
      "Save filter presets as cart templates",
      "Compare similar SKUs side by side",
      "Clear filters to restore the full catalog",
    ],
    primaryLabel: "Reset filters",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "Marketplace home",
    secondaryHref: "/dashboard/marketplace",
  },
  orders_empty: {
    icon: ClipboardList,
    title: "No marketplace orders yet",
    description: "Checkout from the catalog to create purchase orders with approved vendors — tracking starts here.",
    valueProps: [
      "Multi-vendor cart becomes separate POs per supplier",
      "Approval gates for manager-controlled spend",
      "Receiving ties into inventory and invoice matching",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "Marketplace home",
    secondaryHref: "/dashboard/marketplace",
  },
  orders_filtered: {
    icon: ClipboardList,
    title: "No orders match your filters",
    description: "Clear status, vendor, or date filters to see your full PO history.",
    valueProps: [
      "Filter by vendor, status, or delivery window",
      "Export PO history for accounting",
      "Jump to recurring schedules from the Orders tab",
    ],
    primaryLabel: "Clear filters",
    primaryHref: "/dashboard/marketplace/orders",
    secondaryLabel: "Browse catalog",
    secondaryHref: "/dashboard/marketplace/catalog",
  },
  vendors_empty: {
    icon: Store,
    title: "No vendors on your list yet",
    description: "Place marketplace orders or favorite approved suppliers to build your procurement roster.",
    valueProps: [
      "Favorite vendors for one-tap reorder",
      "View SLAs, catalogs, and payment terms per supplier",
      "Compare pricing before you commit to a PO",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "Compare suppliers",
    secondaryHref: "/dashboard/marketplace/compare",
  },
  cart_empty: {
    icon: ShoppingCart,
    title: "Your marketplace cart is empty",
    description: "Add products from the catalog, then return here to validate stock and place orders.",
    valueProps: [
      "Cart splits into separate POs per vendor at checkout",
      "Save weekly templates for recurring procurement",
      "Manager approval when spend exceeds your threshold",
    ],
    primaryLabel: "Browse catalog",
    primaryHref: "/dashboard/marketplace/catalog",
    secondaryLabel: "Marketplace home",
    secondaryHref: "/dashboard/marketplace",
  },
};

export function getMarketplaceEmptyStateDefinition(
  scenario: MarketplaceEmptyStateScenario,
  overrides?: Partial<Pick<MarketplaceEmptyStateDefinition, "primaryHref" | "primaryLabel">>,
): MarketplaceEmptyStateDefinition {
  const base = DEFINITIONS[scenario];
  return { ...base, ...overrides };
}

export type MarketplaceEmptyStateAudit = {
  policyId: typeof MARKETPLACE_EMPTY_STATES_POLICY_ID;
  scenarioCount: number;
  allHavePrimaryCta: boolean;
  allHaveValueProps: boolean;
  passed: boolean;
};

export function auditMarketplaceEmptyStatesPolicy(): MarketplaceEmptyStateAudit {
  const defs = MARKETPLACE_EMPTY_STATE_SCENARIOS.map((s) => DEFINITIONS[s]);
  const allHavePrimaryCta = defs.every((d) => d.primaryLabel.length > 0 && d.primaryHref.startsWith("/"));
  const allHaveValueProps = defs.every((d) => d.valueProps.length >= 2);
  return {
    policyId: MARKETPLACE_EMPTY_STATES_POLICY_ID,
    scenarioCount: MARKETPLACE_EMPTY_STATE_SCENARIOS.length,
    allHavePrimaryCta,
    allHaveValueProps,
    passed: allHavePrimaryCta && allHaveValueProps,
  };
}

export const MARKETPLACE_EMPTY_STATE_UI_MODULE =
  "components/marketplace/marketplace-empty-state.tsx" as const;

export const MARKETPLACE_EMPTY_STATE_WIRED_MODULES = [
  "components/marketplace/marketplace-dashboard-async-section.tsx",
  "components/marketplace/marketplace-dashboard-sections.tsx",
  "components/marketplace/supplier-marketplace-lanes.tsx",
  "app/dashboard/marketplace/catalog/page.tsx",
  "app/dashboard/marketplace/orders/page.tsx",
  "app/dashboard/marketplace/checkout/page.tsx",
  "components/marketplace/marketplace-vendors-list-client.tsx",
  "components/marketplace/marketplace-orders-list-client.tsx",
] as const;
