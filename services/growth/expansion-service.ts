import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

import { scoreExpansionHeuristic } from "@/lib/growth/growth-scoring";

export type ExpansionRow = {
  userId: string;
  email: string;
  fullName: string;
  composite: number;
};

export async function sampleExpansionAccounts(take = 12): Promise<ExpansionRow[]> {
  const since30 = new Date(Date.now() - 30 * 86400000);
  const since60 = new Date(Date.now() - 60 * 86400000);
  const users = await prisma.userProfile.findMany({
    where: { subscription: { is: { status: "ACTIVE" } } },
    take: 60,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, staffMembers: true, integrationConnections: true } },
    },
  });

  const scored: ExpansionRow[] = [];
  for (const u of users) {
    const [o30Where, o60Where] = await Promise.all([
      orderListWhereForOwnerAnd(u.id, { createdAt: { gte: since30 } }),
      orderListWhereForOwnerAnd(u.id, { createdAt: { gte: since60, lt: since30 } }),
    ]);
    const [o30, o60] = await Promise.all([
      prisma.order.count({ where: o30Where }),
      prisma.order.count({ where: o60Where }),
    ]);
    const { composite } = scoreExpansionHeuristic({
      ordersLast30: o30,
      ordersPrev30: Math.max(0, o60),
      staffCount: u._count.staffMembers,
      integrationConnectedCount: u._count.integrationConnections,
    });
    if (composite >= 55) {
      scored.push({ userId: u.id, email: u.email, fullName: u.fullName, composite });
    }
  }
  return scored.sort((a, b) => b.composite - a.composite).slice(0, take);
}
