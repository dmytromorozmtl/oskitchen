import { NextResponse } from "next/server";

import {
  requireConfiguredWebhookSecret,
  verifyResendWebhookSignature,
} from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ResendWebhookPayload = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    id?: string;
    to?: string | string[];
    subject?: string;
    reason?: string;
    [k: string]: unknown;
  };
};

function mapEventToStatus(eventType: string): "DELIVERED" | "FAILED" | "OPENED" | "CLICKED" | null {
  switch (eventType) {
    case "email.delivered":
    case "delivered":
      return "DELIVERED";
    case "email.bounced":
    case "bounced":
    case "email.complained":
    case "complained":
    case "email.failed":
    case "failed":
      return "FAILED";
    case "email.opened":
    case "opened":
      return "OPENED";
    case "email.clicked":
    case "clicked":
      return "CLICKED";
    case "email.delivery_delayed":
    case "delivery_delayed":
      return null; // record event but keep status
    default:
      return null;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const configured = requireConfiguredWebhookSecret(process.env.RESEND_WEBHOOK_SECRET, {
    missingMessage: "Webhook not configured",
  });
  if (!configured.ok) {
    logger.warn("RESEND_WEBHOOK_SECRET missing — rejecting webhook.");
    return configured.response;
  }

  const signatureHeader =
    req.headers.get("svix-signature") ??
    req.headers.get("resend-signature") ??
    req.headers.get("x-resend-signature");
  if (!verifyResendWebhookSignature(rawBody, signatureHeader, configured.secret)) {
    return NextResponse.json({ ok: false, reason: "invalid_signature" }, { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const eventType = payload.type;
  const providerMessageId = payload.data?.email_id ?? payload.data?.id ?? null;
  const providerEventId = (payload.data as { event_id?: string } | undefined)?.event_id ?? null;

  // Idempotency
  if (providerEventId) {
    const dup = await prisma.notificationEvent.findUnique({ where: { providerEventId } }).catch(() => null);
    if (dup) return NextResponse.json({ ok: true, duplicate: true });
  }

  const log = providerMessageId
    ? await prisma.notificationLog.findFirst({ where: { providerMessageId } }).catch(() => null)
    : null;

  if (log) {
    const newStatus = mapEventToStatus(eventType);
    if (newStatus) {
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: newStatus,
          deliveredAt: newStatus === "DELIVERED" ? new Date() : undefined,
          failedAt: newStatus === "FAILED" ? new Date() : undefined,
          errorMessage:
            newStatus === "FAILED"
              ? (typeof payload.data?.reason === "string" ? payload.data.reason : "Provider reported failure").slice(0, 1000)
              : undefined,
        },
      });
    }
    await prisma.notificationEvent.create({
      data: {
        userId: log.userId,
        logId: log.id,
        eventType,
        provider: "RESEND",
        providerEventId: providerEventId ?? undefined,
        metadataJson: JSON.parse(JSON.stringify(payload.data ?? {})),
      },
    });
  } else if (providerEventId) {
    // Orphan event (no matching log). We still want an idempotent footprint,
    // but we cannot attribute it to a workspace — drop quietly.
    logger.debug("Resend webhook for unknown messageId", providerMessageId);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "resend" });
}
