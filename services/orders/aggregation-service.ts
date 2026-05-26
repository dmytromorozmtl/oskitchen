import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

export async function getAggregatedOrders(userId: string) {
  const since = new Date(Date.now() - 86_400_000);

  const orders = await prisma.order.findMany({
    where: await orderListWhereForOwnerAnd(userId, { createdAt: { gte: since } }),
    select: {
      id: true,
      creationSource: true,
      status: true,
      total: true,
      customerName: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const byChannel: Record<string, { count: number; total: number }> = {};
  for (const o of orders) {
    const ch = o.creationSource ?? "MANUAL";
    if (!byChannel[ch]) byChannel[ch] = { count: 0, total: 0 };
    byChannel[ch].count++;
    byChannel[ch].total += Number(o.total);
  }

  return {
    orders: orders.map((o) => ({
      ...o,
      total: Number(o.total),
    })),
    byChannel,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
  };
}
