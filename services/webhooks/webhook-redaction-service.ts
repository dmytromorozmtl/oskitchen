import { redactWebhookJsonForLog } from "@/lib/webhooks/webhook-redaction";

/** Server-side helpers for persisting webhook-derived JSON safely. */
export function sanitizeWebhookPayloadForStorage(payload: unknown): unknown {
  return redactWebhookJsonForLog(payload);
}
