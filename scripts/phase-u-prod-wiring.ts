#!/usr/bin/env tsx
/**
 * Phase U+ — production wiring checklist.
 * Run: npm run ops:phase-u-prod-wiring
 */

const phaseUChecklist = {
  phase: "U+",
  recommended_order: [
    "U1 ZK assignment fairness",
    "U2 Neuromorphic edge assign",
    "U5 Multi-agent orchestrator",
    "U3 StateRAMP + TX-RAMP",
    "U4 US EO 14110 AI inventory",
  ],
  u1_zk_fairness: {
    env: [
      "THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS=1",
      "THEME_EXPERIMENT_ZK_MIN_PROOFS=10",
      "THEME_EXPERIMENT_ZK_SALT=<rotate>",
      "STOREFRONT_MIDDLEWARE_SECRET",
    ],
    internal: "POST /api/internal/experiment-zk-proof (fire-and-forget after assign)",
    gate: "zkAssignmentFairnessPassed — verification rate ≥99% after min proofs",
    pairs: "S1 quantum seal kem hash + T1 homomorphic visitorSealHash in BQ",
  },
  u2_neuromorphic: {
    env: [
      "THEME_EXPERIMENT_NEUROMORPHIC_ASSIGN=1",
      "THEME_EXPERIMENT_NEUROMORPHIC_MIN_CELLS=16",
      "THEME_EXPERIMENT_NEUROMORPHIC_SLO_US=500",
      "THEME_EXPERIMENT_QUBO_BANDIT=1",
      "THEME_EXPERIMENT_COMPOSITIONAL_UI=1",
    ],
    middleware: "Priority: neuromorphic (>16 cells) → QUBO (>8) → WASM",
    headers: "x-kos-neuro-assign-us, x-kos-neuro-spikes",
    gate: "neuromorphicAssignPassed",
  },
  u5_multi_agent: {
    env: [
      "THEME_EXPERIMENT_MULTI_AGENT_ORCHESTRATOR=1",
      "THEME_EXPERIMENT_ORCHESTRATOR_SLACK_RISK=0.6",
      "STOREFRONT_EXPERIMENT_APPROVAL_SLACK_WEBHOOK_URL",
    ],
    cron: "/api/cron/storefront-experiment-multi-agent-orchestrator (0 */2 * * *)",
    approve: "GET /api/storefront/experiment/orchestrator/approve?token=&storefrontId=",
    flow: "Planner → Critic → Executor (T5 discovery + S5 scientist)",
    gate: "multiAgentOrchestratorPassed — pendingSlack blocks publish",
  },
  u3_stateramp_txramp: {
    env: ["THEME_EXPERIMENT_STATERAMP_TXRAMP=1", "THEME_EXPERIMENT_CMMC_L3=1", "STATERAMP_TXRAMP_OUT_DIR"],
    cron: "/api/cron/stateramp-txramp-monitoring (0 9 1 * *)",
    s3: "s3://experiment-audit/stateramp-txramp/{period}/monitoring.json",
  },
  u4_eo_14110: {
    env: [
      "THEME_EXPERIMENT_EO_14110_INVENTORY=1",
      "THEME_EXPERIMENT_EU_AI_ACT=1",
      "THEME_EXPERIMENT_UK_AI_SAFETY=1",
      "EO_14110_REPORTING_URL",
    ],
    cron: "/api/cron/eo-14110-inventory-seed (0 4 1 * *)",
    gate: "eo14110InventoryPassed — dual-use screening + open incidents",
  },
  phase_v: "Implemented — run npm run ops:phase-v-prod-wiring",
  phase_w: "Implemented — run npm run ops:phase-w-prod-wiring",
};

console.log(JSON.stringify(phaseUChecklist, null, 2));
