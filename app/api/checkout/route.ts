import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/api/with-api-guard";
import { SITE_URL } from "@/lib/constants";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { prisma } from "@/lib/prisma";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

const bodySchema = z.object({
  plan: z.enum(["STARTER", "PRO", "TEAM"]),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    logger.warn("Checkout called without Stripe configuration");
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_*_PRICE_ID variables.",
      },
      { status: 503 },
    );
  }

  const authSession = await requireApiSession();
  if (!authSession.ok) {
    return authSession.response;
  }
  const { userId, email } = authSession.context;

  const ip = getClientIpFromRequest(request);
  const rl = await consumeRateLimitToken(`billing_checkout:${userId}:${ip}`, "billing_checkout");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let priceId: string;
  try {
    priceId = getStripePriceId(parsed.data.plan);
  } catch (e) {
    logger.error("Stripe price resolution failed", e);
    return NextResponse.json(
      {
        error:
          "Stripe price IDs missing. Add NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID, PRO, and TEAM.",
      },
      { status: 500 },
    );
  }

  const existing = await prisma.subscription.findUnique({
    where: { userId },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripeCustomerId ?? undefined,
    customer_email: existing?.stripeCustomerId ? undefined : email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${SITE_URL}/dashboard/billing?success=1`,
    cancel_url: `${SITE_URL}/dashboard/billing?canceled=1`,
    allow_promotion_codes: true,
    metadata: {
      userId,
      plan: parsed.data.plan,
    },
    subscription_data: {
      metadata: {
        userId,
        plan: parsed.data.plan,
      },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
