export { computeCustomerHealth } from "@/lib/growth/customer-health";

import { getBillingAccess } from "@/lib/billing/access";
import { prisma } from "@/lib/prisma";

/** Lightweight churn / retention hints for founder dashboards. */
export async function buildRetentionSnapshot(userId: string): Promise<{
  summary: string;
}> {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [profile, orders7, usage7, failures, billing] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.order.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.usageEvent.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.webhookEvent.count({
      where: {
        userId,
        processed: false,
      },
    }),
    getBillingAccess(userId),
  ]);

  const bits: string[] = [];
  if (!profile?.onboardingCompleted) bits.push("onboarding open");
  if (orders7 === 0) bits.push("no orders (7d)");
  if (usage7 === 0) bits.push("no usage events (7d)");
  if (failures > 3) bits.push("webhook backlog");
  if (billing.inLocalTrial && (billing.trialDaysRemaining ?? 0) <= 3) {
    bits.push("trial ending");
  }
  if (billing.trialExpiredNoPayment) bits.push("trial expired");

  return {
    summary: bits.length ? bits.join(" · ") : "Stable",
  };
}
