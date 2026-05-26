#!/usr/bin/env tsx
/**
 * Phase L+ — production wiring checklist.
 * Run: npm run ops:phase-l-prod-wiring
 */

const phaseLChecklist = {
  phase: "L+",
  recommended_order: ["L2 MAB", "L1 Bayesian", "L5 ML risk", "L3 edge CRDT", "L4 auditor portal"],
  l2_mab: {
    env: ["THEME_EXPERIMENT_MAB=1"],
    json: {
      allocationMode: "mab",
      experimentArms: [
        { id: "published", weight: 34, label: "Control" },
        { id: "draft", weight: 33, label: "Draft B" },
        { id: "variant_c", weight: 33, presetId: "modern_bold", label: "Variant C" },
      ],
    },
    cron: "/api/cron/storefront-experiment-mab-update (0 5 * * *)",
    ui: "Advanced → Bandit card (exploration %, regret)",
  },
  l1_bayesian: {
    env: ["THEME_EXPERIMENT_BAYESIAN=1", "THEME_EXPERIMENT_GEO_CAUSAL=1"],
    decision: "P(lift > 2pp) >= 95% OR frequentist publish_draft",
    bq: "Nightly PyMC/Stan → ga4ParityBqSnapshot / bayesianPrior in JSON (future)",
    geo: "geoMarkets[] in themeExperimentJson for CausalImpact-style lift",
    ui: "Advanced → Bayesian posterior card",
  },
  l5_ml_risk: {
    env: ["THEME_EXPERIMENT_ML_RISK=1", "THEME_EXPERIMENT_ML_RISK_THRESHOLD=65"],
    cron: "/api/cron/storefront-experiment-feature-store (0 2 * * *)",
    gate: "auto-conclude blocked when risk score >= threshold",
  },
  l3_edge: {
    env: ["EDGE_CONFIG_ID_{WORKSPACE}", "EDGE_CONFIG_ID_FALLBACK"],
    crdt: "versionVector { logical, db, edge } in themeExperimentJson + edge payload",
    purge: "purgeWorkspaceExperimentArms after multi-store conclude",
  },
  l4_auditor: {
    path: "/dashboard/compliance/experiment-audit",
    cron: "/api/cron/storefront-experiment-audit-control (0 7 * * *)",
    exports: "Signed CSV + manifest.json",
  },
  phase_m_preview: {
    m1: "Full PyMC batch + BQ feature table",
    m2: "Contextual bandit (visitor segment features)",
    m3: "Edge Config multi-region write quorum",
    m4: "External auditor SSO + immutable S3 manifest UI",
    m5: "Trained regret model (XGBoost) replacing heuristic ML risk",
  },
};

console.log(JSON.stringify(phaseLChecklist, null, 2));
