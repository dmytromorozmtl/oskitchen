import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Stripe Terminal — server-side payment intents and capture recording.
 * Reader WebSocket connection lives in the browser via `@stripe/terminal-js`
 * (`hooks/use-stripe-terminal.ts`, `lib/payments/stripe-terminal-client.ts`).
 */
export async function createTerminalConnectionToken(): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  const connectionToken = await stripe.terminal.connectionTokens.create();
  return connectionToken.secret;
}

/**
 * Create a Terminal payment intent for tap-to-pay.
 */
export async function createTerminalPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata?: Record<string, string>,
) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    payment_method_types: ["card_present"],
    capture_method: "automatic",
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Mark a POS transaction paid after Stripe Terminal capture.
 */
export async function processTerminalPayment(
  paymentIntentId: string,
  orderId: string,
  userId: string,
) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });

  if (paymentIntent.status !== "succeeded") {
    throw new Error(`Payment not succeeded: ${paymentIntent.status}`);
  }

  const transaction = await prisma.pOSTransaction.findFirst({
    where: { orderId, userId },
    include: { payments: true },
  });
  if (!transaction) {
    throw new Error("POS transaction not found for order");
  }

  const charge = paymentIntent.latest_charge;
  const cardPresent =
    typeof charge === "object" && charge && "payment_method_details" in charge
      ? charge.payment_method_details?.card_present
      : null;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      },
    });

    await tx.pOSTransaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        externalPaymentReference: paymentIntentId,
      },
    });

    const payment = transaction.payments[0];
    if (payment) {
      await tx.pOSPayment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          provider: "STRIPE",
          providerReference: paymentIntentId,
        },
      });
    } else {
      await tx.pOSPayment.create({
        data: {
          transactionId: transaction.id,
          paymentMode: "CARD_TERMINAL_PLACEHOLDER",
          amount: transaction.total,
          status: "PAID",
          provider: "STRIPE",
          providerReference: paymentIntentId,
        },
      });
    }

    await tx.pOSAuditEvent.create({
      data: {
        userId,
        registerId: transaction.registerId,
        shiftId: transaction.shiftId,
        transactionId: transaction.id,
        staffId: transaction.staffId,
        action: "pos.terminal.payment_captured",
        metadataJson: {
          paymentIntentId,
          cardBrand: cardPresent?.brand ?? null,
          last4: cardPresent?.last4 ?? null,
        },
      },
    });
  });

  return prisma.pOSTransaction.findFirstOrThrow({
    where: { id: transaction.id },
    include: { payments: true },
  });
}

/** Cancel a Terminal payment intent. */
export async function cancelTerminalPayment(paymentIntentId: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  await stripe.paymentIntents.cancel(paymentIntentId);
}

/** Refund a Terminal payment. */
export async function refundTerminalPayment(paymentIntentId: string, amount?: number) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}
