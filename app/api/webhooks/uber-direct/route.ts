import { NextResponse } from "next/server";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { getUberDirectWebhookPlaceholderMessage } from "@/services/delivery/uber-direct";

/**
 * Uber Direct status callbacks land here once credentials and signing are configured.
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.UBER_DIRECT_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  logger.warn("uber_direct_webhook_placeholder", {
    payloadType: payload && typeof payload === "object" ? "object" : typeof payload,
    eventId:
      payload && typeof payload === "object" && "event_id" in payload
        ? (payload as { event_id?: unknown }).event_id
        : null,
  });

  return NextResponse.json({
    error: getUberDirectWebhookPlaceholderMessage(),
    code: "uber_direct_placeholder",
  }, { status: 503 });
}
