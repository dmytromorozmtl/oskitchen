#!/usr/bin/env tsx
/**
 * Phase R+ — production wiring checklist.
 * Run: npm run ops:phase-r-prod-wiring
 */

const phaseRChecklist = {
  phase: "R+",
  recommended_order: [
    "R1 Federated learning",
    "R2 eBPF telemetry",
    "R5 Compositional UI",
    "R3 HIPAA BAA",
    "R4 PCI-DSS SAQ",
  ],
  r1_federated: {
    env: [
      "THEME_EXPERIMENT_FEDERATED_LEARNING=1",
      "THEME_EXPERIMENT_FEDERATED_EPSILON=1.0",
      "THEME_EXPERIMENT_FEDERATED_BUDGET=10",
    ],
    bq: "federated_gradient_round → POST /api/webhooks/bigquery-federated-gradients",
    gate: "federatedLearningPassed + publish block when privacy budget = 0",
    secret: "BIGQUERY_FEDERATED_GRADIENTS_WEBHOOK_SECRET",
    note: "No raw PII in payload — gradientHash + norms only",
  },
  r2_ebpf: {
    env: [
      "THEME_EXPERIMENT_EBPF_TELEMETRY=1",
      "THEME_EXPERIMENT_EBPF_SLO_US=500",
      "THEME_EXPERIMENT_ARM_DRIFT_PP=15",
      "STOREFRONT_MIDDLEWARE_SECRET",
    ],
    internal: "POST /api/internal/experiment-ebpf-sample (middleware fire-and-forget)",
    cron: "/api/cron/storefront-experiment-ebpf-purge (*/10 * * * *)",
    behavior: "arm drift >15pp → purge CDN-Cache-Tag per arm",
  },
  r5_compositional: {
    env: ["THEME_EXPERIMENT_COMPOSITIONAL_UI=1", "THEME_EXPERIMENT_COMPOSITIONAL_MIN_CELLS=4"],
    json: "compositionalExperiment.slots (header/hero/cta/footer)",
    gate: "compositionalPassed — min factorial cells",
  },
  r3_hipaa: {
    env: ["THEME_EXPERIMENT_HIPAA_BAA=1", "HIPAA_BAA_OUT_DIR"],
    cron: "/api/cron/hipaa-baa-evidence-binder (0 4 1 * *)",
    auditor: "redactPhiFromMetadata in experiment-auditor-redact",
    s3: "s3://experiment-audit/hipaa-baa/{period}/evidence-binder.pdf",
  },
  r4_pci: {
    env: ["THEME_EXPERIMENT_PCI_DSS_SAQ=1", "EXPERIMENT_AUDIT_REDACT_PAN=1", "PCI_SAQ_OUT_DIR"],
    cron: "/api/cron/pci-dss-saq-attestation (0 5 1 1,4,7,10 *)",
    checks: "PCI-1..5 cardholder boundary (Stripe, no PAN in audit)",
  },
  phase_s: "Implemented — run npm run ops:phase-s-prod-wiring",
  phase_t_preview: {
    t1: "Homomorphic encrypted experiment metrics",
    t2: "QUBO quantum bandit assignment",
    t3: "CMMC Level 3 crosswalk",
    t4: "UK AI Safety transparency pack",
    t5: "Closed-loop causal discovery agent",
  },
};

console.log(JSON.stringify(phaseRChecklist, null, 2));
