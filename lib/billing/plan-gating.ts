import type { SubscriptionPlan } from "@prisma/client";

import { canUseFeature as canUseFeatureInternal, type FeatureKey } from "@/lib/plans/feature-registry";
import {
  countMenusForUser,
  countOrdersThisMonth,
  getEffectivePlan,
  limitsForPlan,
  type PlanLimits,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export type CommercialPlanKey = "STARTER" | "PRO" | "TEAM";

export const PLAN_LIMITS: Record<
  CommercialPlanKey,
  {
    maxProducts: number;
    maxStaff: number;
    maxLocations: number;
    maxOrdersPerMonth: number;
    features: string[];
  }
> = {
  STARTER: {
    maxProducts: 50,
    maxStaff: 3,
    maxLocations: 1,
    maxOrdersPerMonth: 100,
    features: ["pos", "orders", "production", "kitchen_display", "manual_orders"],
  },
  PRO: {
    maxProducts: 500,
    maxStaff: 10,
    maxLocations: 2,
    maxOrdersPerMonth: 1000,
    features: [
      "pos",
      "orders",
      "production",
      "kitchen_display",
      "storefront",
      "analytics",
      "inventory",
      "woocommerce",
      "shopify",
      "customer_crm",
    ],
  },
  TEAM: {
    maxProducts: Number.POSITIVE_INFINITY,
    maxStaff: Number.POSITIVE_INFINITY,
    maxLocations: 5,
    maxOrdersPerMonth: Number.POSITIVE_INFINITY,
    features: ["all"],
  },
};

export type UsageResource = "products" | "staff" | "locations" | "orders_this_month" | "menus";

export async function getCurrentPlan(userId: string): Promise<SubscriptionPlan> {
  const { plan } = await getEffectivePlan(userId);
  return plan;
}

export async function canUseFeature(userId: string, feature: string): Promise<boolean> {
  const plan = await getCurrentPlan(userId);
  const key = normalizeCommercialPlan(plan);
  const limits = PLAN_LIMITS[key];
  if (limits.features.includes("all")) return true;
  if (limits.features.includes(feature)) return true;

  const mapped = FEATURE_ALIAS[feature];
  if (mapped) {
    const gate = await canUseFeatureInternal(userId, mapped);
    return gate.allowed;
  }
  return false;
}

export async function checkUsageLimit(
  userId: string,
  resource: UsageResource,
): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const { plan, limits } = await getEffectivePlan(userId);
  const commercial = PLAN_LIMITS[normalizeCommercialPlan(plan)];

  switch (resource) {
    case "products": {
      const current = await prisma.product.count({ where: { menu: { userId } } });
      const max = commercial.maxProducts;
      return { allowed: max === Number.POSITIVE_INFINITY || current < max, current, max: finiteMax(max) };
    }
    case "staff": {
      const current = await prisma.staffMember.count({ where: { userId } });
      const max = commercial.maxStaff;
      return { allowed: max === Number.POSITIVE_INFINITY || current < max, current, max: finiteMax(max) };
    }
    case "locations": {
      const current = await prisma.location.count({ where: { userId } });
      const max = commercial.maxLocations;
      return { allowed: current < max, current, max };
    }
    case "orders_this_month": {
      const current = await countOrdersThisMonth(userId);
      const max = limits.maxOrdersPerMonth ?? commercial.maxOrdersPerMonth;
      return {
        allowed: max == null || current < max,
        current,
        max: max ?? null,
      };
    }
    case "menus": {
      const current = await countMenusForUser(userId);
      const max = limits.maxMenus;
      return { allowed: max == null || current < max, current, max };
    }
    default:
      return { allowed: true, current: 0, max: null };
  }
}

export { limitsForPlan, type PlanLimits };

const FEATURE_ALIAS: Record<string, FeatureKey> = {
  pos: "pos_terminal",
  storefront: "storefront",
  analytics: "analytics",
  inventory: "inventory",
  inventory_lite: "inventory",
};

function normalizeCommercialPlan(plan: SubscriptionPlan): CommercialPlanKey {
  if (plan === "PRO") return "PRO";
  if (plan === "TEAM" || plan === "ENTERPRISE") return "TEAM";
  return "STARTER";
}

function finiteMax(n: number): number | null {
  return n === Number.POSITIVE_INFINITY ? null : n;
}
