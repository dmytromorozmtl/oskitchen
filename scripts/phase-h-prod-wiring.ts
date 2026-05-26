#!/usr/bin/env tsx
/**
 * Phase H — production wiring checklist (stdout JSON for ops).
 * Run: npm run ops:phase-h-prod-wiring
 */

const phaseHChecklist = {
  phase: "H",
  h1_ga4_parity_automation: {
    cron: {
      path: "/api/cron/storefront-ga4-parity",
      schedule: "30 */6 * * *",
      requires: ["CRON_SECRET", "GA4_SERVICE_ACCOUNT_JSON"],
    },
    bqWebhook: {
      path: "/api/webhooks/bigquery-ga4-parity",
      auth: "Authorization: Bearer ${BIGQUERY_GA4_PARITY_WEBHOOK_SECRET}",
      body: {
        storeSlug: "your-store",
        parityScorePp: 1.2,
        ga4LiftPp: 2.5,
        firstPartyLiftPp: 3.7,
      },
      template: "npm run ops:bigquery-parity-template",
    },
    driftAlert: {
      alert_type: "storefront_ga4_parity_drift",
      rule: "status=drift for 2 consecutive 6h cron cycles (|Δ|>3pp)",
      slack: "STOREFRONT_GA4_PARITY_WEBHOOK_URL",
      pagerduty: "PAGERDUTY_ROUTING_KEY_GA4_PARITY or PAGERDUTY_ROUTING_KEY_SRM",
    },
    ui: "Advanced → GA4 parity sparkline (30d history)",
    circuitBreaker: "GA4 API opens after 5 failures for 1h",
  },
  h2_edge_hardening: {
    autoBootstrap: "Storefront create/slug change → enqueue edge sync (routing keys)",
    staleMetric: "storefront_edge_version_stale log when DB≠Edge >5min",
    backfillManual: "npm run ops:backfill-edge-keys",
  },
  h3_compliance: {
    signedExport: "experiment-audit-export?days=90&signed=1 + AUDIT_EXPORT_HMAC_SECRET",
    archiveCron: {
      path: "/api/cron/storefront-experiment-audit-archive",
      schedule: "0 3 * * 0",
      s3: ["AUDIT_ARCHIVE_S3_BUCKET", "AUDIT_ARCHIVE_S3_PREFIX", "AWS_REGION"],
      webhookFallback: "STOREFRONT_AUDIT_ARCHIVE_WEBHOOK_URL",
    },
    immutableStream: "storefront_experiment_audit_events (dual-write from auditLog)",
    migration: "prisma migrate deploy",
  },
  h4_incident_slo: {
    edgeSyncSlo: "p95 < 60s on Advanced card",
    pagerdutyRunbooks: "custom_details include runbook_advanced + runbook_edge_sync",
    gameDay: "npm run ops:game-day-experiment-drill",
  },
  h5_h6_roadmap: {
    h5: ["CUPED/sequential testing", "auto-conclude rules engine", "post-winner holdout", "feature flags UI"],
    h6: ["OTel middleware→checkout traces", "Datadog dashboard", "GA4 per-store quota UI"],
  },
};

console.log(JSON.stringify(phaseHChecklist, null, 2));
