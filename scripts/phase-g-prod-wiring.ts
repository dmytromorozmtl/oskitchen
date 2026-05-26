#!/usr/bin/env tsx
/**
 * Phase G+ — production wiring checklist (stdout JSON for ops).
 * Run: npm run ops:phase-g-prod-wiring
 */

const phaseGChecklist = {
  phase: "G+",
  ga4_auto_parity: {
    seoField: "Storefront → SEO → GA4 property ID (numeric, not G-)",
    serverEnv: ["GA4_SERVICE_ACCOUNT_JSON"],
    serviceAccountScopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    ga4Admin: [
      "Grant service account Viewer on GA4 property",
      "Custom dimension experimentArm (event scope) on checkout_submit",
    ],
    dashboard: "Advanced → GA4 parity card + ?refreshGa4=1",
    cache: "15 min in themeExperimentJson.ga4ParityCache",
    bigQueryAlt: "npm run ops:bigquery-parity-template → scheduled query → optional future metric ingest",
  },
  middleware_workspace_keys: {
    routingKey: "theme-exp-routing:{storeSlug} → { configKey, legacyKey }",
    configKey: "theme-exp:{workspaceId}:{storeSlug} when workspaceId set",
    backfill: "npm run ops:backfill-edge-keys",
    verify: "npm run smoke:edge-experiment",
  },
  audit_export: {
    ui: "Advanced → Export audit CSV (90d)",
    api: "/api/dashboard/storefront/experiment-audit-export?days=90",
    filter: "storefront.experiment.*",
    maxRows: 5000,
  },
  pagerduty: {
    dlqCritical: "PAGERDUTY_ROUTING_KEY_DLQ (or PAGERDUTY_ROUTING_KEY)",
    srmWarning: "PAGERDUTY_ROUTING_KEY_SRM (or PAGERDUTY_ROUTING_KEY)",
    alongside: "Slack webhooks (STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL, SRM webhook)",
    drill: "npm run ops:simulate-edge-sync-dlq",
  },
  pipeline_kill_switch: {
    global: "THEME_EXPERIMENT_DISABLED=1",
    perStorefront: "Advanced → uncheck Experiment pipeline → Save (no redeploy)",
    workspaceOverride: "workspace_feature_overrides feature_key storefront.theme_experiment",
    edgeEffect: "pipelineEnabled:false skips middleware assignment after next edge sync",
  },
  migration: "prisma migrate deploy (google_analytics_property_id)",
  smoke: [
    "npm run typecheck",
    "npm run test -- tests/unit/ga4-parity-score.test.ts",
    "npm run ops:phase-g-prod-wiring",
  ],
};

console.log(JSON.stringify(phaseGChecklist, null, 2));
