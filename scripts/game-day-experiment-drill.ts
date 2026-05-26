#!/usr/bin/env tsx
/**
 * Quarterly game day — experiment incident drill steps (stdout checklist).
 * Run: npm run ops:game-day-experiment-drill
 */

const drill = {
  title: "KitchenOS experiment game day",
  duration_minutes: 45,
  participants: ["storefront-oncall", "platform"],
  scenarios: [
    {
      name: "DLQ critical (edge sync dead)",
      steps: [
        "npm run ops:simulate-edge-sync-dlq",
        "Verify Slack + PagerDuty critical (PAGERDUTY_ROUTING_KEY_DLQ)",
        "Advanced → Retry edge sync",
        "Confirm audit storefront.experiment.edge_dlq",
      ],
    },
    {
      name: "SRM warning",
      steps: [
        "Trigger or wait for /api/cron/storefront-experiment-srm",
        "Verify storefront_experiment_srm_warn drain",
        "Pause Apply winner until traffic sanity clears",
      ],
    },
    {
      name: "GA4 parity drift (2 cycles)",
      steps: [
        "Ensure GA4 property ID + GA4_SERVICE_ACCOUNT_JSON",
        "Run cron twice (or mock drift in staging)",
        "Verify storefront_ga4_parity_drift after 2nd cycle",
        "Check sparkline on Advanced",
      ],
    },
    {
      name: "Pipeline kill switch",
      steps: [
        "Advanced → uncheck Experiment pipeline → Save",
        "Confirm middleware stops new arm assignment after edge sync",
        "Re-enable pipeline",
      ],
    },
    {
      name: "Signed audit export",
      steps: [
        "Set AUDIT_EXPORT_HMAC_SECRET",
        "Download signed export from Advanced",
        "Verify X-KOS-Audit-Signature headers",
      ],
    },
  ],
  exit_criteria: [
    "All alerts received within 5 min",
    "Runbook links open from PagerDuty custom_details",
    "SLO card shows p95 after recovery",
  ],
};

console.log(JSON.stringify(drill, null, 2));
