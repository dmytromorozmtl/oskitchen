import { NextResponse } from "next/server";

import { enforceBillingApiRateLimit } from "@/lib/billing/billing-api-rate-limit";
import { requireBillingApiAccess } from "@/lib/billing/require-billing-api-access";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY to enable the billing portal.",
      },
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

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      {
        error:
          "No Stripe customer on file yet. Run through checkout once to create a subscription.",
      },
      { status: 400 },
    );
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${SITE_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    logger.error("Billing portal session failed", e);
    return NextResponse.json(
      { error: "Unable to open billing portal." },
      { status: 500 },
    );
  }
}
