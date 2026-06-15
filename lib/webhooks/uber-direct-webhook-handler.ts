import { NextResponse } from "next/server";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  extractUberDirectExternalEventId,
  recordWebhookIngressOrDuplicate,
  WEBHOOK_INGRESS_ROUTE_KEYS,
} from "@/lib/webhooks/webhook-ingress-replay-guard";
import {
  applyUberDirectWebhookStatus,
  getUberDirectCapabilitySnapshot,
} from "@/services/delivery/uber-direct";

/**
 * Uber Direct status callbacks — bearer auth + ingress dedupe + dispatch status update.
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

  const snapshot = getUberDirectCapabilitySnapshot();
  if (!snapshot.liveWebhookReady) {
    logger.warn("uber_direct_webhook_not_configured", { eventId: externalEventId });
    return NextResponse.json(
      {
        error: "Uber Direct webhook handler requires BETA credentials",
        code: "uber_direct_not_configured",
      },
      { status: 503 },
    );
  }

  const result = await applyUberDirectWebhookStatus(payload);
  logger.info("uber_direct_webhook_processed", {
    eventId: externalEventId,
    updated: result.updated,
    dispatchId: result.dispatchId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    updated: result.updated,
    dispatchId: result.dispatchId,
    message: result.message,
  });
}
