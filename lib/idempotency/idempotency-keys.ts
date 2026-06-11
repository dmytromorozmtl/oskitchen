import { createHash } from "node:crypto";

/** Stripe idempotency keys must be ≤255 chars. */
const STRIPE_KEY_MAX = 255;

export function stripeIdempotencyRequestOptions(
  idempotencyKey: string,
): { idempotencyKey: string } {
  return { idempotencyKey: idempotencyKey.slice(0, STRIPE_KEY_MAX) };
}

/** Logical key mirrored by WebhookEvent @@unique([connectionId, externalEventId]). */
export function webhookProcessingKey(input: {
  provider: string;
  externalEventId: string;
  connectionId?: string | null;
}): string {
  const eventId = input.externalEventId.trim();
  const connectionId = input.connectionId?.trim();
  if (connectionId) {
    return `webhook:${input.provider}:${connectionId}:${eventId}`.slice(0, STRIPE_KEY_MAX);
  }
  return `webhook:${input.provider}:${eventId}`.slice(0, STRIPE_KEY_MAX);
}

export function marketplacePaymentIntentKey(orderId: string): string {
  return `marketplace_pi:${orderId}`;
}

export function marketplacePaymentCaptureKey(paymentIntentId: string): string {
  return `marketplace_capture:${paymentIntentId}`;
}

export function posTerminalPaymentIntentKey(orderId: string): string {
  return `pos_terminal_pi:${orderId}`;
}

export function posRefundIdempotencyKey(
  transactionId: string,
  partialAmount?: number | null,
): string {
  if (partialAmount != null) {
    return `pos_refund_${transactionId}_partial_${Math.round(partialAmount * 100)}`;
  }
  return `pos_refund_${transactionId}_full`;
}

export function vendorPayoutTransferKey(vendorId: string, payoutId: string): string {
  return `vendor_payout_transfer:${vendorId}:${payoutId}`;
}

export function vendorInstantPayoutTransferKey(vendorId: string, payoutId: string): string {
  return `vendor_instant_transfer:${vendorId}:${payoutId}`;
}

export function vendorInstantPayoutDebitKey(vendorId: string, payoutId: string): string {
  return `vendor_instant_payout:${vendorId}:${payoutId}`;
}

/** Stable payout id from vendor + scoped transaction ids (retries reuse the same key). */
export function buildStablePayoutId(
  prefix: string,
  vendorId: string,
  scopeIds: readonly string[],
): string {
  const scope = [...scopeIds].sort().join(",");
  const digest = createHash("sha256")
    .update(`${vendorId}:${scope}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `${prefix}-${digest}`;
}
