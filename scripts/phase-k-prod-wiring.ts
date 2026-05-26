#!/usr/bin/env tsx
/**
 * Phase K+ — production wiring checklist.
 * Run: npm run ops:phase-k-prod-wiring
 */

const phaseKChecklist = {
  phase: "K+",
  recommended_order: ["K1 OTLP+Slack", "K2 sequential+guardrails", "K5 workspace policy", "K3 edge failover", "K4 SOC2 cron"],
  k1_otel_slack: {
    env: [
      "OTEL_EXPORTER_OTLP_ENDPOINT=https://api.datadoghq.com (or Honeycomb)",
      "OTEL_SERVICE_NAME=kitchenos-storefront-experiment",
      "EXPERIMENT_OTEL=1",
      "DD_API_KEY or HONEYCOMB_API_KEY",
      "DATADOG_APP_URL or HONEYCOMB_APP_URL (PagerDuty trace links)",
      "STOREFRONT_EXPERIMENT_APPROVAL_SLACK_WEBHOOK_URL",
      "SLACK_SIGNING_SECRET (interactive webhook)",
    ],
    routes: [
      "POST /api/webhooks/slack/experiment-interactive",
      "GET approve/reject (email + Slack buttons)",
      "POST /api/storefront/experiment/auto-conclude/bulk-approve",
    ],
    spans: "middleware.assign_arm → rsc.theme → checkout_submit (+ edge_config.read) in one OTLP trace",
  },
  k2_statistics: {
    env: [
      "THEME_EXPERIMENT_SEQUENTIAL=1",
      "THEME_EXPERIMENT_SEQUENTIAL_MAX_LOOKS=4",
      "THEME_EXPERIMENT_MULTI_METRIC_GUARDRAILS=1",
      "THEME_EXPERIMENT_CUPED_V2=1",
      "EXPERIMENT_REVENUE_PROXY_CENTS=4500",
    ],
    cron: "/api/cron/storefront-experiment-holdout-decay (0 6 * * *)",
  },
  k3_scale: {
    env: [
      "EDGE_CONFIG_ID_{WORKSPACE_UUID}",
      "EDGE_CONFIG_ID_FALLBACK",
      "EDGE_CONFIG_TOKEN (per-shard reads)",
    ],
    ui: "/dashboard/workspace/experiments — agency rollup",
  },
  k4_enterprise: {
    cron: "/api/cron/soc2-experiment-evidence (0 4 * * 1)",
    env: [
      "AUDIT_ARCHIVE_S3_COMPLIANCE_MODE=1 (7y COMPLIANCE Object Lock)",
      "SOC2_EVIDENCE_OUT_DIR",
    ],
    api: "POST /api/dashboard/storefront/experiment-legal-hold { enabled }",
  },
  k5_agency_policy: {
    db: "workspaces.experiment_policy_json",
    fields: ["autoConcludeDefault", "requireApproval", "minLiftPp"],
    ui: "Settings → Experiments → workspace policy section",
  },
  phase_l_preview: {
    l1: "Bayesian decision + causal impact (GeoML)",
    l2: "Multi-arm (3+ themes) + MAB",
    l3: "Edge Config write sharding + CRDT version",
    l4: "SOC2 auditor portal (read-only signed exports)",
    l5: "Auto-conclude ML risk scorer",
  },
};

console.log(JSON.stringify(phaseKChecklist, null, 2));
