import { NextResponse } from "next/server";

import {
  IntegrationProvider,
  IntegrationStatus,
} from "@prisma/client";

import { getWebhookSecret } from "@/lib/integrations/decrypt-connection";
import {
  createWebhookEvent,
  markWebhookProcessed,
} from "@/lib/webhooks/webhook-event-store";
import { isWebhookAsyncQueueEnabled } from "@/lib/webhooks/webhook-queue-mode";
import { executeShopifyWebhookBusinessLogic } from "@/lib/webhooks/shopify-webhook-processor";
import { prisma } from "@/lib/prisma";
import { enqueueShopifyWebhookJob } from "@/services/webhooks/webhook-ingest-service";
import { enforceWebhookIngestRateLimit, rateLimitedJsonResponse } from "@/lib/rate-limit";
import { emitWebhookSignatureInvalid } from "@/services/observability/ops-signals";
import { verifyShopifyHmac } from "@/services/integrations/shopify";

export async function handleShopifyWebhook(req: Request, topic: string) {
  const rawBody = await req.text();
  const shop =
    req.headers.get("X-Shopify-Shop-Domain") ??
    req.headers.get("x-shopify-shop-domain");
  const hmac =
    req.headers.get("X-Shopify-Hmac-Sha256") ??
    req.headers.get("x-shopify-hmac-sha256");
  const webhookId =
    req.headers.get("X-Shopify-Webhook-Id") ??
    req.headers.get("x-shopify-webhook-id");

  if (!shop?.trim() || !hmac) {
    return NextResponse.json({ error: "Missing Shopify headers" }, { status: 400 });
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: {
      provider: IntegrationProvider.SHOPIFY,
      shopDomain: shop.trim(),
      status: { not: IntegrationStatus.DISABLED },
    },
  });

  if (!conn) {
    return NextResponse.json({ error: "Shop not connected" }, { status: 404 });
  }

  const secret = getWebhookSecret(conn);
  const sigOk = Boolean(secret && verifyShopifyHmac(rawBody, hmac, secret));

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
    provider: IntegrationProvider.SHOPIFY,
    topic,
    payload,
    signatureValid: sigOk,
    externalEventId: webhookId,
  });

  if (duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (!sigOk) {
    emitWebhookSignatureInvalid({
      provider: "shopify",
      connectionId: conn.id,
      topic,
    });
    await markWebhookProcessed(id, false, "Invalid HMAC");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const ingestLimit = await enforceWebhookIngestRateLimit({
    provider: "shopify",
    connectionId: conn.id,
    topic,
  });
  if (!ingestLimit.ok) {
    return rateLimitedJsonResponse({ error: "Too many requests" }, 429, ingestLimit.headers);
  }

  if (isWebhookAsyncQueueEnabled()) {
    try {
      await enqueueShopifyWebhookJob({
        webhookEventId: id,
        userId: conn.userId,
        workspaceId: conn.workspaceId,
      });
      return NextResponse.json({ ok: true, queued: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await markWebhookProcessed(id, false, msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  try {
    await executeShopifyWebhookBusinessLogic({
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
