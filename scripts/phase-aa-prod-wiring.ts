#!/usr/bin/env tsx
/**
 * Phase AA+ — production wiring checklist.
 * Run: npm run ops:phase-aa-prod-wiring
 */

const phaseAaChecklist = {
  phase: "AA+",
  recommended_order: [
    "AA1 Recursive ZK DNA rollup",
    "AA2 Hippocampal organoid mesh",
    "AA5 Intergalactic mesh federation",
    "AA3 Five Eyes+ compact",
    "AA4 EU AI Office continuous conformity",
  ],
  aa1_recursive_zk: {
    env: [
      "THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP=1",
      "THEME_EXPERIMENT_ZK_DNA_ROLLUP=1",
      "THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS=1",
      "THEME_EXPERIMENT_RECURSIVE_ZK_MIN_BATCHES=1",
      "THEME_EXPERIMENT_RECURSIVE_ZK_BATCH_SIZE=4",
    ],
    cron: "/api/cron/recursive-zk-dna-rollup (0 10 * * *)",
    internal:
      "batchRecursiveZkFromRollups in POST /api/internal/experiment-dna-audit-block after Z1 rollup",
    gate: "recursiveZkDnaRollupPassed — batched Groth16 over rollup chain",
    header: "x-kos-recursive-zk-dna-rollup",
    pairs: "Z1 ZK DNA rollup + U1 ZK fairness",
  },
  aa2_hippocampal: {
    env: [
      "THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH=1",
      "THEME_EXPERIMENT_HIPPOCAMPAL_WINDOW_TTL_MS=3600000",
      "THEME_EXPERIMENT_HIPPOCAMPAL_MIN_WINDOWS=2",
      "THEME_EXPERIMENT_CORTICAL_ORGANOID_MESH=1",
    ],
    cron: "/api/cron/hippocampal-organoid-mesh-sync (*/50 * * * *)",
    middleware: "applyHippocampalMeshToWetwareJson after cortical mesh in organoid path",
    headers:
      "x-kos-hippocampal-organoid-mesh, x-kos-hippocampal-windows, x-kos-hippocampal-synced",
    gate: "hippocampalOrganoidMeshPassed — temporal plasticity windows synced",
    pairs: "Z2 cortical organoid mesh",
  },
  aa5_intergalactic: {
    env: [
      "THEME_EXPERIMENT_INTERGALACTIC_MESH_FEDERATION=1",
      "THEME_EXPERIMENT_WORMHOLE_LATENCY_SLO_MS=500",
      "THEME_EXPERIMENT_GALACTIC_MESH=1",
      "THEME_EXPERIMENT_GLOBAL_MESH=1",
    ],
    cron: "/api/cron/intergalactic-mesh-federation-sync (0 5 * * 0 weekly)",
    gate: "intergalacticMeshFederationPassed — Laniakea quorum + wormhole SLO",
    headers: "x-kos-intergalactic-mesh, x-kos-laniakea-clusters, x-kos-wormhole-slo-met",
    clusters: "virgo | hydra_centaurus | fornax",
    pairs: "Z5 galactic mesh + V5 global mesh",
  },
  aa3_five_eyes_plus: {
    env: [
      "THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT=1",
      "THEME_EXPERIMENT_FIVE_EYES_CLOUD_COMPACT=1",
      "THEME_EXPERIMENT_PQC_DNA_ARCHIVAL=1",
      "FIVE_EYES_PLUS_COMPACT_OUT_DIR",
    ],
    cron: "/api/cron/five-eyes-plus-compact-monitoring (0 15 1 * *)",
    gate: "fiveEyesPlusCompactPassed — JP/IN observers + quantum-safe residency",
    pairs: "Z3 Five Eyes + X1 PQC DNA",
  },
  aa4_eu_continuous: {
    env: [
      "THEME_EXPERIMENT_EU_AI_OFFICE_CONTINUOUS_CONFORMITY=1",
      "THEME_EXPERIMENT_EU_AI_OFFICE_NOTIFIED_BODY=1",
      "THEME_EXPERIMENT_EU_AI_ACT=1",
      "THEME_EXPERIMENT_EU_AI_OFFICE_DELTA_MAX_AGE_MS=86400000",
      "EU_AI_OFFICE_CONFORMITY_WEBHOOK_SECRET",
    ],
    webhook:
      "POST /api/webhooks/eu-ai-office-conformity-sync (chains continuous delta when AA4 on)",
    cron: "/api/cron/eu-ai-office-continuous-conformity-sync (0 */6 * * *)",
    gate: "euAiOfficeContinuousConformityPassed — Article 43 delta within max age",
    pairs: "Z4 EU notified body + S4 EU AI Act",
  },
  all_aa_env_flags: [
    "THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP=1",
    "THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH=1",
    "THEME_EXPERIMENT_INTERGALACTIC_MESH_FEDERATION=1",
    "THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT=1",
    "THEME_EXPERIMENT_EU_AI_OFFICE_CONTINUOUS_CONFORMITY=1",
  ],
  phase_ab: "Implemented — run npm run ops:phase-ab-prod-wiring (production hardening)",
};

console.log(JSON.stringify(phaseAaChecklist, null, 2));
