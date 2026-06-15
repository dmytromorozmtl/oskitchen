#!/usr/bin/env tsx
/**
 * Staging DLQ drill: emits structured DLQ log + Slack webhook (same as production DLQ).
 * Does not mutate Edge Config — safe for alerting verification.
 *
 *   STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL=https://hooks.slack.com/... \
 *   STOREFRONT_SMOKE_SLUG=demo-bistro \
 *   npx tsx scripts/simulate-edge-sync-dlq.ts
 *
 * Then confirm:
 * 1. Slack message from webhook (immediate)
 * 2. Vercel Log Drain with filter alert_type = "storefront_edge_sync_dlq" (if drain configured)
 *
 * Optional full edge failure drill (breaks sync until restored):
 *   EDGE_CONFIG_ID=invalid-id npx tsx scripts/simulate-edge-sync-dlq.ts --live
 */

import { parseDlqWebhookUrl } from "@/lib/storefront/validate-dlq-webhook-url";
import { logEdgeSyncDlq } from "@/lib/storefront/theme-experiment-observability";

const slug = process.env.STOREFRONT_SMOKE_SLUG?.trim() ?? "staging-smoke";
const live = process.argv.includes("--live");

async function main() {
  const webhookCheck = parseDlqWebhookUrl(process.env.STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL);

  const jobId = `sim-${Date.now()}`;
  logEdgeSyncDlq({
    jobId,
    storefrontId: "00000000-0000-0000-0000-000000000001",
    storeSlug: slug,
    expectedVersion: 99,
    attemptCount: 5,
    lastError: live
      ? "simulated_live: invalid EDGE_CONFIG_ID — restore real id after test"
      : "simulated_dlq_drill: webhook + log drain test",
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: live ? "live_edge_break_not_run" : "log_only",
        jobId,
        storeSlug: slug,
        webhook: webhookCheck.ok,
        webhookSkipReason: webhookCheck.ok ? undefined : webhookCheck.reason,
        next: live
          ? "Set EDGE_CONFIG_ID to invalid value, save experiment on staging, wait for 5 cron cycles, then restore."
          : webhookCheck.ok
            ? "Check Slack + Vercel drain for alert_type storefront_edge_sync_dlq"
            : "Fix STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL (full https://hooks.slack.com/... URL), then re-run.",
      },
      null,
      2,
    ),
  );

  if (!webhookCheck.ok) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
