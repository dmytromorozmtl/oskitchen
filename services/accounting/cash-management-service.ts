import { prisma } from "@/lib/prisma";
import { cashCountListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";

export async function submitCashCount(
  userId: string,
  countedById: string,
  input: {
    expectedAmount: number;
    countedAmount: number;
    shiftId?: string;
    notes?: string;
  },
) {
  const variance = input.countedAmount - input.expectedAmount;
  return prisma.cashCount.create({
    data: {
      userId,
      countedById,
      expectedAmount: input.expectedAmount,
      countedAmount: input.countedAmount,
      variance,
      shiftId: input.shiftId ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function getCashVarianceHistory(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const scope = await cashCountListWhereForOwner(userId);
  return prisma.cashCount.findMany({
    where: { AND: [scope, { createdAt: { gte: since } }] },
    orderBy: { createdAt: "desc" },
    include: { countedBy: { select: { email: true } } },
    take: 50,
  });
}
