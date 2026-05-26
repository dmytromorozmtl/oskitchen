import { prisma } from "@/lib/prisma";

export async function platformBillingOverview() {
  const [activePaid, activeTrials, failedPayments] = await Promise.all([
    prisma.subscription.count({ where: { status: "ACTIVE", stripeSubscriptionId: { not: null } } }).catch(() => 0),
    prisma.trialState.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.subscription.count({ where: { status: "PAST_DUE" } }).catch(() => 0),
  ]);
  return { activePaid, activeTrials, failedPayments };
}
