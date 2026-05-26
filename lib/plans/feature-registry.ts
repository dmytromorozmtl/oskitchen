import type { SubscriptionPlan } from "@prisma/client";

import { getBillingAccess } from "@/lib/billing/access";
import { isBillingBypassed } from "@/lib/billing/dev-bypass";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";

export const FEATURE_KEYS = [
  "manual_orders",
  "storefront",
  "active_menu_limit",
  "order_limit",
  "woocommerce",
  "shopify",
  "uber_eats",
  "uber_direct",
  "packing_labels",
  "analytics",
  "customer_crm",
  "inventory",
  "costing",
  "forecasting",
  "staff_roles",
  "delivery_routes",
  "webhook_replay",
  "multi_location",
  "api_access",
  "white_label",
  "pos_terminal",
  "pos_registers",
  "pos_shifts",
  "pos_receipts",
  "pos_reports",
  "pos_multi_location",
  "pos_hardware_settings",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  STARTER: 1,
  PRO: 2,
  TEAM: 3,
  ENTERPRISE: 4,
};

/** Minimum plan required to use a feature (at full entitlement). */
const FEATURE_MIN_PLAN: Record<FeatureKey, SubscriptionPlan> = {
  manual_orders: "STARTER",
  storefront: "STARTER",
  active_menu_limit: "STARTER",
  order_limit: "STARTER",
  woocommerce: "PRO",
  shopify: "PRO",
  packing_labels: "PRO",
  analytics: "PRO",
  customer_crm: "PRO",
  inventory: "PRO",
  costing: "PRO",
  uber_eats: "TEAM",
  uber_direct: "TEAM",
  staff_roles: "TEAM",
  delivery_routes: "TEAM",
  forecasting: "TEAM",
  webhook_replay: "TEAM",
  multi_location: "ENTERPRISE",
  api_access: "ENTERPRISE",
  white_label: "TEAM",
  pos_terminal: "PRO",
  pos_registers: "PRO",
  pos_receipts: "PRO",
  pos_shifts: "TEAM",
  pos_reports: "TEAM",
  pos_multi_location: "ENTERPRISE",
  pos_hardware_settings: "TEAM",
};

export type PlanLimitsMap = {
  maxMenus: number | null;
  maxOrdersPerMonth: number | null;
  maxIntegrations: number | null;
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimitsMap {
  switch (plan) {
    case "STARTER":
      return { maxMenus: 1, maxOrdersPerMonth: 100, maxIntegrations: 1 };
    case "PRO":
      return { maxMenus: null, maxOrdersPerMonth: 1000, maxIntegrations: 3 };
    case "TEAM":
    case "ENTERPRISE":
      return { maxMenus: null, maxOrdersPerMonth: null, maxIntegrations: null };
    default:
      return { maxMenus: 1, maxOrdersPerMonth: 100, maxIntegrations: 1 };
  }
}

export function planMeetsFeature(
  plan: SubscriptionPlan,
  feature: FeatureKey,
): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[FEATURE_MIN_PLAN[feature]];
}

export async function canUseFeature(
  userId: string,
  feature: FeatureKey,
): Promise<{ allowed: boolean; plan: SubscriptionPlan; reason?: string }> {
  if (isBillingBypassed()) {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    return { allowed: true, plan: sub?.plan ?? "STARTER" };
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (await isSuperAdminUser(userId, profile?.email)) {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    return { allowed: true, plan: sub?.plan ?? "ENTERPRISE" };
  }

  const access = await getBillingAccess(userId);
  if (!access.hasAppAccess) {
    return {
      allowed: false,
      plan: access.plan,
      reason: "trial_ended",
    };
  }

  const trialPosFeatures: FeatureKey[] = [
    "pos_terminal",
    "pos_registers",
    "pos_receipts",
  ];
  if (access.inLocalTrial && trialPosFeatures.includes(feature)) {
    return { allowed: true, plan: access.plan };
  }

  if (!planMeetsFeature(access.plan, feature)) {
    return {
      allowed: false,
      plan: access.plan,
      reason: "plan",
    };
  }

  return { allowed: true, plan: access.plan };
}

/** Server actions / routes: throw-free guard. */
export async function requireFeature(
  userId: string,
  feature: FeatureKey,
): Promise<{ ok: true; plan: SubscriptionPlan } | { ok: false; reason: string }> {
  const r = await canUseFeature(userId, feature);
  if (!r.allowed) {
    return {
      ok: false,
      reason: r.reason === "trial_ended" ? "trial_ended" : "upgrade_required",
    };
  }
  return { ok: true, plan: r.plan };
}

export function minimumPlanForFeature(feature: FeatureKey): SubscriptionPlan {
  return FEATURE_MIN_PLAN[feature];
}
