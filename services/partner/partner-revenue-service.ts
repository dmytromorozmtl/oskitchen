import { prisma } from "@/lib/prisma";

export async function aggregatePartnerRevenueByType(accountIds: string[]) {
  if (accountIds.length === 0) return [];
  const rows = await prisma.partnerRevenue.groupBy({
    by: ["revenueType"],
    where: { partnerAccountId: { in: accountIds } },
    _sum: { amountCents: true },
    _count: { _all: true },
  });
  return rows.map((r) => ({
    type: r.revenueType,
    amountCents: r._sum.amountCents ?? 0,
    count: r._count._all,
  }));
}
