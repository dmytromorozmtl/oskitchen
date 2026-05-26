import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export type StripeRefundAttempt =
  | { ok: true; stripeRefundId: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string };

/**
 * Attempt Stripe refund when POS transaction has a payment intent / charge reference.
 * Skips gracefully when Stripe is not configured or reference is missing.
 */
export async function attemptStripePosRefund(params: {
  externalPaymentReference: string | null | undefined;
  amountCents?: number;
  /** Stable idempotency key for Stripe (e.g. pos refund transaction id). */
  idempotencyKey?: string;
}): Promise<StripeRefundAttempt> {
  const ref = params.externalPaymentReference?.trim();
  if (!ref) {
    return { ok: false, skipped: true, reason: "NO_PAYMENT_REFERENCE" };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, skipped: true, reason: "STRIPE_NOT_CONFIGURED" };
  }

  const stripeOpts = params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined;

  try {
    const amount = params.amountCents;
    if (ref.startsWith("pi_")) {
      const refund = await stripe.refunds.create(
        {
          payment_intent: ref,
          ...(amount != null ? { amount } : {}),
        },
        stripeOpts,
      );
      return { ok: true, stripeRefundId: refund.id };
    }
    if (ref.startsWith("ch_")) {
      const refund = await stripe.refunds.create(
        {
          charge: ref,
          ...(amount != null ? { amount } : {}),
        },
        stripeOpts,
      );
      return { ok: true, stripeRefundId: refund.id };
    }
    return { ok: false, skipped: true, reason: "UNSUPPORTED_REFERENCE_FORMAT" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe refund failed";
    logger.warn("pos_stripe_refund_failed", { ref, msg });
    return { ok: false, error: msg };
  }
}
