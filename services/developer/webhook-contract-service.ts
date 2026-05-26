import type { WebhookEventType } from "@/lib/developer/webhook-event-types";
import { WEBHOOK_EVENT_TYPES } from "@/lib/developer/webhook-event-types";

export function listDocumentedWebhookEventTypes(): readonly WebhookEventType[] {
  return WEBHOOK_EVENT_TYPES;
}

export const WEBHOOK_RETRY_POLICY_NOTES = [
  "Exponential backoff with jitter for transient 5xx/429 responses.",
  "Non-retryable 4xx except 429 require manual intervention.",
  "Raw payloads are never echoed in KitchenOS UI — use redacted previews only.",
] as const;
