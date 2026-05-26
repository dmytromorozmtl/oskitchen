/** Canonical outbound webhook taxonomy — align payloads with `WebhookEvent` ingestion mirrors. */
export const WEBHOOK_EVENT_TYPES = [
  "order.created",
  "order.updated",
  "order.status_changed",
  "product_mapping.required",
  "production.completed",
  "packing.verified",
  "route.assigned",
  "pos.transaction_created",
  "support.ticket_created",
  "integration.failed",
] as const;
export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];
