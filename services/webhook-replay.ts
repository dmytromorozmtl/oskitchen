/**
 * Universal webhook replay service — provider-agnostic log + replay entry points.
 * Delegates persistence to webhook-event-store and replay to webhook-replay-service.
 */
import type { IntegrationProvider } from "@prisma/client";

import { createWebhookEvent } from "@/lib/webhooks/webhook-event-store";
import {
  requestWebhookReplay,
  type RequestWebhookReplayInput,
  type WebhookReplaySurface,
} from "@/services/webhooks/webhook-replay-service";

export type { WebhookReplaySurface };

export type LogWebhookInput = {
  userId: string;
  workspaceId?: string | null;
  connectionId?: string | null;
  provider: IntegrationProvider;
  topic: string;
  payload: unknown;
  signatureValid: boolean;
  externalEventId?: string | null;
};

export type LogWebhookResult = {
  duplicate: boolean;
  id: string;
};

/** Persist an inbound webhook delivery for audit, idempotency, and optional replay. */
export async function logWebhook(input: LogWebhookInput): Promise<LogWebhookResult> {
  return createWebhookEvent(input);
}

export type ReplayWebhookInput = RequestWebhookReplayInput;

/** Audited replay — resets processing state and re-runs or re-enqueues handler work. */
export async function replayWebhook(
  input: ReplayWebhookInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return requestWebhookReplay(input);
}
