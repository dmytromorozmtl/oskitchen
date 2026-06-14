import { prisma } from "@/lib/prisma";

export async function topUsageEvents(take = 15) {
  return prisma.usageEvent.groupBy({
    by: ["eventName"],
    _count: { eventName: true },
    orderBy: { _count: { eventName: "desc" } },
    take,
  });
}

export async function usageEventsLastDays(days: number) {
  const since = new Date(Date.now() - days * 86400000);
  return prisma.usageEvent.count({ where: { createdAt: { gte: since } } });
}
