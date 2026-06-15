#!/usr/bin/env tsx
/**
 * Phase AG+ — sci-fi tracks AG1→AG2→AG5→AG3→AG4 + post-AF hardening.
 * Run: npm run ops:phase-ag-prod-wiring
 */

const phaseAgChecklist = {
  phase: "AG+",
  recommended_order: [
    "AG1 Antarctic subglacial mesh — McMurdo–Palmer relay",
    "AG2 EU AI Act Art. 71 PMM live",
    "AG5 Multiverse counterfactual branches CRDT",
    "AG3 Hypergraph L5 compositional anchor",
    "AG4 Spinal cord motor publish throttle",
    "Hardening: Tier 2 game-day curl (22 crons), E2E ethics, merchant phase 7 preview",
  ],
  ag1_subglacial: {
    env: [
      "THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH=1",
      "THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH=1",
      "THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH=1",
    ],
    cron: "/api/cron/antarctic-subglacial-mesh-sync",
    gate: "antarcticSubglacialMeshPassed",
    header: "x-kos-antarctic-subglacial-mesh",
    pairs: "AF1 arctic + AE1 pan-Pacific",
  },
  ag2_eu_art71_pmm: {
    env: [
      "THEME_EXPERIMENT_EU_AI_ACT_ART71_PMM_LIVE=1",
      "THEME_EXPERIMENT_EU_AI_ACT_LIVE_REGISTRY=1",
      "THEME_EXPERIMENT_NIST_AI_RMF_LIVE_CONTROL_FEED=1",
      "KAFKA_EU_AI_ACT_PMM_TOPIC=eu-ai-act-pmm-events",
    ],
    cron: "/api/cron/eu-ai-act-art71-pmm-live-sync",
    webhook: "/api/webhooks/eu-ai-act-art71-pmm-live",
    gate: "euAiActArt71PmmLivePassed",
    publish_block: "Serious PMM incident open",
    pairs: "AD2 EU live registry + AF2 NIST stream",
  },
  ag5_counterfactual: {
    env: [
      "THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1",
      "THEME_EXPERIMENT_OMNIVERSE_CAUSAL_GRAPH_CRDT=1",
    ],
    cron: "/api/cron/multiverse-counterfactual-crdt-sync",
    gate: "multiverseCounterfactualCrdtPassed",
    pairs: "AF5 omniverse DAG",
  },
  ag3_hypergraph_l5: {
    env: [
      "THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR=1",
      "THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR=1",
      "THEME_EXPERIMENT_HYPERGRAPH_L5_CIRCOM=1",
    ],
    cron: "/api/cron/hypergraph-l5-compositional-anchor",
    dna_audit: "compositionalAnchorL5FromL4Stack after AF3 L4",
    gate: "hypergraphL5CompositionalAnchorPassed",
    pairs: "AF3 L4",
  },
  ag4_spinal: {
    env: [
      "THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE=1",
      "THEME_EXPERIMENT_BRAINSTEM_AUTONOMIC_GUARD=1",
      "THEME_EXPERIMENT_SPINAL_MAX_PUBLISH_ATTEMPTS=3",
    ],
    cron: "/api/cron/spinal-cord-publish-throttle-sync",
    middleware: "x-kos-spinal-throttle-ms",
    gate: "spinalCordPublishThrottlePassed",
    pairs: "AF4 brainstem",
  },
  hardening: {
    tier2_curl: "npm run ops:tier-2-staging-game-day-curl (STAGING_BASE_URL + CRON_SECRET)",
    e2e_ethics: "e2e/theme-experiment-ethics-review.spec.ts",
    merchant_phase_7: "Preview — merchant experiment tier-7 flags in ops:tier-prod-rollout when ready",
    production_rollout: "Enable AF flags via ops:phase-af-prod-wiring before AG; one flag group per day",
  },
  all_ag_env_flags: [
    "THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH=1",
    "THEME_EXPERIMENT_EU_AI_ACT_ART71_PMM_LIVE=1",
    "THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1",
    "THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR=1",
    "THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE=1",
  ],
  phase_ah: "Implemented — see npm run ops:phase-ah-prod-wiring",
};

console.log(JSON.stringify(phaseAgChecklist, null, 2));
