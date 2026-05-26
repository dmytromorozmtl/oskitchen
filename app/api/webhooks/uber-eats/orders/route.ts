import { NextResponse } from "next/server";

import { getWebhookSecret } from "@/lib/integrations/decrypt-connection";
import { createWebhookEvent, markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { prisma } from "@/lib/prisma";
import { verifyUberEatsWebhookSignature } from "@/services/integrations/uber-eats";
import { processUberEatsInboundOrder } from "@/services/integrations/uber-eats/inbound-order.service";
import { emitWebhookSignatureInvalid } from "@/services/observability/ops-signals";
import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const cid = url.searchParams.get("cid");
  if (!cid?.trim()) {
    return NextResponse.json({ error: "Missing cid" }, { status: 400 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-uber-eats-signature") ??
    request.headers.get("X-Uber-Eats-Signature") ??
    request.headers.get("x-uber-signature") ??
    "";

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: cid.trim(),
      provider: IntegrationProvider.UBER_EATS,
      status: { not: IntegrationStatus.DISABLED },
    },
  });

  if (!conn) {
    return NextResponse.json({ error: "Unknown connection" }, { status: 404 });
  }

  const perConnectionSecret = getWebhookSecret(conn);
  const envSecret = process.env.UBER_EATS_WEBHOOK_SECRET?.trim() ?? "";
  const secret = perConnectionSecret?.trim() || envSecret;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured for this connection." },
      { status: 500 },
    );
  }

  const sigOk = Boolean(signature && verifyUberEatsWebhookSignature(rawBody, signature, secret));

  const eventKey =
    (payload.event_id as string | undefined) ??
    (payload.id as string | undefined) ??
    null;

  const { duplicate, id } = await createWebhookEvent({
    userId: conn.userId,
    workspaceId: conn.workspaceId,
    connectionId: conn.id,
    provider: IntegrationProvider.UBER_EATS,
    topic: "orders",
    payload,
    signatureValid: sigOk,
    externalEventId: eventKey,
  });

  if (duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (!sigOk) {
    emitWebhookSignatureInvalid({
      provider: "uber_eats",
      connectionId: conn.id,
      topic: "orders",
    });
    await markWebhookProcessed(id, false, "Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = await processUberEatsInboundOrder({
    userId: conn.userId,
    workspaceId: conn.workspaceId,
    connectionId: conn.id,
    externalEventId: eventKey ?? `uber-${Date.now()}`,
    payload,
    webhookEventId: id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message ?? "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, duplicate: result.duplicate, externalOrderId: result.externalOrderId });
}
