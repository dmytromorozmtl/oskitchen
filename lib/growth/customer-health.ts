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
