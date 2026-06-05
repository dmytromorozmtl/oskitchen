import { NextResponse } from "next/server";

import { getWebhookSecret } from "@/lib/integrations/decrypt-connection";
import { createWebhookEvent, markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { prisma } from "@/lib/prisma";
import { processResyReservationWebhook } from "@/services/integrations/resy/reservation-webhook.service";
import { verifyResyWebhookSignature } from "@/services/integrations/resy/resy-live-service";
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
    request.headers.get("x-resy-signature") ??
    request.headers.get("X-Resy-Signature") ??
    request.headers.get("x-signature") ??
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
      provider: IntegrationProvider.RESY,
      status: { not: IntegrationStatus.DISABLED },
    },
  });

  if (!conn) {
    return NextResponse.json({ error: "Unknown connection" }, { status: 404 });
  }

  const perConnectionSecret = getWebhookSecret(conn);
  const envSecret = process.env.RESY_WEBHOOK_SECRET?.trim() ?? "";
  const secret = perConnectionSecret?.trim() || envSecret;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured for this connection." },
      { status: 500 },
    );
  }

  const sigOk = Boolean(signature && verifyResyWebhookSignature(rawBody, signature, secret));

  const eventKey =
    (payload.event_id as string | undefined) ??
    (payload.id as string | undefined) ??
    null;

  const topic =
    (payload.event as string | undefined) ??
    (payload.event_type as string | undefined) ??
    "reservations";

  const { duplicate, id } = await createWebhookEvent({
    userId: conn.userId,
    workspaceId: conn.workspaceId,
    connectionId: conn.id,
    provider: IntegrationProvider.RESY,
    topic,
    payload,
    signatureValid: sigOk,
    externalEventId: eventKey,
  });

  if (duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (!sigOk) {
    emitWebhookSignatureInvalid({
      provider: "resy",
      connectionId: conn.id,
      webhookEventId: id,
    });
    await markWebhookProcessed(id, { error: "Invalid signature" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = await processResyReservationWebhook({
    connectionId: conn.id,
    userId: conn.userId,
    payload,
  });

  await markWebhookProcessed(id, { error: result.ok ? null : result.message });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
