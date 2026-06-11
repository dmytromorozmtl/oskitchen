import { test } from "@playwright/test";

import {
  hasWebhookReplayIdempotencyConnection,
  hasWebhookReplayIdempotencyDb,
  isWebhookReplayIdempotencyE2EEnabled,
} from "@/lib/qa/webhook-replay-idempotency-e2e-policy";

export function skipWebhookReplayIdempotencyIfGateDisabled(): void {
  if (!isWebhookReplayIdempotencyE2EEnabled()) {
    test.skip(
      true,
      "Webhook replay idempotency E2E SKIPPED — set E2E_WEBHOOK_REPLAY_IDEMPOTENCY=true",
    );
  }
}

export function skipWebhookReplayIdempotencyIfNoDb(): void {
  if (!hasWebhookReplayIdempotencyDb()) {
    test.skip(true, "Webhook replay idempotency E2E SKIPPED — missing DATABASE_URL");
  }
}

export function skipWebhookReplayIdempotencyIfNoConnection(): void {
  if (!hasWebhookReplayIdempotencyConnection()) {
    test.skip(
      true,
      "Webhook replay idempotency E2E SKIPPED — missing CHANNEL_SMOKE_CONNECTION_ID",
    );
  }
}
