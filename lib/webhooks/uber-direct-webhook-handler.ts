import { NextResponse } from "next/server";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  extractUberDirectExternalEventId,
  recordWebhookIngressOrDuplicate,
  WEBHOOK_INGRESS_ROUTE_KEYS,
} from "@/lib/webhooks/webhook-ingress-replay-guard";
import { getUberDirectWebhookPlaceholderMessage } from "@/services/delivery/uber-direct";

/**
 * Uber Direct status callbacks — placeholder with bearer auth + ingress dedupe.
 */
export async function handleUberDirectWebhook(request: Request): Promise<NextResponse> {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.UBER_DIRECT_WEBHOOK_SECRET,
    missingMessage: "Webhook not configured",
  });
  if (authError) {
    return authError;
  }

  const rawBody = await request.text();
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const externalEventId = extractUberDirectExternalEventId(payload, rawBody);
  const replay = await recordWebhookIngressOrDuplicate({
    routeKey: WEBHOOK_INGRESS_ROUTE_KEYS.UBER_DIRECT,
    externalEventId,
  });
  if (replay.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  logger.warn("uber_direct_webhook_placeholder", {
    payloadType: payload && typeof payload === "object" ? "object" : typeof payload,
    eventId: externalEventId,
  });

  return NextResponse.json(
    {
      error: getUberDirectWebhookPlaceholderMessage(),
      code: "uber_direct_placeholder",
    },
    { status: 503 },
  );
}
