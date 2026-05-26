import type { SubscriptionPlan } from "@prisma/client";

export type GatedFeature =
  | "channels_woocommerce"
  | "channels_shopify"
  | "channels_uber"
  | "analytics_pro"
  | "webhook_replay"
  | "advanced_production";

/** Plan-aware gates for UX (soft prompts — server limits still enforce hard caps). */
export function planAllowsFeature(
  plan: SubscriptionPlan,
  feature: GatedFeature,
): boolean {
  switch (feature) {
    case "channels_woocommerce":
    case "channels_shopify":
      return plan !== "STARTER";
    case "channels_uber":
      return plan === "TEAM" || plan === "ENTERPRISE";
    case "analytics_pro":
      return plan !== "STARTER";
    case "webhook_replay":
    case "advanced_production":
      return plan === "TEAM" || plan === "ENTERPRISE";
    default:
      return true;
  }
}

export function requiredPlanForFeature(feature: GatedFeature): SubscriptionPlan {
  switch (feature) {
    case "channels_woocommerce":
    case "channels_shopify":
    case "analytics_pro":
      return "PRO";
    case "channels_uber":
    case "webhook_replay":
    case "advanced_production":
      return "TEAM";
    default:
      return "PRO";
  }
}
