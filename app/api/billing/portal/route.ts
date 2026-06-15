import { NextResponse } from "next/server";

import { enforceBillingApiRateLimit } from "@/lib/billing/billing-api-rate-limit";
import { requireBillingApiAccess } from "@/lib/billing/require-billing-api-access";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { recordBillingEvent } from "@/services/billing/billing-service";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY.", code: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const billingAccess = await requireBillingApiAccess("billing.portal.open");
  if (!billingAccess.ok) {
    return billingAccess.response;
  }
  const { userId } = billingAccess;

  const rateError = await enforceBillingApiRateLimit(request, userId, "billing_portal");
  if (rateError) return rateError;

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      {
        error: "No Stripe customer on file yet. Run through checkout once to create a subscription.",
        code: "no_customer",
      },
      { status: 400 },
    );
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${SITE_URL}/dashboard/billing`,
    });
    await recordBillingEvent({
      userId,
      eventType: "PORTAL_SESSION_CREATED",
      source: "user",
      summary: "Customer portal opened",
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    logger.error("[billing] portal failed", e);
    return NextResponse.json({ error: safeStripeError(e) }, { status: 500 });
  }
}
