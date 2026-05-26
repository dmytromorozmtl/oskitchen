#!/usr/bin/env tsx
/**
 * Phase Q+ — production wiring checklist.
 * Run: npm run ops:phase-q-prod-wiring
 */

const phaseQChecklist = {
  phase: "Q+",
  recommended_order: [
    "Q1 Interference matrix",
    "Q2 WASM assignment",
    "Q5 Causal posteriors",
    "Q3 Private Link BQ",
    "Q4 ISO 27001",
  ],
  q1_interference: {
    env: [
      "THEME_EXPERIMENT_INTERFERENCE_MATRIX=1",
      "THEME_EXPERIMENT_INTERFERENCE_BAN_PP=2",
      "THEME_EXPERIMENT_INTERFERENCE_BUMP_PP=1.2",
    ],
    bq: "experiment_interference_matrix_daily → POST /api/webhooks/bigquery-interference-matrix",
    cron: "/api/cron/storefront-experiment-interference-holdout (0 6 * * *)",
    gate: "interferencePassed + auto postWinnerHoldoutPercent bump",
    secret: "BIGQUERY_INTERFERENCE_MATRIX_WEBHOOK_SECRET",
  },
  q2_wasm: {
    env: ["THEME_EXPERIMENT_WASM_ASSIGNMENT=1", "THEME_EXPERIMENT_WASM_SLO_US=1000", "EDGE_WASM_ASSIGNMENT_URL"],
    middleware: "assignArmWasmKernel before LinUCB; x-kos-wasm-assign-* headers",
    fallback: "TS assignArmLinUcb when SLO exceeded",
  },
  q5_posteriors: {
    env: ["THEME_EXPERIMENT_CAUSAL_POSTERIORS=1"],
    bq: "experiment_causal_posteriors_stream → POST /api/webhooks/bigquery-causal-posteriors",
    ui: "ThemeExperimentCausalPosteriorsCard + partial rollback preview diff",
    secret: "BIGQUERY_CAUSAL_POSTERIORS_WEBHOOK_SECRET",
  },
  q3_private_link: {
    env: [
      "THEME_EXPERIMENT_BQ_PRIVATE_LINK=1",
      "GCP_VPC_SC_PERIMETER",
      "BQ_PRIVATE_LINK_INGEST_HOST",
      "AUDIT_ARCHIVE_S3_CMEK_KEY_ARN",
      "AUDIT_ARCHIVE_CMEK_ROTATION_DAYS=90",
    ],
    webhook: "POST /api/webhooks/bigquery-workspace-acl",
    cron: "/api/cron/experiment-bq-private-link-audit (0 3 * * 1)",
    s3: "SSE-KMS on audit archive when CMEK ARN set",
    secret: "BIGQUERY_WORKSPACE_ACL_WEBHOOK_SECRET",
  },
  q4_iso27001: {
    env: ["ISO27001_ATTESTATION_OUT_DIR"],
    cron: "/api/cron/iso27001-quarterly-attestation (0 6 1 1,4,7,10 *)",
    mapping: "SOC2 CC6.1/CC7.2/CC8.1 → ISO A.5.1/A.8.15/A.8.24",
    s3: "s3://experiment-audit/iso27001/{quarter}/attestation.pdf",
  },
  phase_r: "Implemented — run npm run ops:phase-r-prod-wiring",
};

console.log(JSON.stringify(phaseQChecklist, null, 2));
