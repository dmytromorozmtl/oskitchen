#!/usr/bin/env tsx
/**
 * Phase J+ — production wiring checklist.
 * Run: npm run ops:phase-j-prod-wiring
 */

const phaseJChecklist = {
  phase: "J+",
  recommended_order: ["J1 OTel", "J2 power+holdout", "J4 SOC2", "J3 edge shard", "J5 approval"],
  j1_otel: {
    env: ["EXPERIMENT_TRACE_ENABLED=1", "OTEL_EXPORTER_OTLP_ENDPOINT (Datadog/Honeycomb)"],
    spans: ["middleware.assign_arm", "rsc.theme", "checkout_submit"],
    log_drain: "Filter event_type=experiment_span in Datadog",
    dashboard: ["SRM", "DLQ", "parity drift", "pipeline_off rate", "storefront_edge_config_read_latency_ms"],
  },
  j2_statistics: {
    env: ["THEME_EXPERIMENT_CUPED=1"],
    ui: ["Advanced → Power card", "Settings → Experiments → Post-winner holdout %"],
    edge: "holdoutOnly payload when experiment concluded + holdout > 0",
  },
  j3_scale: {
    env: ["EDGE_CONFIG_ID_{WORKSPACE_UUID}=ecfg_..."],
    metric: "storefront_edge_config_read_latency_ms (log drain)",
    ga4: "SEO save validates property via Data API",
  },
  j4_enterprise: {
    scripts: ["npm run ops:soc2-experiment-evidence"],
    env: [
      "AUDIT_EXPORT_HMAC_SECRET",
      "SOC2_EVIDENCE_OUT_DIR=./tmp/soc2-experiment-evidence",
      "AUDIT_ARCHIVE_S3_OBJECT_LOCK=1 (bucket must have Object Lock)",
    ],
    legal_hold: "Settings → Experiments → Legal hold (skips archive cron)",
  },
  j5_auto_conclude_v2: {
    env: [
      "THEME_EXPERIMENT_AUTO_CONCLUDE=1",
      "THEME_EXPERIMENT_AUTO_CONCLUDE_SKIP_APPROVAL=0 (default — email approval required)",
    ],
    routes: [
      "GET /api/storefront/experiment/auto-conclude/approve?token=",
      "GET /api/storefront/experiment/auto-conclude/reject?token=",
    ],
    slack: "Phase K — interactive Slack Apply winner (same gates)",
  },
  phase_k_preview: {
    k1: "Slack interactive + PagerDuty runbook links on span errors",
    k2: "Sequential testing (spending function) + multi-metric guardrails",
    k3: "Multi-region edge read failover",
    k4: "Agency workspace auto-conclude policy UI",
  },
};

console.log(JSON.stringify(phaseJChecklist, null, 2));
