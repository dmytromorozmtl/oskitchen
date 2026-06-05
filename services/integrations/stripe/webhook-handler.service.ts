import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { updateStripeLiveSettings } from "@/services/integrations/stripe/stripe-live-service";

export function verifyStripeIntegrationWebhook(
  body: string,
  signature: string,
): { ok: true; event: Stripe.Event } | { ok: false; error: string } {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return { ok: false, error: "Stripe webhook not configured" };
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return { ok: true, event };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid signature" };
  }
}

export async function handleStripeIntegrationWebhookEvent(
  event: Stripe.Event,
): Promise<{ handled: boolean; message: string }> {
  const userId = (event.data.object as { metadata?: { userId?: string } }).metadata?.userId;

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      if (intent.metadata?.source !== "os_kitchen_live") {
        return { handled: false, message: "Not an OS Kitchen LIVE payment intent." };
      }

      const orderId = intent.metadata?.orderId;
      if (orderId && userId) {
        await prisma.order.updateMany({
          where: { id: orderId, userId },
          data: { paymentStatus: "PAID" },
        });
        await prisma.pOSTransaction.updateMany({
          where: { orderId, userId },
          data: {
            paymentStatus: "PAID",
            externalPaymentReference: intent.id,
          },
        });
      }

      if (userId) {
        await updateStripeLiveSettings(userId, {
          lastWebhookAt: new Date().toISOString(),
          lastWebhookType: event.type,
          lastPaymentIntentAt: new Date().toISOString(),
          lastPaymentIntentId: intent.id,
        });
      }

      return { handled: true, message: `PaymentIntent ${intent.id} recorded.` };
    }
    case "payout.paid":
    case "payout.failed": {
      if (userId) {
        await updateStripeLiveSettings(userId, {
          lastWebhookAt: new Date().toISOString(),
          lastWebhookType: event.type,
        });
      }
      return { handled: true, message: `Payout event ${event.type} recorded.` };
    }
    default:
      return { handled: false, message: `Unhandled event type ${event.type}` };
  }
}
