import { prisma } from "@/lib/prisma";
import {
  bankTransactionByIdWhereForOwner,
  bankTransactionListWhereForOwner,
} from "@/lib/scope/workspace-accounting-scope";

export async function importBankTransactions(
  userId: string,
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    type: string;
    category?: string;
  }>,
) {
  return prisma.bankTransaction.createMany({
    data: transactions.map((t) => ({
      userId,
      date: new Date(t.date),
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category ?? null,
    })),
  });
}

export async function getUnreconciledTransactions(userId: string) {
  const scope = await bankTransactionListWhereForOwner(userId);
  return prisma.bankTransaction.findMany({
    where: { AND: [scope, { reconciled: false }] },
    orderBy: { date: "desc" },
    take: 100,
  });
}

export async function reconcileTransaction(
  txId: string,
  userId: string,
  matchType: "order" | "invoice",
  matchId: string,
) {
  const where = await bankTransactionByIdWhereForOwner(userId, txId);
  const existing = await prisma.bankTransaction.findFirst({ where, select: { id: true } });
  if (!existing) throw new Error("Transaction not found");

  return prisma.bankTransaction.update({
    where: { id: existing.id },
    data: {
      reconciled: true,
      matchedOrderId: matchType === "order" ? matchId : null,
      matchedInvoiceId: matchType === "invoice" ? matchId : null,
    },
  });
}

export async function getReconciliationSummary(userId: string) {
  const scope = await bankTransactionListWhereForOwner(userId);
  const [unreconciled, totalDeposits, totalWithdrawals] = await Promise.all([
    prisma.bankTransaction.count({ where: { AND: [scope, { reconciled: false }] } }),
    prisma.bankTransaction.aggregate({
      where: { AND: [scope, { type: "DEPOSIT", reconciled: true }] },
      _sum: { amount: true },
    }),
    prisma.bankTransaction.aggregate({
      where: { AND: [scope, { type: "WITHDRAWAL", reconciled: true }] },
      _sum: { amount: true },
    }),
  ]);

  const deposits = Number(totalDeposits._sum.amount ?? 0);
  const withdrawals = Number(totalWithdrawals._sum.amount ?? 0);

  return {
    unreconciledCount: unreconciled,
    totalReconciledDeposits: deposits,
    totalReconciledWithdrawals: withdrawals,
    netCashFlow: deposits - withdrawals,
  };
}
