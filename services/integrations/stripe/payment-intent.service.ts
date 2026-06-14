import type { StripePaymentIntentResult } from "@/lib/integrations/stripe-live-types";
import { getStripe } from "@/lib/stripe";

export async function createStripeLivePaymentIntent(input: {
  amount: number;
  currency?: string;
  orderId?: string;
  userId?: string;
  description?: string;
}): Promise<StripePaymentIntentResult> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      paymentIntentId: null,
      clientSecret: null,
      amountCents: 0,
      currency: input.currency ?? "usd",
      message: "Set STRIPE_SECRET_KEY",
    };
  }

  const currency = (input.currency ?? "usd").toLowerCase();
  const amountCents = Math.max(50, Math.round(input.amount * 100));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      source: "os_kitchen_live",
      ...(input.orderId ? { orderId: input.orderId } : {}),
      ...(input.userId ? { userId: input.userId } : {}),
    },
    description: input.description ?? "OS Kitchen payment",
  });

  return {
    ok: true,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amountCents,
    currency,
    message: `PaymentIntent ${paymentIntent.id} created`,
  };
}
