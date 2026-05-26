#!/usr/bin/env tsx
/**
 * Phase I — production wiring checklist.
 * Run: npm run ops:phase-i-prod-wiring
 */

const phaseIChecklist = {
  phase: "I",
  i1_auto_conclude: {
    env: [
      "THEME_EXPERIMENT_AUTO_CONCLUDE=1",
      "THEME_EXPERIMENT_AUTO_CONCLUDE_GRACE_HOURS=24",
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL",
    ],
    cron: "/api/cron/storefront-experiment-auto-conclude (0 10 * * *)",
    ui: "Settings → Experiments → Auto-conclude checkbox",
    gates: ["publish_draft", "parity ok", "SRM ok", "edge synced", "no blocking jobs"],
    dryRun: "THEME_EXPERIMENT_AUTO_CONCLUDE_DRY_RUN=1",
    emails: ["scheduled (grace start)", "executed (winner applied)"],
  },
  i1_bq_primary: {
    env: ["GA4_BQ_PRIMARY=1 (default)", "GA4_BQ_PRIMARY_MAX_AGE_HOURS=36"],
    webhook: "POST /api/webhooks/bigquery-ga4-parity nightly",
    fallback: "GA4 Data API when BQ snapshot stale",
    template: "npm run ops:bigquery-parity-template",
  },
  i1_parity_budget: {
    ui: "Advanced → GA4 parity error budget card",
    rule: "3 drift-days per 30d window → exhausted",
  },
  i2_ops_ui: {
    path: "/dashboard/storefront/settings/experiments",
    features: ["pipeline toggle", "auto-conclude", "workspace override", "audit stream viewer"],
  },
  roadmap_i3_i6: {
    i3: "OTel middleware→checkout traces",
    i4: "CUPED / holdout / power calculator",
    i5: "Per-workspace EDGE_CONFIG_ID shard",
    i6: "SOC2 evidence pack + legal hold",
  },
};

console.log(JSON.stringify(phaseIChecklist, null, 2));
