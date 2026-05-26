#!/usr/bin/env tsx
/**
 * Ops runbook for theme experiment edge sync alerts (stdout JSON).
 * Run: npm run ops:edge-sync-runbook
 */

const runbook = {
  title: "Theme experiment edge sync — alert runbook",
  alerts: {
    storefront_edge_sync_dlq: {
      severity: "critical",
      channels: ["STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL", "Vercel Log Drain filter: alert_type = storefront_edge_sync_dlq"],
      steps: [
        "Advanced → Edge sync status: note DB v vs Edge v.",
        "Click Retry edge sync (does not bump version).",
        "If still DEAD: verify EDGE_CONFIG_ID, VERCEL_API_TOKEN, VERCEL_TEAM_ID, THEME_EXPERIMENT_EDGE=1.",
        "If lastError contains version_mismatch: compare DB version on Advanced with Edge read; re-save experiment only if intentional.",
        "Cron /api/cron/storefront-edge-sync runs every 2 minutes — check Vercel cron logs.",
      ],
    },
    version_mismatch: {
      severity: "warning",
      steps: [
        "DB version (themeExperimentJson.version) must equal Edge Config item theme-exp:{storeSlug}.version.",
        "Do not publish theme while jobs are QUEUED/PROCESSING.",
        "Retry edge sync after DB save; avoid manual Edge edits.",
      ],
    },
    theme_experiment_arm_assigned: {
      severity: "info",
      channels: ["Vercel Log Drain optional: alert_type = theme_experiment_arm_assigned"],
      note: "Sampled middleware assignments for drift detection (THEME_EXPERIMENT_ARM_LOG_SAMPLE, default 2%).",
    },
    storefront_experiment_srm_warn: {
      severity: "warning",
      channels: [
        "STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL",
        "Vercel Log Drain filter: alert_type = storefront_experiment_srm_warn",
        "Cron /api/cron/storefront-experiment-srm every 6h (24h dedupe per store)",
      ],
      steps: [
        "Advanced → Traffic sanity card: compare observed vs configured draft %.",
        "Check for bot traffic, broken cookies, or edge assignment bugs before Apply winner.",
        "Audit log action storefront.experiment.srm_warn on Advanced.",
      ],
    },
  },
  onCall: {
    slackHandle: process.env.STOREFRONT_EXPERIMENT_ONCALL_SLACK ?? "#storefront-oncall",
    primaryOwner: process.env.STOREFRONT_EXPERIMENT_ONCALL_EMAIL ?? "owner@your-domain.com",
    phaseFChecklist: "npm run ops:phase-f-prod-wiring",
  },
  staging_drills: {
    dlq_log_only: "npm run ops:simulate-edge-sync-dlq",
    dlq_live_edge: "EDGE_CONFIG_ID=invalid npx tsx scripts/simulate-edge-sync-dlq.ts --live (restore after)",
    log_drain_config: "npm run ops:vercel-log-drain-edge-sync",
  },
};

console.log(JSON.stringify(runbook, null, 2));
