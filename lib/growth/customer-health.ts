import type { CustomerHealthLevel } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type HealthResult = {
  score: number;
  status: CustomerHealthLevel;
  signals: Record<string, unknown>;
};

/** Lightweight health snapshot from recent activity (internal founder view). */
export async function computeCustomerHealth(userId: string): Promise<HealthResult> {
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [
    profile,
    orders14,
    menus,
    integrations,
    usageRecent,
    subscription,
    feedbackCount,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.order.count({
      where: { userId, createdAt: { gte: since } },
    }),
    prisma.menu.count({ where: { userId } }),
    prisma.integrationConnection.count({
      where: { userId, status: "CONNECTED" },
    }),
    prisma.usageEvent.count({
      where: { userId, createdAt: { gte: since } },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.appFeedback.count({ where: { userId } }),
  ]);

  let score = 40;
  const signals: Record<string, unknown> = {
    orders14d: orders14,
    menus,
    integrationsConnected: integrations,
    usageEvents14d: usageRecent,
    feedbackSubmitted: feedbackCount > 0,
  };

  if (profile?.onboardingCompleted) score += 15;
  if (menus > 0) score += 10;
  if (orders14 > 0) score += 15;
  if (integrations > 0) score += 10;
  if (usageRecent >= 3) score += 10;
  if (subscription?.stripeSubscriptionId) score += 5;

  if (orders14 === 0 && menus > 0) score -= 15;
  if (usageRecent === 0) score -= 10;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let status: CustomerHealthLevel = "NEEDS_ATTENTION";
  if (!profile?.onboardingCompleted) status = "NEW_ACCOUNT";
  else if (score >= 72) status = "HEALTHY";
  else if (score < 38) status = "AT_RISK";

  return { score, status, signals };
}

function countByUserId(rows: { userId: string; _count: { _all: number } }[]): Map<string, number> {
  return new Map(rows.map((row) => [row.userId, row._count._all]));
}

/** Batch health scoring for founder dashboards (avoids per-user query loops). */
export async function computeCustomerHealthBatch(
  userIds: string[],
): Promise<Map<string, HealthResult>> {
  const uniqueIds = [...new Set(userIds)];
  const results = new Map<string, HealthResult>();
  if (uniqueIds.length === 0) return results;

  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [
    profiles,
    subscriptions,
    orders14,
    menus,
    integrations,
    usageRecent,
    feedbackCounts,
  ] = await Promise.all([
    prisma.userProfile.findMany({ where: { id: { in: uniqueIds } } }),
    prisma.subscription.findMany({ where: { userId: { in: uniqueIds } } }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.menu.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds } },
      _count: { _all: true },
    }),
    prisma.integrationConnection.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds }, status: "CONNECTED" },
      _count: { _all: true },
    }),
    prisma.usageEvent.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.appFeedback.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds } },
      _count: { _all: true },
    }),
  ]);

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const subByUser = new Map(subscriptions.map((sub) => [sub.userId, sub]));
  const ordersMap = countByUserId(orders14);
  const menusMap = countByUserId(menus);
  const integrationsMap = countByUserId(integrations);
  const usageMap = countByUserId(usageRecent);
  const feedbackMap = countByUserId(feedbackCounts);

  for (const userId of uniqueIds) {
    const profile = profileById.get(userId);
    const orders14d = ordersMap.get(userId) ?? 0;
    const menuCount = menusMap.get(userId) ?? 0;
    const integrationCount = integrationsMap.get(userId) ?? 0;
    const usageCount = usageMap.get(userId) ?? 0;
    const feedbackCount = feedbackMap.get(userId) ?? 0;
    const subscription = subByUser.get(userId);

    let score = 40;
    const signals: Record<string, unknown> = {
      orders14d: orders14d,
      menus: menuCount,
      integrationsConnected: integrationCount,
      usageEvents14d: usageCount,
      feedbackSubmitted: feedbackCount > 0,
    };

    if (profile?.onboardingCompleted) score += 15;
    if (menuCount > 0) score += 10;
    if (orders14d > 0) score += 15;
    if (integrationCount > 0) score += 10;
    if (usageCount >= 3) score += 10;
    if (subscription?.stripeSubscriptionId) score += 5;

    if (orders14d === 0 && menuCount > 0) score -= 15;
    if (usageCount === 0) score -= 10;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let status: CustomerHealthLevel = "NEEDS_ATTENTION";
    if (!profile?.onboardingCompleted) status = "NEW_ACCOUNT";
    else if (score >= 72) status = "HEALTHY";
    else if (score < 38) status = "AT_RISK";

    results.set(userId, { score, status, signals });
  }

  return results;
}
