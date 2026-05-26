/**
 * Stable dedupe keys for channel ingestion. Used with unique DB constraints and batch routing.
 */

import type { IntegrationProvider } from "@prisma/client";

export function webhookEventBatchDedupeKey(webhookEventId: string): string {
  return `webhook_event:${webhookEventId}`;
}

export function syncJobBatchDedupeKey(syncJobId: string): string {
  return `sync_job:${syncJobId}`;
}

export function manualImportBatchDedupeKey(seed: string): string {
  return `manual:${seed}`;
}

export function simulationBatchDedupeKey(seed: string): string {
  return `sim:${seed}`;
}

/** Logical key for an external order within a connection (mirrors ExternalOrder upsert scope). */
export function externalOrderDedupeScope(input: {
  connectionId: string | null;
  provider: IntegrationProvider;
  externalOrderId: string;
}): string {
  const conn = input.connectionId ?? "none";
  return `${input.provider}:${conn}:${input.externalOrderId}`;
}
