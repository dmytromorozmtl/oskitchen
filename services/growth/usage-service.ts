import { prisma } from "@/lib/prisma";

export async function countDistinctUsersLastDays(days: number) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await prisma.usageEvent.findMany({
    where: { createdAt: { gte: since } },
    distinct: ["userId"],
    select: { userId: true },
  });
  return rows.length;
}

export async function activationMilestoneCounts() {
  const [total, completed, firstOrder] = await Promise.all([
    prisma.activationState.count(),
    prisma.activationState.count({ where: { onboardingCompleted: true } }),
    prisma.activationState.count({ where: { firstOrderCreated: true } }),
  ]);
  return { workspacesWithState: total, onboardingCompleted: completed, firstOrderCreated: firstOrder };
}
