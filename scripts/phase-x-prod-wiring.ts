#!/usr/bin/env tsx
/**
 * Phase X+ — production wiring checklist.
 * Run: npm run ops:phase-x-prod-wiring
 */

const phaseXChecklist = {
  phase: "X+",
  recommended_order: [
    "X1 Post-quantum DNA archival",
    "X2 Online wetware calibration",
    "X5 Cislunar DTN production",
    "X3 PSPF + NZ DTA",
    "X4 ISO 42001 Stage 2 surveillance",
  ],
  x1_pqc_dna: {
    env: [
      "THEME_EXPERIMENT_PQC_DNA_ARCHIVAL=1",
      "THEME_EXPERIMENT_PQC_DNA_ALGORITHM=ML-DSA-65",
      "THEME_EXPERIMENT_DNA_AUDIT_TRAIL=1",
      "THEME_EXPERIMENT_QUANTUM_SAFE=1",
      "PQC_DNA_ARCHIVAL_OUT_DIR",
    ],
    internal: "PQC seal chained in POST /api/internal/experiment-dna-audit-block",
    cron: "/api/cron/pqc-dna-archival-seal (0 7 * * *)",
    gate: "pqcDnaArchivalPassed — ML-DSA seals cover all DNA blocks",
    s3: "s3://experiment-audit/pqc-dna-archival/{store}/{period}/seals.json",
    pairs: "W1 DNA trail + S1 ML-KEM hybrid buckets",
  },
  x2_wetware_calibration: {
    env: [
      "THEME_EXPERIMENT_WETWARE_CALIBRATION=1",
      "THEME_EXPERIMENT_WETWARE_LEARNING_RATE=0.05",
      "THEME_EXPERIMENT_WETWARE_MIN_OUTCOMES=20",
      "THEME_EXPERIMENT_BIO_NEURON_ASSIGN=1",
      "THEME_EXPERIMENT_NEUROMORPHIC_ASSIGN=1",
    ],
    internal: "POST /api/internal/experiment-wetware-calibrate (middleware per assign)",
    headers: "x-kos-wetware-calibration",
    gate: "wetwareCalibrationPassed — ≥20 outcomes when bio path active",
    pairs: "W2 wetware assign + U2 neuromorphic",
  },
  x5_cislunar_dtn: {
    env: [
      "THEME_EXPERIMENT_CISLUNAR_DTN=1",
      "THEME_EXPERIMENT_CISLUNAR_LATENCY_SLO_MS=180000",
      "THEME_EXPERIMENT_DTN_MESH=1",
      "THEME_EXPERIMENT_GLOBAL_MESH=1",
      "EXPERIMENT_CISLUNAR_DTN_WEBHOOK_SECRET",
    ],
    webhook: "POST /api/webhooks/experiment-cislunar-dtn-bundle",
    cron: "/api/cron/storefront-experiment-cislunar-dtn-sync (*/50 * * * *)",
    gate: "cislunarDtnPassed — BPv7 delivery ≥92%, p99 within SLO, mesh quorum",
    nodes: "leo | geo_relay | lunar_relay | mars_edge_prod",
    headers: "x-kos-cislunar-dtn, x-kos-cislunar-bpv7, x-kos-cislunar-p99-ms",
  },
  x3_pspf_nz_dta: {
    env: ["THEME_EXPERIMENT_PSPF_NZ_DTA=1", "THEME_EXPERIMENT_ISMAP_NZISM=1", "PSPF_NZ_DTA_OUT_DIR"],
    cron: "/api/cron/pspf-nz-dta-monitoring (0 12 1 * *)",
    gate: "pspfNzDtaPassed — PSPF core + NZ DTA principles pass",
    s3: "s3://experiment-audit/pspf-nz-dta/{period}/monitoring.json",
    pairs: "W3 ISMAP/NZISM crosswalk",
  },
  x4_iso_42001_stage2: {
    env: [
      "THEME_EXPERIMENT_ISO_42001_STAGE2=1",
      "THEME_EXPERIMENT_ISO_42001=1",
      "THEME_EXPERIMENT_ISO_42001_REVIEW_CADENCE_DAYS=90",
      "THEME_EXPERIMENT_NIST_AI_RMF=1",
    ],
    cron: "/api/cron/iso-42001-stage2-surveillance (0 6 20 * *)",
    gate: "iso42001Stage2Passed — CAPA closed, management review in cadence",
    pairs: "W4 ISO 42001 + V4 NIST AI RMF",
  },
  all_x_env_flags: [
    "THEME_EXPERIMENT_PQC_DNA_ARCHIVAL=1",
    "THEME_EXPERIMENT_WETWARE_CALIBRATION=1",
    "THEME_EXPERIMENT_CISLUNAR_DTN=1",
    "THEME_EXPERIMENT_PSPF_NZ_DTA=1",
    "THEME_EXPERIMENT_ISO_42001_STAGE2=1",
  ],
  phase_y: "Implemented — run npm run ops:phase-y-prod-wiring",
};

console.log(JSON.stringify(phaseXChecklist, null, 2));
