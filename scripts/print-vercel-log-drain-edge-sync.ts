#!/usr/bin/env tsx
/**
 * Prints Vercel Log Drain filter JSON for storefront edge sync DLQ → Slack.
 *
 * Setup (Vercel dashboard → Project → Log Drains):
 * 1. Destination: Slack (or HTTP endpoint that forwards to Slack).
 * 2. Filter: use `filter` below (JSON path / Vercel drain expression per your drain type).
 * 3. Duplicates app webhook: set STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL for immediate POST;
 *    the drain catches the same structured log if the webhook fails.
 *
 * Run: npm run ops:vercel-log-drain-edge-sync
 */

const SAMPLE_DLQ_LOG = {
  level: "error",
  message: "storefront_edge_sync_dlq",
  alert_type: "storefront_edge_sync_dlq",
  severity: "critical",
  component: "storefront_edge_sync",
  jobId: "clx0000000000000000000000",
  storefrontId: "clx0000000000000000000001",
  storeSlug: "demo-bistro",
  expectedVersion: 3,
  attemptCount: 5,
  lastError: "version_mismatch: expected 3, got 2",
};

const config = {
  name: "KitchenOS — storefront edge sync DLQ",
  description:
    "Forwards critical edge sync job failures to Slack. Matches logger.error('storefront_edge_sync_dlq', { alert_type: 'storefront_edge_sync_dlq', ... }).",
  vercelLogDrain: {
    /** Vercel drain filter (Logs UI): match structured field alert_type */
    filterExpression: 'alert_type = "storefront_edge_sync_dlq"',
    /** Alternative: substring on raw log line */
    filterSubstring: "storefront_edge_sync_dlq",
    environments: ["production", "preview"],
  },
  slackMessageTemplate: [
    ":rotating_light: *Edge sync DLQ* — `{{storeSlug}}`",
    "Job `{{jobId}}` failed after {{attemptCount}} attempts (expected v{{expectedVersion}}).",
    "{{lastError}}",
  ].join("\n"),
  optionalDrains: [
    {
      name: "KitchenOS — middleware arm assignment (sampled)",
      filterExpression: 'alert_type = "theme_experiment_arm_assigned"',
      env: "THEME_EXPERIMENT_ARM_LOG_SAMPLE=0.02",
    },
    {
      name: "KitchenOS — experiment SRM traffic drift",
      filterExpression: 'alert_type = "storefront_experiment_srm_warn"',
      env: "STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL",
      cron: "/api/cron/storefront-experiment-srm",
    },
  ],
  env: {
    appWebhook: "STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL",
    edgeCron: "CRON_SECRET → /api/cron/storefront-edge-sync",
    edgeFlag: "THEME_EXPERIMENT_EDGE=1",
    weeklyCsvCron: "CRON_SECRET → /api/cron/storefront-experiment-report (Mondays 09:00 UTC)",
  },
  sampleLogLine: SAMPLE_DLQ_LOG,
};

console.log(JSON.stringify(config, null, 2));
