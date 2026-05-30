import { NextResponse } from "next/server";

import { getWebhookSecret } from "@/lib/integrations/decrypt-connection";
import {
  createWebhookEvent,
  markWebhookProcessed,
} from "@/lib/webhooks/webhook-event-store";
import { isWebhookAsyncQueueEnabled } from "@/lib/webhooks/webhook-queue-mode";
import { executeWooCommerceWebhookBusinessLogic } from "@/lib/webhooks/woocommerce-webhook-processor";
import { prisma } from "@/lib/prisma";
import { enqueueWooCommerceWebhookJob } from "@/services/webhooks/webhook-ingest-service";
import { enforceWebhookIngestRateLimit, rateLimitedJsonResponse } from "@/lib/rate-limit";
import { emitWebhookSignatureInvalid } from "@/services/observability/ops-signals";
import { verifyWebhookSignature } from "@/services/integrations/woocommerce";
import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

export async function handleWooCommerceWebhook(req: Request) {
  const url = new URL(req.url);
  const cid = url.searchParams.get("cid");
  if (!cid?.trim()) {
    return NextResponse.json(
      { error: "Missing connection id (cid query parameter)." },
      { status: 400 },
    );
  }

  const rawBody = await req.text();
  const topic =
    req.headers.get("X-WC-Webhook-Topic") ??
    req.headers.get("x-wc-webhook-topic") ??
    "unknown";
  const deliveryId =
    req.headers.get("X-WC-Webhook-Delivery-Id") ??
    req.headers.get("x-wc-webhook-delivery-id");

  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: cid.trim(),
      provider: IntegrationProvider.WOOCOMMERCE,
      status: { not: IntegrationStatus.DISABLED },
    },
  });

  if (!conn) {
    return NextResponse.json({ error: "Unknown connection" }, { status: 404 });
  }

  const secret = getWebhookSecret(conn);
  const sig =
    req.headers.get("X-WC-Webhook-Signature") ??
    req.headers.get("x-wc-webhook-signature");
  const sigOk = Boolean(
    secret && sig && verifyWebhookSignature(rawBody, sig, secret),
  );

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = { raw: rawBody };
  }

  const { duplicate, id } = await createWebhookEvent({
    userId: conn.userId,
    workspaceId: conn.workspaceId,
    connectionId: conn.id,
    provider: IntegrationProvider.WOOCOMMERCE,
    topic,
    payload,
    signatureValid: sigOk,
    externalEventId: deliveryId,
  });

  if (duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (!sigOk) {
    emitWebhookSignatureInvalid({
      provider: "woocommerce",
      connectionId: conn.id,
      topic,
    });
    await markWebhookProcessed(id, false, "Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const ingestLimit = await enforceWebhookIngestRateLimit({
    provider: "woocommerce",
    connectionId: conn.id,
    topic,
  });
  if (!ingestLimit.ok) {
    return rateLimitedJsonResponse({ error: "Too many requests" }, 429, ingestLimit.headers);
  }

  if (isWebhookAsyncQueueEnabled()) {
    try {
      await enqueueWooCommerceWebhookJob({
        webhookEventId: id,
        userId: conn.userId,
      });
      return NextResponse.json({ ok: true, queued: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await markWebhookProcessed(id, false, msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  try {
    await executeWooCommerceWebhookBusinessLogic({
      userId: conn.userId,
      connectionId: conn.id,
      webhookEventId: id,
      topic,
      payload,
    });

    await markWebhookProcessed(id, true);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await markWebhookProcessed(id, false, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
