#!/usr/bin/env tsx
/**
 * Phase V+ — production wiring checklist.
 * Run: npm run ops:phase-v-prod-wiring
 */

const phaseVChecklist = {
  phase: "V+",
  recommended_order: [
    "V1 TEE attested assignment",
    "V2 Photonic co-processor assign",
    "V5 Global experiment mesh",
    "V3 IRAP + Essential Eight",
    "V4 NIST AI RMF 1.0",
  ],
  v1_tee: {
    env: [
      "THEME_EXPERIMENT_TEE_ASSIGN=1",
      "THEME_EXPERIMENT_TEE_ENCLAVE=intel-sgx|amd-sev",
      "THEME_EXPERIMENT_TEE_ATTESTATION_TTL_H=24",
      "STOREFRONT_MIDDLEWARE_SECRET",
    ],
    internal: "POST /api/internal/experiment-tee-attest",
    gate: "teeAttestationPassed — ≥99% valid SGX/SEV quotes",
    pairs: "U1 ZK + S1 quantum hybrid bucket in enclave measurement",
  },
  v2_photonic: {
    env: [
      "THEME_EXPERIMENT_PHOTONIC_ASSIGN=1",
      "THEME_EXPERIMENT_PHOTONIC_MIN_CELLS=32",
      "THEME_EXPERIMENT_PHOTONIC_SLO_US=300",
      "THEME_EXPERIMENT_COMPOSITIONAL_UI=1",
    ],
    middleware: "Priority: photonic (>32) → neuromorphic (>16) → QUBO (>8) → WASM",
    headers: "x-kos-photonic-assign-us, x-kos-photonic-power-mw",
    gate: "photonicAssignPassed",
  },
  v5_global_mesh: {
    env: [
      "THEME_EXPERIMENT_GLOBAL_MESH=1",
      "THEME_EXPERIMENT_GLOBAL_MESH_QUORUM=0.67",
      "THEME_EXPERIMENT_FEDERATED_LEARNING=1",
      "BIGQUERY_GLOBAL_MESH_WEBHOOK_SECRET",
    ],
    webhook: "POST /api/webhooks/bigquery-global-mesh-outcomes",
    cron: "/api/cron/storefront-experiment-global-mesh-sync (*/30 * * * *)",
    gate: "globalMeshPassed — 2/3 clouds + federated privacy budget",
  },
  v3_irap_e8: {
    env: ["THEME_EXPERIMENT_IRAP_ESSENTIAL8=1", "THEME_EXPERIMENT_STATERAMP_TXRAMP=1", "IRAP_ESSENTIAL8_OUT_DIR"],
    cron: "/api/cron/irap-essential-eight-monitoring (0 10 1 * *)",
    s3: "s3://experiment-audit/irap-essential-eight/{period}/monitoring.json",
  },
  v4_nist_rmf: {
    env: [
      "THEME_EXPERIMENT_NIST_AI_RMF=1",
      "THEME_EXPERIMENT_EO_14110_INVENTORY=1",
      "THEME_EXPERIMENT_UK_AI_SAFETY=1",
    ],
    cron: "/api/cron/nist-ai-rmf-seed (0 5 1 * *)",
    gate: "nistAiRmfPassed — Govern/Map/Measure/Manage complete",
  },
  phase_w: "Implemented — run npm run ops:phase-w-prod-wiring",
};

console.log(JSON.stringify(phaseVChecklist, null, 2));
