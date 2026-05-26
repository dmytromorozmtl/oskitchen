import { resolveEdgeSyncDlqWebhookEnvKey } from "@/lib/storefront/experiment-webhook-routing";
import { logger } from "@/lib/logger";
import { pagerDutyCustomDetailsWithRunbooks } from "@/lib/storefront/experiment-runbook-links";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { parseDlqWebhookUrl } from "@/lib/storefront/validate-dlq-webhook-url";

/** Optional DLQ webhook (Slack incoming webhook, PagerDuty Events v2, etc.). */
export async function notifyEdgeSyncDlq(input: {
  jobId: string;
  storefrontId: string;
  storeSlug: string;
  workspaceId?: string | null;
  expectedVersion: number;
  attemptCount: number;
  lastError: string | null;
}): Promise<void> {
  const parsed = parseDlqWebhookUrl(resolveEdgeSyncDlqWebhookEnvKey(input.workspaceId));
  if (!parsed.ok) {
    logger.warn("edge_sync_dlq_webhook_skipped", { reason: parsed.reason });
    return;
  }
  const url = parsed.url;

  const body = {
    text: `KitchenOS Edge sync DLQ: ${input.storeSlug} job ${input.jobId} failed after ${input.attemptCount} attempts (v${input.expectedVersion}). ${input.lastError ?? ""}`,
    jobId: input.jobId,
    storeSlug: input.storeSlug,
    storefrontId: input.storefrontId,
    expectedVersion: input.expectedVersion,
    attemptCount: input.attemptCount,
    lastError: input.lastError,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      logger.warn("edge_sync_dlq_webhook_failed", { status: res.status });
    }
  } catch (e) {
    logger.warn("edge_sync_dlq_webhook_error", { error: String(e) });
  }

  void sendPagerDutyEvent({
    severity: "critical",
    summary: `Edge sync DLQ: ${input.storeSlug} job ${input.jobId}`,
    source: "storefront_edge_sync",
    dedupKey: `edge-sync-dlq-${input.storefrontId}`,
    customDetails: pagerDutyCustomDetailsWithRunbooks(input.storeSlug, {
      storeSlug: input.storeSlug,
      jobId: input.jobId,
      expectedVersion: input.expectedVersion,
      attemptCount: input.attemptCount,
      lastError: input.lastError,
    }),
  });
}
