import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { enforceWebhookIpRateLimit, rateLimitedJsonResponse } from "@/lib/rate-limit";
import {
  handleStripeIntegrationWebhookEvent,
  verifyStripeIntegrationWebhook,
} from "@/services/integrations/stripe/webhook-handler.service";

export async function POST(request: Request) {
  const ipLimit = await enforceWebhookIpRateLimit(request, "stripe-integration");
  if (!ipLimit.ok) {
    return rateLimitedJsonResponse({ error: "Too many requests" }, 429, ipLimit.headers);
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 401 });
  }

  const verified = verifyStripeIntegrationWebhook(body, signature);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  const result = await handleStripeIntegrationWebhookEvent(verified.event);
  return NextResponse.json({ received: true, ...result });
}
