import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { markTrialConverted } from "@/lib/billing/access";
import { getStripeClient } from "@/lib/billing/stripe-client";
import { enforceWebhookIpRateLimit, rateLimitedJsonResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { recordBillingEvent } from "@/services/billing/billing-service";
import {
  applyStripeCheckoutCompleted,
  applyStripeInvoice,
  applyStripeSubscription,
} from "@/services/billing/subscription-service";
import { applyStorefrontOrderCheckoutCompleted } from "@/services/storefront/storefront-stripe-checkout-service";
import { auditLog } from "@/services/audit/audit-service";

async function resolveUserIdFromStripeEvent(event: Stripe.Event): Promise<string | null> {
  const meta = (event.data.object as { metadata?: { userId?: string } })?.metadata;
  if (meta?.userId) return meta.userId;
  if (event.type.startsWith("invoice.")) {
    const inv = event.data.object as Stripe.Invoice;
    const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id ?? null;
    if (!customerId) return null;
    const row = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      select: { userId: true },
    });
    return row?.userId ?? null;
  }
  if (event.type === "customer.updated") {
    const c = event.data.object as Stripe.Customer;
    const row = await prisma.subscription.findFirst({
      where: { stripeCustomerId: c.id },
      select: { userId: true },
    });
    return row?.userId ?? null;
  }
  if (event.type.startsWith("customer.subscription")) {
    const sub = event.data.object as Stripe.Subscription;
    return (sub.metadata?.userId as string | undefined) ?? null;
  }
  return null;
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    logger.error("Stripe webhook received but STRIPE_SECRET_KEY is missing");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    logger.error("Stripe webhook received but STRIPE_WEBHOOK_SECRET is missing");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const ipLimit = await enforceWebhookIpRateLimit(request, "stripe");
  if (!ipLimit.ok) {
    return rateLimitedJsonResponse({ error: "Too many requests" }, 429, ipLimit.headers);
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Idempotency guard — recorded events short-circuit duplicates.
  const dupe = await prisma.billingEvent.findUnique({ where: { stripeEventId: event.id } });
  if (dupe) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.purpose === "storefront_order" && session.metadata?.storefrontOrderId) {
          await applyStorefrontOrderCheckoutCompleted(session, { stripeEventId: event.id });
          break;
        }
        if (session.metadata?.purpose === "b2b_invoice" && session.metadata?.orderId) {
          const { applyB2bPayPortalCheckoutCompleted } = await import(
            "@/services/integrations/shopify-b2b-invoice-pay-portal-service"
          );
          await applyB2bPayPortalCheckoutCompleted(session, { stripeEventId: event.id });
          break;
        }
        if (session.metadata?.purpose === "b2b_invoice_batch" && session.metadata?.batchId) {
          const { applyB2bConsolidatedPayCheckoutCompleted } = await import(
            "@/services/integrations/shopify-b2b-consolidated-pay-service"
          );
          await applyB2bConsolidatedPayCheckoutCompleted(session, { stripeEventId: event.id });
          break;
        }
        await applyStripeCheckoutCompleted(session, { stripeEventId: event.id });
        const userId = session.metadata?.userId as string | undefined;
        if (userId) void markTrialConverted(userId);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { userId } = await applyStripeSubscription(subscription, { stripeEventId: event.id });
        if (userId && (subscription.status === "active" || subscription.status === "trialing")) {
          void markTrialConverted(userId);
        }
        break;
      }
      case "invoice.created":
      case "invoice.finalized":
      case "invoice.paid":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await applyStripeInvoice(invoice, { stripeEventId: event.id });
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        if (subId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            await applyStripeSubscription(sub);
          } catch (e) {
            logger.warn(`[billing] could not refresh subscription ${subId}: ${e instanceof Error ? e.message : "unknown"}`);
          }
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (account.id) {
          const { refreshStorefrontConnectAccountFromStripe } = await import(
            "@/services/storefront/storefront-stripe-connect-service"
          );
          await refreshStorefrontConnectAccountFromStripe(account.id);

          const { refreshPartnerConnectAccountFromStripe } = await import(
            "@/services/platform/partner-stripe-connect-service"
          );
          await refreshPartnerConnectAccountFromStripe(account.id);

          const { handleAccountUpdate } = await import(
            "@/services/marketplace/stripe-connect-service"
          );
          await handleAccountUpdate(account.id);
        }
        break;
      }
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata?.marketplaceOrderId) {
          const { handleMarketplaceStripeWebhookEvent } = await import(
            "@/services/marketplace/stripe-connect-service"
          );
          await handleMarketplaceStripeWebhookEvent(event);
        }
        break;
      }
      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customer.id },
          select: { userId: true },
        });
        if (sub) {
          await recordBillingEvent({
            userId: sub.userId,
            eventType: "STRIPE_CUSTOMER_UPDATED",
            source: "stripe",
            stripeEventId: event.id,
            summary: customer.email ?? customer.id,
          });
        }
        break;
      }
      default: {
        // Record unknown but verified events so we can audit (only when we can resolve a workspace).
        const userId = (event.data.object as { metadata?: { userId?: string } })?.metadata?.userId;
        if (userId) {
          await recordBillingEvent({
            userId,
            eventType: `STRIPE_${event.type.toUpperCase().replaceAll(".", "_")}`,
            source: "stripe",
            stripeEventId: event.id,
            summary: event.type,
          });
        }
        break;
      }
    }
  } catch (error) {
    logger.error("Stripe webhook handler error", error);
    return NextResponse.json({ received: true, error: true }, { status: 500 });
  }

  const auditUserId = await resolveUserIdFromStripeEvent(event);
  if (auditUserId) {
    void auditLog({
      actor: { userId: auditUserId },
      action: "STRIPE_WEBHOOK_RECEIVED",
      category: "BILLING",
      source: "BILLING_PROVIDER",
      severity: "INFO",
      entity: { type: "StripeEvent", id: event.id, label: event.type },
      metadata: { eventType: event.type },
    });
  }

  return NextResponse.json({ received: true });
}
