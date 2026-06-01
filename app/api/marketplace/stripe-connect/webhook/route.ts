import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/billing/stripe-client";
import { marketplaceStripeWebhookSecret } from "@/lib/marketplace/stripe-connect-config";
import { enforceWebhookIpRateLimit, rateLimitedJsonResponse } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { handleMarketplaceStripeWebhookEvent } from "@/services/marketplace/stripe-connect-service";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const webhookSecret = marketplaceStripeWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json({ error: "Marketplace webhook not configured" }, { status: 503 });
  }

  const ipLimit = await enforceWebhookIpRateLimit(request, "marketplace-stripe");
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await handleMarketplaceStripeWebhookEvent(event);
  } catch (error) {
    logger.error("[marketplace-connect] webhook handler error", error);
    return NextResponse.json({ received: true, error: true }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
