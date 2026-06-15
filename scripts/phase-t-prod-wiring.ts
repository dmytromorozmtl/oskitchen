#!/usr/bin/env tsx
/**
 * Phase T+ — production wiring checklist.
 * Run: npm run ops:phase-t-prod-wiring
 */

const phaseTChecklist = {
  phase: "T+",
  recommended_order: [
    "T1 Homomorphic encrypted metrics",
    "T2 QUBO quantum bandit",
    "T5 Closed-loop causal discovery",
    "T3 CMMC Level 3",
    "T4 UK AI Safety transparency",
  ],
  t1_homomorphic: {
    env: [
      "THEME_EXPERIMENT_HOMOMORPHIC_METRICS=1",
      "THEME_EXPERIMENT_HOMOMORPHIC_NOISE_BUDGET=100",
      "THEME_EXPERIMENT_HOMOMORPHIC_NOISE_SCALE=8",
    ],
    bq: "experiment_homomorphic_arm_daily → POST /api/webhooks/bigquery-homomorphic-metrics",
    secret: "BIGQUERY_HOMOMORPHIC_METRICS_WEBHOOK_SECRET",
    gate: "homomorphicMetricsPassed — blocks when noise budget exhausted or aggregation incomplete",
    note: "Pairs with S1 visitorSealHash in BQ cells (no raw PII)",
  },
  t2_qubo: {
    env: [
      "THEME_EXPERIMENT_QUBO_BANDIT=1",
      "THEME_EXPERIMENT_QUBO_MIN_CELLS=8",
      "THEME_EXPERIMENT_QUBO_SLO_US=1000",
      "THEME_EXPERIMENT_WASM_ASSIGNMENT=1",
      "THEME_EXPERIMENT_COMPOSITIONAL_UI=1",
    ],
    middleware: "assignArmQuboKernel when factorial cells > 8 (DB read for compositional snapshot)",
    headers: "x-kos-qubo-assign-us, x-kos-qubo-energy, x-kos-qubo-factorial",
    gate: "quboBanditPassed",
  },
  t5_causal_discovery: {
    env: [
      "THEME_EXPERIMENT_CAUSAL_DISCOVERY_AGENT=1",
      "THEME_EXPERIMENT_CAUSAL_DAG=1",
      "THEME_EXPERIMENT_INTERFERENCE_MATRIX=1",
      "THEME_EXPERIMENT_HOLDOUT_WS=1",
      "THEME_EXPERIMENT_DISCOVERY_APPROVAL_PP=1.5",
    ],
    bq: "experiment_outcomes → POST /api/webhooks/bigquery-causal-discovery-outcomes",
    cron: "/api/cron/storefront-experiment-causal-discovery (0 */4 * * *)",
    approve: "POST /api/storefront/experiment/causal-discovery/approve",
    gate: "causalDiscoveryPassed — pendingApproval blocks publish",
  },
  t3_cmmc_l3: {
    env: ["THEME_EXPERIMENT_CMMC_L3=1", "THEME_EXPERIMENT_FEDRAMP_HIGH=1", "CMMC_L3_OUT_DIR"],
    cron: "/api/cron/cmmc-l3-monitoring (0 8 1 * *)",
    s3: "s3://experiment-audit/cmmc-l3/{period}/monitoring.json",
    crosswalk: "FedRAMP High controls → CMMC L3 practices + NIST 800-171 refs",
  },
  t4_uk_ai_safety: {
    env: [
      "THEME_EXPERIMENT_UK_AI_SAFETY=1",
      "THEME_EXPERIMENT_EU_AI_ACT=1",
      "UK_AI_SAFETY_TRANSPARENCY_URL",
    ],
    cron: "/api/cron/uk-ai-safety-seed (0 3 1 * *)",
    gate: "ukAiSafetyPassed — capability evals + red-team for high risk",
    requires: "S4 EU AI Act + S5 scientist guardrails for eval seeding",
  },
  phase_u: "Implemented — run npm run ops:phase-u-prod-wiring",
  phase_v_preview: {
    v1: "Confidential computing TEE assignment",
    v2: "Photonic co-processor assign",
    v3: "IRAP / Essential Eight (AU)",
    v4: "NIST AI RMF 1.0 pack",
    v5: "Global experiment mesh CRDT",
  },
};

console.log(JSON.stringify(phaseTChecklist, null, 2));
