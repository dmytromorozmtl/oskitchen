import { prisma } from "@/lib/prisma";

export async function summarizePartnerBillingForAccounts(accountIds: string[]) {
  if (accountIds.length === 0) return { managedMrrCents: 0, pendingPayoutCents: 0 };
  const [rev, pending] = await Promise.all([
    prisma.partnerRevenue.aggregate({
      where: { partnerAccountId: { in: accountIds } },
      _sum: { amountCents: true },
    }),
    prisma.partnerRevenue.aggregate({
      where: { partnerAccountId: { in: accountIds }, payoutStatus: "PENDING" },
      _sum: { amountCents: true },
    }),
  ]);
  return {
    managedMrrCents: rev._sum.amountCents ?? 0,
    pendingPayoutCents: pending._sum.amountCents ?? 0,
  };
}
