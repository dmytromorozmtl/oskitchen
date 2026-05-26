import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/api/with-api-guard";
import { SITE_URL } from "@/lib/constants";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { isStripeCheckoutReady } from "@/lib/billing/stripe-config";
import { getStripeClient, resolveCheckoutPrice, safeStripeError } from "@/lib/billing/stripe-client";
import { recordBillingEvent } from "@/services/billing/billing-service";

const bodySchema = z.object({
  plan: z.enum(["STARTER", "PRO", "TEAM"]),
});

export async function POST(request: Request) {
  if (!isStripeCheckoutReady()) {
    return NextResponse.json(
      {
        error: "Stripe checkout is not configured. Set STRIPE_SECRET_KEY, price_… IDs, and NEXT_PUBLIC_APP_URL.",
        code: "stripe_not_configured",
      },
      { status: 503 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is invalid or missing.", code: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const authSession = await requireApiSession();
  if (!authSession.ok) {
    return authSession.response;
  }
  const { userId, email } = authSession.context;

  const ip = getClientIpFromRequest(request);
  const rl = await consumeRateLimitToken(
    `billing_checkout:${userId}:${ip}`,
    "billing_checkout",
  );
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const resolved = await resolveCheckoutPrice(parsed.data.plan);
  if (!resolved.ok) {
    return NextResponse.json(
      { error: `Plan ${parsed.data.plan} is not checkoutable yet.`, code: resolved.reason },
      { status: 400 },
    );
  }

  const existing = await prisma.subscription.findUnique({ where: { userId } });

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existing?.stripeCustomerId ?? undefined,
      customer_email: existing?.stripeCustomerId ? undefined : email ?? undefined,
      line_items: [{ price: resolved.priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard/billing/success?plan=${parsed.data.plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/dashboard/billing/cancelled?plan=${parsed.data.plan}`,
      allow_promotion_codes: true,
      metadata: {
        userId,
        plan: parsed.data.plan,
      },
      subscription_data: {
        metadata: { userId, plan: parsed.data.plan },
      },
    });
    await recordBillingEvent({
      userId,
      eventType: "CHECKOUT_SESSION_CREATED",
      source: "user",
      summary: `Plan ${parsed.data.plan}`,
      metadata: { sessionId: checkoutSession.id, priceId: resolved.priceId },
    });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    logger.error("[billing] checkout failed", e);
    return NextResponse.json({ error: safeStripeError(e) }, { status: 500 });
  }
}
