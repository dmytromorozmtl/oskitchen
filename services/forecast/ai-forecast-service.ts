import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

export async function getAIOrderForecast(userId: string, daysAhead = 7) {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: since },
    status: { not: "CANCELLED" },
  });
  const daily = await prisma.order.groupBy({
    by: ["createdAt"],
    where: orderWhere,
    _count: { id: true },
    _sum: { total: true },
  });

  const avgDailyOrders =
    daily.length > 0
      ? daily.reduce((s, d) => s + d._count.id, 0) / Math.min(daily.length, 90)
      : 0;
  const avgDailyRevenue =
    daily.length > 0
      ? daily.reduce((s, d) => s + Number(d._sum.total ?? 0), 0) / Math.min(daily.length, 90)
      : 0;

  const days: Array<{ date: string; predictedOrders: number; predictedRevenue: number }> = [];
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.15 : 1;
    days.push({
      date: d.toISOString().slice(0, 10),
      predictedOrders: Math.round(avgDailyOrders * weekendBoost),
      predictedRevenue: Math.round(avgDailyRevenue * weekendBoost * 100) / 100,
    });
  }

  return {
    days,
    confidence: daily.length >= 14 ? 0.65 : daily.length >= 7 ? 0.4 : 0.2,
    method: "historical_baseline" as const,
    note: "AI model integration scaffold — using 90-day historical average with weekend adjustment.",
  };
}
