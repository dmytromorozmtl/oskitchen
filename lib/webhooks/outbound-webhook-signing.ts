import { createHmac, timingSafeEqual } from "crypto";

import { outboundWebhookHeaders } from "@/lib/webhooks/outbound-webhook-events";

const SIGNATURE_PREFIX = "sha256=";

export function buildOutboundWebhookSignature(
  secret: string,
  timestampSeconds: number,
  rawBody: string,
): string {
  const signedPayload = `${timestampSeconds}.${rawBody}`;
  const digest = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  return `${SIGNATURE_PREFIX}${digest}`;
}

export function verifyOutboundWebhookSignature(input: {
  secret: string;
  timestampSeconds: number;
  rawBody: string;
  signatureHeader: string;
  toleranceSeconds?: number;
  nowSeconds?: number;
}): { ok: true } | { ok: false; reason: string } {
  const tolerance = input.toleranceSeconds ?? outboundWebhookHeaders().timestampToleranceSeconds;
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - input.timestampSeconds) > tolerance) {
    return { ok: false, reason: "timestamp_outside_tolerance" };
  }

  const expected = buildOutboundWebhookSignature(
    input.secret,
    input.timestampSeconds,
    input.rawBody,
  );
  const provided = input.signatureHeader.trim();
  if (!provided.startsWith(SIGNATURE_PREFIX)) {
    return { ok: false, reason: "invalid_signature_format" };
  }

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) {
    return { ok: false, reason: "signature_mismatch" };
  }
  if (!timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature_mismatch" };
  }
  return { ok: true };
}

export function buildOutboundWebhookRequestHeaders(input: {
  secret: string;
  eventType: string;
  deliveryId: string;
  rawBody: string;
  timestampSeconds?: number;
}): Record<string, string> {
  const headers = outboundWebhookHeaders();
  const timestamp = input.timestampSeconds ?? Math.floor(Date.now() / 1000);
  return {
    "Content-Type": "application/json",
    "User-Agent": "KitchenOS-OutboundWebhook/1.0",
    [headers.event]: input.eventType,
    [headers.deliveryId]: input.deliveryId,
    [headers.timestamp]: String(timestamp),
    [headers.signature]: buildOutboundWebhookSignature(
      input.secret,
      timestamp,
      input.rawBody,
    ),
  };
}

export function truncateResponseSnippet(body: string, max = 500): string {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}
