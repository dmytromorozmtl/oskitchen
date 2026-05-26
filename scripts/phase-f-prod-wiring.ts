#!/usr/bin/env tsx
/**
 * Phase F — production wiring checklist (stdout JSON for ops).
 * Run: npm run ops:phase-f-prod-wiring
 */

const checklist = {
  phase: "F",
  day1_prod_wiring: {
    vercelLogDrains: [
      {
        name: "Edge sync DLQ (critical)",
        filter: 'alert_type = "storefront_edge_sync_dlq"',
        env: ["STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL"],
        script: "npm run ops:vercel-log-drain-edge-sync",
      },
      {
        name: "Middleware arm sample (info)",
        filter: 'alert_type = "theme_experiment_arm_assigned"',
        env: ["THEME_EXPERIMENT_ARM_LOG_SAMPLE=0.02"],
        optional: true,
      },
      {
        name: "SRM traffic drift (warning)",
        filter: 'alert_type = "storefront_experiment_srm_warn"',
        env: ["STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL", "or DLQ webhook fallback"],
        cron: "/api/cron/storefront-experiment-srm (0 */6 * * *)",
      },
    ],
    stagingDrill: {
      command:
        "STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL='https://hooks.slack.com/services/...' npm run ops:simulate-edge-sync-dlq",
      expect: ["Slack webhook message", "Vercel drain message within ~2 min", "audit storefront.experiment.edge_dlq"],
    },
    onCall: {
      primary: process.env.STOREFRONT_EXPERIMENT_ONCALL_SLACK ?? "@storefront-oncall",
      runbook: "npm run ops:edge-sync-runbook",
      escalation: "Platform owner → check EDGE_CONFIG + cron storefront-edge-sync",
    },
  },
  day2_3_decision_ops: {
    weeklyCsvCron: {
      path: "/api/cron/storefront-experiment-report",
      schedule: "0 9 * * 1",
      requires: ["CRON_SECRET", "RESEND_API_KEY", "RESEND_FROM_EMAIL"],
      dryRun: "npm run ops:dry-run-experiment-weekly-report",
    },
    ownerTraining: [
      "Apply winner when publish_draft + edge idle + GA4 parity OK",
      "Manual publish when reviewing draft in Theme builder",
      "Pause decisions when Traffic sanity warns (SRM)",
    ],
  },
  week2_analytics: {
    ga4CustomDimension: "experimentArm (event scope)",
    parity: "Advanced → GA4 parity card + CSV export same days window",
    bigQuery: "npm run ops:bigquery-parity-template",
  },
  git_release: {
    init: "git init && git remote add origin <url>",
    smoke: ["npm run smoke:sprint5", "npm run smoke:edge-experiment", "npm run test:e2e:sprint5-lifecycle"],
    pr: "./scripts/sprint5-commit-pr.sh",
  },
};

console.log(JSON.stringify(checklist, null, 2));
