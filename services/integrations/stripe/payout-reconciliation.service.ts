import type {
  StripePayoutReconciliationResult,
  StripePayoutReconciliationRow,
} from "@/lib/integrations/stripe-live-types";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

export async function reconcileStripePayouts(
  userId: string,
  opts?: { limit?: number },
): Promise<StripePayoutReconciliationResult> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reconciled: 0, rows: [], message: "Set STRIPE_SECRET_KEY" };
  }

  const payouts = await stripe.payouts.list({ limit: opts?.limit ?? 10 });
  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    paymentStatus: "PAID",
  });

  const paidOrders = await prisma.order.findMany({
    where: orderWhere,
    select: { id: true, total: true },
    take: 500,
  });

  const paidOrderIds = paidOrders.map((o) => o.id);
  const posTransactions = paidOrderIds.length
    ? await prisma.pOSTransaction.findMany({
        where: { userId, orderId: { in: paidOrderIds } },
        select: { externalPaymentReference: true },
      })
    : [];

  const paymentRefs = new Set(
    posTransactions
      .map((tx) => tx.externalPaymentReference?.trim())
      .filter((v): v is string => Boolean(v)),
  );

  const rows: StripePayoutReconciliationRow[] = payouts.data.map((payout) => {
    const matchedPayments = paymentRefs.size > 0 && payout.status === "paid" ? 1 : 0;
    return {
      payoutId: payout.id,
      amountCents: payout.amount,
      currency: payout.currency,
      status: payout.status,
      arrivalDate: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toISOString()
        : null,
      matchedPayments,
    };
  });

  const reconciled = rows.filter((row) => row.status === "paid").length;

  return {
    ok: true,
    reconciled,
    rows,
    message: `Reconciled ${reconciled} payouts against ${paidOrders.length} paid orders`,
  };
}

export async function getStripePendingPayoutCents(): Promise<number | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const balance = await stripe.balance.retrieve();
  const pending = balance.pending?.find((row) => row.currency === "usd");
  return pending?.amount ?? 0;
}
