import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api/with-api-guard";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { recordBillingEvent } from "@/services/billing/billing-service";

export async function POST() {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY.", code: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const session = await requireApiSession();
  if (!session.ok) {
    return session.response;
  }
  const { userId } = session.context;

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
