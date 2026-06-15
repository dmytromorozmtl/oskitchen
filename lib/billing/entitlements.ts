import type { PlanFeatureSet, PlanKey } from "@/lib/billing/plan-registry";
import { planFeatures } from "@/lib/billing/plan-registry";

export type FeatureFlag = keyof PlanFeatureSet;

export const FEATURE_FLAGS: FeatureFlag[] = [
  "manualOrders",
  "storefront",
  "packingLabels",
  "packingVerification",
  "analytics",
  "customerCrm",
  "inventory",
  "costing",
  "forecasting",
  "staffRoles",
  "deliveryRoutes",
  "webhookReplay",
  "multiLocation",
  "apiAccess",
  "whiteLabel",
  "ssoOidc",
  "advancedProduction",
  "woocommerce",
  "shopify",
  "uberEats",
  "uberDirect",
];

export const FEATURE_LABEL: Record<FeatureFlag, string> = {
  manualOrders: "Manual orders",
  storefront: "Storefront",
  packingLabels: "Packing labels",
  packingVerification: "Packing verification",
  analytics: "Analytics",
  customerCrm: "Customer CRM",
  inventory: "Inventory",
  costing: "Costing",
  forecasting: "Forecasting",
  staffRoles: "Staff roles & permissions",
  deliveryRoutes: "Delivery routes",
  webhookReplay: "Webhook replay",
  multiLocation: "Multi-location",
  apiAccess: "API access",
  whiteLabel: "White-label",
  ssoOidc: "SSO / OIDC",
  advancedProduction: "Advanced production",
  woocommerce: "WooCommerce",
  shopify: "Shopify",
  uberEats: "Uber Eats",
  uberDirect: "Uber Direct",
};

/** Default plan entitlement, before overrides. */
export function planHasFeature(plan: PlanKey, feature: FeatureFlag): boolean {
  return planFeatures(plan)[feature];
}

/** Merge an override map (from EntitlementOverride.valueJson) on top of the plan default. */
export function applyOverrides(
  plan: PlanKey,
  overrides: Partial<Record<FeatureFlag, boolean>> | null | undefined,
): PlanFeatureSet {
  const base = { ...planFeatures(plan) };
  if (!overrides) return base;
  for (const k of Object.keys(overrides) as FeatureFlag[]) {
    if (typeof overrides[k] === "boolean") {
      base[k] = overrides[k] as boolean;
    }
  }
  return base;
}

export function planUpgradeForFeature(feature: FeatureFlag): PlanKey | null {
  const order: PlanKey[] = ["STARTER", "PRO", "TEAM", "ENTERPRISE"];
  for (const k of order) {
    if (planFeatures(k)[feature]) return k;
  }
  return null;
}
