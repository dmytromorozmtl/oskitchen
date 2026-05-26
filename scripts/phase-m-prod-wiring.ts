#!/usr/bin/env tsx
/**
 * Phase M+ — production wiring checklist.
 * Run: npm run ops:phase-m-prod-wiring
 */

const phaseMChecklist = {
  phase: "M+",
  recommended_order: ["M1 Bayesian BQ", "M2 Contextual bandit", "M5 ML model", "M3 Edge quorum", "M4 Auditor SSO"],
  m1_bayesian_bq: {
    env: [
      "THEME_EXPERIMENT_BAYESIAN=1",
      "THEME_EXPERIMENT_BAYESIAN_BQ_ONLY=1",
      "THEME_EXPERIMENT_BAYESIAN_BQ_PRIMARY=1",
      "BIGQUERY_BAYESIAN_PRIOR_WEBHOOK_SECRET",
      "BAYESIAN_PRIOR_MAX_AGE_HOURS=48",
    ],
    webhook: "POST /api/webhooks/bigquery-bayesian-prior",
    bq: "Nightly PyMC/Stan batch → bayesianPrior in themeExperimentJson",
    decision: "publish_draft only when BQ posterior fresh (no live conjugate)",
    ui: "Advanced → Bayesian card + credible interval fan chart",
  },
  m2_contextual_bandit: {
    env: ["THEME_EXPERIMENT_CONTEXTUAL_BANDIT=1", "THEME_EXPERIMENT_MAB=1"],
    json: {
      segmentArmWeights: {
        default: { published: 50, draft: 50 },
        mobile: { published: 45, draft: 55 },
        returning: { published: 40, draft: 60 },
      },
    },
    cron: "/api/cron/storefront-experiment-contextual-bandit (30 5 * * *)",
    webhook: "POST /api/webhooks/bigquery-off-policy",
    middleware: "kos_ab_segment cookie + visitorSegment assignment",
  },
  m5_ml_model: {
    env: [
      "THEME_EXPERIMENT_ML_SHADOW=1",
      "THEME_EXPERIMENT_ML_MODEL=1",
      "THEME_EXPERIMENT_ML_RISK_THRESHOLD=65",
    ],
    cron: "feature-store (0 2 * * *) trains mlRegretModel from featureStoreHistory",
    shadow: "Logs heuristic vs model; model blocks only when ML_MODEL=1",
  },
  m3_edge_quorum: {
    env: ["THEME_EXPERIMENT_EDGE_QUORUM=1", "EDGE_CONFIG_ID_REPLICA", "VERCEL_API_TOKEN"],
    behavior: "PATCH primary + replica; CRDT merge on version mismatch before sync",
  },
  m4_auditor: {
    env: [
      "AUDIT_ARCHIVE_S3_BUCKET",
      "AUDIT_ARCHIVE_S3_PREFIX",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "EXPERIMENT_AUDITOR_USER_IDS (optional)",
    ],
    role: "PLATFORM_READONLY_AUDITOR → Prisma STANDARD_USER",
    path: "/dashboard/compliance/experiment-audit",
    s3: "manifest.json + presigned CSV downloads (no readFile)",
  },
  phase_n_preview: {
    n1: "Full PyMC GPU batch + multi-metric hierarchical model",
    n2: "LinUCB contextual bandit with live feature stream",
    n3: "Global edge quorum + conflict-free replicated assignment",
    n4: "SCIM auditor provisioning + audit log RLS policies",
    n5: "XGBoost on Vertex + champion/challenger auto-promote",
  },
};

console.log(JSON.stringify(phaseMChecklist, null, 2));
