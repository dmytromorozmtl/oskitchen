#!/usr/bin/env tsx
/**
 * Phase S+ — production wiring checklist.
 * Run: npm run ops:phase-s-prod-wiring
 */

const phaseSChecklist = {
  phase: "S+",
  recommended_order: [
    "S1 Quantum-safe assignment",
    "S2 Holdout WebSocket control plane",
    "S5 Autonomous scientist",
    "S3 FedRAMP High P-ATO",
    "S4 EU AI Act pack",
  ],
  s1_quantum_safe: {
    env: [
      "THEME_EXPERIMENT_QUANTUM_SAFE=1",
      "THEME_EXPERIMENT_KEM_ROTATION_DAYS=90",
      "THEME_EXPERIMENT_KEM_SALT=<rotate-quarterly>",
      "STOREFRONT_MIDDLEWARE_SECRET",
    ],
    middleware: "hybridAssignmentBucket (60/40 weighted) replaces stableBucketPercent",
    internal: "POST /api/internal/experiment-quantum-seal (fire-and-forget)",
    gate: "quantumSafePassed — blocks publish when KEM seals older than rotation window",
    json: "themeExperimentJson.quantumSafeAssignment.seals[]",
  },
  s2_holdout_ws: {
    env: [
      "THEME_EXPERIMENT_HOLDOUT_WS=1",
      "THEME_EXPERIMENT_HOLDOUT_WS_SLO_MS=1000",
      "EXPERIMENT_HOLDOUT_WS_WEBHOOK_SECRET",
    ],
    webhook: "POST /api/webhooks/experiment-holdout-ws-push",
    cron: "/api/cron/storefront-experiment-holdout-ws-sync (* * * * *)",
    cookie: "kos_holdout_ws_ver synced to edge.version on stale client",
    gate: "holdoutWsPassed — p99 push latency across iad1/sfo1/dub1/sin1/syd1",
    json: "holdoutWsControlPlane.policyVersion + postWinnerHoldoutPercent",
  },
  s5_autonomous_scientist: {
    env: [
      "THEME_EXPERIMENT_AUTONOMOUS_SCIENTIST=1",
      "THEME_EXPERIMENT_SCIENTIST_MAX_RUNS=2",
      "THEME_EXPERIMENT_SCIENTIST_MIN_SAMPLE=200",
      "EXPERIMENT_SCIENTIST_WEBHOOK_SECRET",
    ],
    webhook: "POST /api/webhooks/experiment-scientist-proposal",
    cron: "/api/cron/storefront-experiment-autonomous-scientist (0 */6 * * *)",
    gate: "autonomousScientistPassed — high-risk proposals need human approval",
    note: "Cron evaluates proposed → running → concluded via evaluateExperimentProdDecision",
  },
  s3_fedramp_high: {
    env: ["THEME_EXPERIMENT_FEDRAMP_HIGH=1", "FEDRAMP_HIGH_OUT_DIR"],
    cron: "/api/cron/fedramp-high-monitoring (0 7 1 * *)",
    s3: "s3://experiment-audit/fedramp-high/{period}/monitoring.json + .pdf",
    crosswalk: "SOC2 CC* + ISO A.8.* → FedRAMP AC/AU/CM/SC/SI",
  },
  s4_eu_ai_act: {
    env: ["THEME_EXPERIMENT_EU_AI_ACT=1", "EU_AI_ACT_TRANSPARENCY_URL"],
    cron: "/api/cron/eu-ai-act-seed (0 2 1 * *)",
    gate: "euAiActPassed — model card required; high-risk needs oversight log",
    ui: "/dashboard/compliance/experiment-audit — EuAiActCard",
  },
  phase_t: "Implemented — run npm run ops:phase-t-prod-wiring",
  phase_u_preview: {
    u1: "ZK proof of assignment fairness",
    u2: "Neuromorphic edge assign",
    u3: "StateRAMP + TX-RAMP crosswalk",
    u4: "US EO 14110 AI inventory",
    u5: "Multi-agent experiment orchestrator",
  },
};

console.log(JSON.stringify(phaseSChecklist, null, 2));
