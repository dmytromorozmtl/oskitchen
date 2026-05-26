#!/usr/bin/env tsx
/**
 * Phase N+ — production wiring checklist.
 * Run: npm run ops:phase-n-prod-wiring
 */

const phaseNChecklist = {
  phase: "N+",
  recommended_order: [
    "N1 Hierarchical Bayes",
    "N2 LinUCB live",
    "N5 Vertex XGBoost",
    "N3 Global edge quorum",
    "N4 SCIM auditor",
  ],
  n1_hierarchical: {
    env: ["THEME_EXPERIMENT_BAYESIAN_HIERARCHICAL=1", "THEME_EXPERIMENT_BAYESIAN_BQ_ONLY=1"],
    bq_table: "experiment_posterior_daily (conversion, revenue, aov)",
    webhook: "POST /api/webhooks/bigquery-bayesian-prior with metrics[]",
    ui: "Advanced → multi-metric cards + fan chart",
  },
  n2_linucb: {
    env: [
      "THEME_EXPERIMENT_LINUCB=1",
      "THEME_EXPERIMENT_LINUCB_MAX_EXPLORATION=15",
      "THEME_EXPERIMENT_REGRET_ALERT_PP=5",
      "BIGQUERY_LINUCB_WEBHOOK_SECRET",
    ],
    webhook: "POST /api/webhooks/bigquery-linucb-weights (every 15m)",
    cron: "/api/cron/storefront-experiment-linucb-stream (*/15 * * * *)",
    pagerduty: "PAGERDUTY_ROUTING_KEY_SRM on regret > 5pp",
  },
  n5_vertex: {
    env: [
      "THEME_EXPERIMENT_ML_SHADOW=1",
      "THEME_EXPERIMENT_VERTEX_ML=1",
      "THEME_EXPERIMENT_ML_AUTO_PROMOTE=1",
      "VERTEX_ML_MODEL_WEBHOOK_SECRET",
    ],
    webhook: "POST /api/webhooks/vertex-ml-model",
    cron: "/api/cron/storefront-experiment-vertex-promote (0 1 * * *)",
    promote: "14 consecutive shadow wins → champion=vertex",
  },
  n3_global_quorum: {
    env: [
      "THEME_EXPERIMENT_EDGE_GLOBAL_QUORUM=1",
      "EDGE_CONFIG_ID_REPLICA",
      "EDGE_CONFIG_ID_REPLICA_2",
    ],
    write: "PATCH 3 regions, quorum 2/3",
    read: "majority version; stale → DB fallback assignment",
    crdt: "LWW merge + tombstones in themeExperimentJson.crdtLww",
  },
  n4_scim_auditor: {
    env: ["EXPERIMENT_SCIM_WEBHOOK_SECRET"],
    webhook: "POST /api/webhooks/scim/experiment-auditor",
    sql: "prisma/sql/experiment-auditor-rls.sql",
    ui: "Compliance → manifest week-over-week diff (inline, no presign click)",
  },
  phase_o_preview: {
    o1: "Causal forest + geo holdout automation",
    o2: "Real-time bandit on Kafka/PubSub",
    o3: "Active-active edge with CRDT sync bus",
    o4: "FedRAMP auditor pack + cross-region S3 replication",
    o5: "Auto-rollback on post-publish regression detector",
  },
};

console.log(JSON.stringify(phaseNChecklist, null, 2));
