import type { SubscriptionPlan } from "@prisma/client";

export type PlanKey = SubscriptionPlan;

export type PlanLimits = {
  /** Active workspace menus (excludes catalog-only). null = unlimited. */
  maxMenus: number | null;
  /** Orders captured per calendar month. null = unlimited. */
  maxOrdersPerMonth: number | null;
  /** External sales-channel connections. null = unlimited. */
  maxIntegrations: number | null;
  /** Staff members (counts ACTIVE / TRAINING). null = unlimited. */
  maxStaff: number | null;
  /** Brands. null = unlimited. */
  maxBrands: number | null;
  /** Locations. null = unlimited. */
  maxLocations: number | null;
  /** Storefronts. null = unlimited. */
  maxStorefronts: number | null;
};

export type PlanFeatureSet = {
  manualOrders: boolean;
  storefront: boolean;
  packingLabels: boolean;
  packingVerification: boolean;
  analytics: boolean;
  customerCrm: boolean;
  inventory: boolean;
  costing: boolean;
  forecasting: boolean;
  staffRoles: boolean;
  deliveryRoutes: boolean;
  webhookReplay: boolean;
  multiLocation: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  ssoOidc: boolean;
  advancedProduction: boolean;
  woocommerce: boolean;
  shopify: boolean;
  uberEats: boolean;
  uberDirect: boolean;
};

export type PlanSupportLevel = "community" | "email" | "priority" | "dedicated";

export type PlanDefinition = {
  key: PlanKey;
  name: string;
  tagline: string;
  description: string;
  priceMonthlyUsd: number | null;
  /** Stripe price id env key (server only). */
  stripePriceEnvKey: "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID" | "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID" | "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID" | "NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID" | null;
  /** Allows checkout from this plan card. */
  checkoutable: boolean;
  rank: number;
  limits: PlanLimits;
  features: PlanFeatureSet;
  visibleModules: string[];
  allowedIntegrations: string[];
  supportLevel: PlanSupportLevel;
  highlight?: boolean;
};

const NONE_FEATURES: PlanFeatureSet = {
  manualOrders: false,
  storefront: false,
  packingLabels: false,
  packingVerification: false,
  analytics: false,
  customerCrm: false,
  inventory: false,
  costing: false,
  forecasting: false,
  staffRoles: false,
  deliveryRoutes: false,
  webhookReplay: false,
  multiLocation: false,
  apiAccess: false,
  whiteLabel: false,
  ssoOidc: false,
  advancedProduction: false,
  woocommerce: false,
  shopify: false,
  uberEats: false,
  uberDirect: false,
};

export const PLAN_REGISTRY: Record<PlanKey, PlanDefinition> = {
  STARTER: {
    key: "STARTER",
    name: "Starter",
    tagline: "Manual operations + a single menu.",
    description:
      "Manual orders, one active menu, basic production board, basic reports. No external integrations.",
    priceMonthlyUsd: 49,
    stripePriceEnvKey: "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID",
    checkoutable: true,
    rank: 1,
    limits: {
      maxMenus: 1,
      maxOrdersPerMonth: 100,
      maxIntegrations: 0,
      maxStaff: 3,
      maxBrands: 1,
      maxLocations: 1,
      maxStorefronts: 1,
    },
    features: {
      ...NONE_FEATURES,
      manualOrders: true,
      storefront: true,
    },
    visibleModules: ["orders", "production", "menu", "staff", "training", "billing"],
    allowedIntegrations: [],
    supportLevel: "community",
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    tagline: "WooCommerce + Shopify, analytics, packing labels.",
    description:
      "WooCommerce + Shopify, 1,000 orders/month, packing labels, analytics, inventory lite, product mapping, storefront.",
    priceMonthlyUsd: 79,
    stripePriceEnvKey: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
    checkoutable: true,
    rank: 2,
    highlight: true,
    limits: {
      maxMenus: null,
      maxOrdersPerMonth: 1000,
      maxIntegrations: 3,
      maxStaff: 10,
      maxBrands: 2,
      maxLocations: 2,
      maxStorefronts: 2,
    },
    features: {
      ...NONE_FEATURES,
      manualOrders: true,
      storefront: true,
      packingLabels: true,
      analytics: true,
      customerCrm: true,
      inventory: true,
      costing: true,
      woocommerce: true,
      shopify: true,
    },
    visibleModules: [
      "orders", "production", "menu", "staff", "training", "packing",
      "analytics", "customers", "costing", "billing", "sales-channels",
    ],
    allowedIntegrations: ["WOOCOMMERCE", "SHOPIFY", "MANUAL"],
    supportLevel: "email",
  },
  TEAM: {
    key: "TEAM",
    name: "Team",
    tagline: "Roles, routes, advanced production, multi-user.",
    description:
      "Roles/staff, high order cap, advanced production, packing verification, routes, webhooks, Uber modules.",
    priceMonthlyUsd: 199,
    stripePriceEnvKey: "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID",
    checkoutable: true,
    rank: 3,
    limits: {
      maxMenus: null,
      maxOrdersPerMonth: null,
      maxIntegrations: null,
      maxStaff: null,
      maxBrands: 5,
      maxLocations: 3,
      maxStorefronts: 5,
    },
    features: {
      ...NONE_FEATURES,
      manualOrders: true,
      storefront: true,
      packingLabels: true,
      packingVerification: true,
      analytics: true,
      customerCrm: true,
      inventory: true,
      costing: true,
      forecasting: true,
      staffRoles: true,
      deliveryRoutes: true,
      webhookReplay: true,
      advancedProduction: true,
      whiteLabel: true,
      woocommerce: true,
      shopify: true,
      uberEats: true,
      uberDirect: true,
    },
    visibleModules: [
      "orders", "production", "menu", "staff", "training", "packing",
      "analytics", "customers", "costing", "delivery", "routes",
      "sales-channels", "forecast", "billing",
    ],
    allowedIntegrations: ["WOOCOMMERCE", "SHOPIFY", "UBER_EATS", "UBER_DIRECT", "MANUAL"],
    supportLevel: "priority",
  },
  ENTERPRISE: {
    key: "ENTERPRISE",
    name: "Enterprise",
    tagline: "Multi-location, custom integrations, SLA.",
    description:
      "Multi-location, custom integrations, dedicated SLA, API access, advanced permissions, custom limits.",
    priceMonthlyUsd: 499,
    stripePriceEnvKey: "NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID",
    checkoutable: false,
    rank: 4,
    limits: {
      maxMenus: null,
      maxOrdersPerMonth: null,
      maxIntegrations: null,
      maxStaff: null,
      maxBrands: null,
      maxLocations: null,
      maxStorefronts: null,
    },
    features: {
      ...NONE_FEATURES,
      manualOrders: true,
      storefront: true,
      packingLabels: true,
      packingVerification: true,
      analytics: true,
      customerCrm: true,
      inventory: true,
      costing: true,
      forecasting: true,
      staffRoles: true,
      deliveryRoutes: true,
      webhookReplay: true,
      multiLocation: true,
      apiAccess: true,
      whiteLabel: true,
      ssoOidc: true,
      advancedProduction: true,
      woocommerce: true,
      shopify: true,
      uberEats: true,
      uberDirect: true,
    },
    visibleModules: [
      "orders", "production", "menu", "staff", "training", "packing",
      "analytics", "customers", "costing", "delivery", "routes",
      "sales-channels", "forecast", "locations", "brands", "platform",
      "billing", "api",
    ],
    allowedIntegrations: ["WOOCOMMERCE", "SHOPIFY", "UBER_EATS", "UBER_DIRECT", "MANUAL"],
    supportLevel: "dedicated",
  },
};

export const PLAN_KEYS: PlanKey[] = ["STARTER", "PRO", "TEAM", "ENTERPRISE"];

export function planDef(plan: PlanKey): PlanDefinition {
  return PLAN_REGISTRY[plan];
}

export function planRank(plan: PlanKey): number {
  return PLAN_REGISTRY[plan].rank;
}

export function planMeetsRank(plan: PlanKey, required: PlanKey): boolean {
  return planRank(plan) >= planRank(required);
}

export function planLimits(plan: PlanKey): PlanLimits {
  return PLAN_REGISTRY[plan].limits;
}

export function planFeatures(plan: PlanKey): PlanFeatureSet {
  return PLAN_REGISTRY[plan].features;
}

export function checkoutablePlans(): PlanDefinition[] {
  return PLAN_KEYS.map(planDef).filter((p) => p.checkoutable);
}
