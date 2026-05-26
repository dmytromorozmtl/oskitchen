import {
  type SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PlanLimits = {
  maxMenus: number | null;
  maxOrdersPerMonth: number | null;
  /** Active external store connections (null = unlimited). */
  maxIntegrations: number | null;
};

const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  STARTER: { maxMenus: 1, maxOrdersPerMonth: 100, maxIntegrations: 1 },
  PRO: { maxMenus: null, maxOrdersPerMonth: 1000, maxIntegrations: 3 },
  TEAM: { maxMenus: null, maxOrdersPerMonth: null, maxIntegrations: null },
  ENTERPRISE: { maxMenus: null, maxOrdersPerMonth: null, maxIntegrations: null },
};

export function limitsForPlan(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export async function getEffectivePlan(userId: string): Promise<{
  plan: SubscriptionPlan;
  limits: PlanLimits;
  subscriptionActive: boolean;
}> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = sub?.plan ?? "STARTER";
  const subscriptionActive =
    sub?.status === SubscriptionStatus.ACTIVE ||
    sub?.status === SubscriptionStatus.TRIALING;

  return {
    plan,
    limits: limitsForPlan(plan),
    subscriptionActive,
  };
}

export async function countMenusForUser(userId: string) {
  return prisma.menu.count({ where: { userId, catalogOnly: false } });
}

export async function countOrdersThisMonth(userId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return prisma.order.count({
    where: {
      userId,
      createdAt: { gte: start },
    },
  });
}
