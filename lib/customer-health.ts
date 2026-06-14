export { computeCustomerHealth } from "@/lib/growth/customer-health";

import { prisma } from "@/lib/prisma";

/** Lightweight churn / retention hints for founder dashboards. */
export async function buildRetentionSnapshot(userId: string): Promise<{
  summary: string;
}> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      onboardingCompleted: true,
      trialState: true,
      subscription: { select: { status: true, stripeSubscriptionId: true } },
    },
  });
  if (!profile) return { summary: "Stable" };

  const summaries = await buildRetentionSummariesBatch([
    {
      id: profile.id,
      onboardingCompleted: profile.onboardingCompleted,
      trialState: profile.trialState,
      subscription: profile.subscription,
    },
  ]);
  return summaries.get(profile.id) ?? { summary: "Stable" };
}

type RetentionUserRow = {
  id: string;
  onboardingCompleted: boolean;
  trialState?: { status: string; trialEndsAt: Date } | null;
  subscription?: { status: string; stripeSubscriptionId?: string | null } | null;
};

/** Batch retention summaries for customer success list views. */
export async function buildRetentionSummariesBatch(
  users: RetentionUserRow[],
): Promise<Map<string, { summary: string }>> {
  const userIds = users.map((user) => user.id);
  const results = new Map<string, { summary: string }>();
  if (userIds.length === 0) return results;

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [orders7, usage7, webhookFailures] = await Promise.all([
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.usageEvent.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.webhookEvent.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, processed: false },
      _count: { _all: true },
    }),
  ]);

  const ordersMap = new Map(orders7.map((row) => [row.userId, row._count._all]));
  const usageMap = new Map(usage7.map((row) => [row.userId, row._count._all]));
  const webhookMap = new Map(webhookFailures.map((row) => [row.userId, row._count._all]));

  for (const user of users) {
    const bits: string[] = [];
    if (!user.onboardingCompleted) bits.push("onboarding open");
    if ((ordersMap.get(user.id) ?? 0) === 0) bits.push("no orders (7d)");
    if ((usageMap.get(user.id) ?? 0) === 0) bits.push("no usage events (7d)");
    if ((webhookMap.get(user.id) ?? 0) > 3) bits.push("webhook backlog");

    const trialActive =
      user.trialState?.status === "ACTIVE" && user.trialState.trialEndsAt > new Date();
    if (trialActive && user.trialState) {
      const days = Math.ceil(
        (user.trialState.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      if (days <= 3) bits.push("trial ending");
    }

    const trialExpired =
      user.trialState &&
      (user.trialState.status === "EXPIRED" ||
        (user.trialState.status === "ACTIVE" && user.trialState.trialEndsAt <= new Date()));
    if (trialExpired && !user.subscription?.stripeSubscriptionId) {
      bits.push("trial expired");
    }

    results.set(user.id, { summary: bits.length ? bits.join(" · ") : "Stable" });
  }

  return results;
}
