import { test } from "@playwright/test";

import {
  hasWebhookIngestConnection,
  hasWebhookIngestOrderCreationCredentials,
  hasWebhookIngestOrderCreationDb,
  isWebhookIngestOrderCreationE2EEnabled,
  isWebhookIngestOrderCreationKdsGateEnabled,
} from "@/lib/qa/webhook-ingest-order-creation-e2e-policy";

export function skipWebhookIngestOrderCreationIfNotAuthed(): void {
  if (!hasWebhookIngestOrderCreationCredentials()) {
    test.skip(
      true,
      "Webhook ingest → order creation E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipWebhookIngestOrderCreationIfGateDisabled(): void {
  if (!isWebhookIngestOrderCreationE2EEnabled()) {
    test.skip(
      true,
      "Webhook ingest → order creation E2E SKIPPED — set E2E_WEBHOOK_INGEST_E2E=true",
    );
  }
}

export function skipWebhookIngestOrderCreationIfNoDb(): void {
  if (!hasWebhookIngestOrderCreationDb()) {
    test.skip(true, "DATABASE_URL required for webhook ingest → order creation E2E");
  }
}

export function skipWebhookIngestOrderCreationIfNoConnection(): void {
  if (!hasWebhookIngestConnection()) {
    test.skip(
      true,
      "CHANNEL_SMOKE_CONNECTION_ID required for webhook ingest → order creation E2E",
    );
  }
}

export function skipWebhookIngestOrderCreationIfKdsGateDisabled(): void {
  if (!isWebhookIngestOrderCreationKdsGateEnabled()) {
    test.skip(
      true,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
  }
}
