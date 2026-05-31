import { NextResponse } from "next/server";

import { getWebhookSecret } from "@/lib/integrations/decrypt-connection";
import { createWebhookEvent, markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { prisma } from "@/lib/prisma";
import { verifyDoorDashWebhookSignature } from "@/services/integrations/doordash/doordash-marketplace";
import { processDoorDashInboundOrder } from "@/services/integrations/doordash/inbound-order.service";
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
    request.headers.get("x-doordash-signature") ??
    request.headers.get("X-DoorDash-Signature") ??
    request.headers.get("doordash-signature") ??
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
      provider: IntegrationProvider.DOORDASH,
      status: { not: IntegrationStatus.DISABLED },
    },
  });

  if (!conn) {
    return NextResponse.json({ error: "Unknown connection" }, { status: 404 });
  }

  const perConnectionSecret = getWebhookSecret(conn);
  const envSecret = process.env.DOORDASH_WEBHOOK_SECRET?.trim() ?? "";
  const secret = perConnectionSecret?.trim() || envSecret;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured for this connection." },
      { status: 500 },
    );
  }

  const sigOk = Boolean(signature && verifyDoorDashWebhookSignature(rawBody, signature, secret));

  const eventKey =
    (payload.event_id as string | undefined) ??
    (payload.id as string | undefined) ??
    (payload.order as { id?: string } | undefined)?.id ??
    null;

  const { duplicate, id } = await createWebhookEvent({
    userId: conn.userId,
    workspaceId: conn.workspaceId,
    connectionId: conn.id,
    provider: IntegrationProvider.DOORDASH,
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
      provider: "doordash",
      connectionId: conn.id,
      topic: "orders",
    });
    await markWebhookProcessed(id, false, "Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = await processDoorDashInboundOrder({
    userId: conn.userId,
    workspaceId: conn.workspaceId,
    connectionId: conn.id,
    externalEventId: eventKey ?? `doordash-${Date.now()}`,
    payload,
    webhookEventId: id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message ?? "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    duplicate: result.duplicate,
    externalOrderId: result.externalOrderId,
  });
}
