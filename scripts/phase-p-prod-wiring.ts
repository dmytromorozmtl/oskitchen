#!/usr/bin/env tsx
/**
 * Phase P+ — production wiring checklist.
 * Run: npm run ops:phase-p-prod-wiring
 */

const phasePChecklist = {
  phase: "P+",
  recommended_order: [
    "P1 Causal DAG spillover",
    "P2 Flink exactly-once",
    "P5 Bayesian partial rollback",
    "P3 Planet-scale edge",
    "P4 SOC2 Type II",
  ],
  p1_causal_dag: {
    env: ["THEME_EXPERIMENT_CAUSAL_DAG=1", "THEME_EXPERIMENT_SPILLOVER_BAN_PP=1"],
    bq: "experiment_spillover_daily → POST /api/webhooks/bigquery-spillover-daily",
    gate: "publish_draft + publishStorefrontThemeSnapshot require spilloverPassed",
    json: "spilloverDaily + dagEdges (backdoor-adjusted)",
    secret: "BIGQUERY_SPILLOVER_WEBHOOK_SECRET",
  },
  p2_flink_stream: {
    env: [
      "THEME_EXPERIMENT_FEATURE_STREAM_DURABLE=1",
      "THEME_EXPERIMENT_FEATURE_STREAM_SLO_MS=2000",
      "EXPERIMENT_FEATURE_STREAM_FLINK_SECRET",
    ],
    webhook: "POST /api/webhooks/experiment-feature-stream-flink",
    behavior: "eventId dedupe 24h · DLQ poison pills · SLO ingest lag p99",
  },
  p5_partial_rollback: {
    env: ["THEME_EXPERIMENT_PARTIAL_ROLLBACK=1"],
    slack: "experiment_partial_revert | experiment_full_revert | experiment_rollback_keep",
    behavior: "layout tokens from baseline; nav/copy from winner; PyMC counterfactual in snapshot",
  },
  p3_planet_edge: {
    env: [
      "THEME_EXPERIMENT_EDGE_PLANET=1",
      "EDGE_CONFIG_ID",
      "EDGE_CONFIG_ID_REPLICA",
      "EDGE_CONFIG_ID_REPLICA_2",
      "EDGE_CONFIG_ID_REPLICA_3",
      "EDGE_CONFIG_ID_REPLICA_4",
      "CRDT_SYNC_BUS_BACKEND=redis|nats",
    ],
    cron: "/api/cron/storefront-experiment-planet-edge (*/5 * * * *)",
    middleware: "kos_edge_region sticky cookie + nearest geo replica",
    runbook: "region evacuation < 5 min — drain geo-DNS + CRDT tombstone",
  },
  p4_soc2_type2: {
    env: ["AUDIT_ARCHIVE_S3_BUCKET", "SOC2_TYPE2_OUT_DIR"],
    cron: "/api/cron/soc2-type2-evidence-binder (0 5 1 * *)",
    api: "GET /api/compliance/auditor/experiment-controls (read-only)",
    mapping: "CC6.1 / CC7.2 / CC8.1 per cron",
  },
  phase_q: "Implemented — run npm run ops:phase-q-prod-wiring",
};

console.log(JSON.stringify(phasePChecklist, null, 2));
