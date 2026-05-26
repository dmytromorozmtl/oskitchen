#!/usr/bin/env tsx
/**
 * Phase AD+ — sci-fi tracks AD1→AD2→AD5→AD3→AD4 + hardening continuation.
 * Run: npm run ops:phase-ad-prod-wiring
 */

const phaseAdChecklist = {
  phase: "AD+",
  recommended_order: [
    "AD1 Indo-Pacific compact",
    "AD2 EU AI Act live registry streaming",
    "AD5 Cosmic web federation",
    "AD3 Hypergraph evolution (L2 anchor)",
    "AD4 Prefrontal ethics board",
    "Hardening: snarkjs staging + publish-deny E2E + checkout E2E + k6 CI + Tier 2 game-day",
  ],
  ad1_indo_pacific: {
    env: [
      "THEME_EXPERIMENT_INDO_PACIFIC_COMPACT=1",
      "THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT=1",
      "THEME_EXPERIMENT_ASEAN_OBSERVER_NATIONS=SG,MY,TH",
    ],
    cron: "/api/cron/indo-pacific-compact-sync (0 16 1 * *)",
    gate: "indoPacificCompactPassed",
    header: "x-kos-indo-pacific-compact",
    pairs: "AA3 Five Eyes+",
  },
  ad2_eu_live_registry: {
    env: [
      "THEME_EXPERIMENT_EU_AI_ACT_LIVE_REGISTRY=1",
      "THEME_EXPERIMENT_EU_AI_OFFICE_LIVE_API=1",
      "EU_AI_REGISTRY_STREAM_WEBHOOK_SECRET",
      "KAFKA_EU_CONFORMITY_TOPIC=eu-ai-conformity-events",
    ],
    cron: "/api/cron/eu-ai-act-live-registry-sync (*/30 * * * *)",
    webhook: "/api/webhooks/eu-ai-act-live-registry",
    client: "pollEuRegistryStreamEvent in eu-ai-office-api-client.ts",
    gate: "euAiActLiveRegistryPassed",
    pairs: "AA4 EU continuous conformity",
  },
  ad5_cosmic_web: {
    env: [
      "THEME_EXPERIMENT_COSMIC_WEB_FEDERATION=1",
      "THEME_EXPERIMENT_WORKSPACE_PEER_DISCOVERY=1",
      "THEME_EXPERIMENT_WORMHOLE_LATENCY_SLO_MS=500",
    ],
    cron: "/api/cron/cosmic-web-federation-sync (0 6 * * 0)",
    kafka: "relayType cosmic_web via mesh-kafka-relay",
    gate: "cosmicWebFederationPassed",
    pairs: "AA5 intergalactic mesh",
  },
  ad3_hypergraph_evolution: {
    env: [
      "THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION=1",
      "THEME_EXPERIMENT_HYPERGRAPH_L2_CHAIN_ID=kos-l2-rollup",
      "HYPERGRAPH_L2_NOTARY_URL (optional)",
    ],
    cron: "/api/cron/hypergraph-evolution-anchor (0 12 * * *)",
    dna_audit: "evolveHypergraphFromVerifiedDag after AC1 rollup",
    gate: "hypergraphEvolutionPassed",
    pairs: "AC1 hypergraph ZK verified DAG",
  },
  ad4_ethics_board: {
    env: [
      "THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD=1",
      "THEME_EXPERIMENT_ETHICS_BOARD_AUTO_APPROVE=1 (staging sim only)",
    ],
    cron: "/api/cron/prefrontal-ethics-board-sync (*/40 * * * *)",
    organoid: "applyEthicsVetoToWetwareJson after prefrontal mesh",
    gate: "prefrontalEthicsBoardPassed",
    dna: "ethics_review events in DNA audit trail",
    pairs: "AC2 prefrontal organoid mesh",
  },
  hardening: {
    snarkjs_staging: "scripts/staging-circom-dna-rollup.sh",
    e2e_publish_deny: "e2e/theme-experiment-publish-gates.spec.ts — AC1 without AA1",
    checkout_e2e: "e2e/storefront-checkout-turnstile.spec.ts + experiment cookie",
    k6_ci: "npm run test:k6:edge-assign-smoke",
    tier2_game_day: "npm run ops:tier-2-staging-game-day",
  },
  tests: {
    phase_ad: "tests/unit/theme-experiment-phase-ad.test.ts",
    publish_gates: "tests/integration/theme-experiment-publish-gates.test.ts",
  },
  all_ad_env_flags: [
    "THEME_EXPERIMENT_INDO_PACIFIC_COMPACT=1",
    "THEME_EXPERIMENT_EU_AI_ACT_LIVE_REGISTRY=1",
    "THEME_EXPERIMENT_COSMIC_WEB_FEDERATION=1",
    "THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION=1",
    "THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD=1",
  ],
  phase_ae: "Implemented — run npm run ops:phase-ae-prod-wiring",
};

console.log(JSON.stringify(phaseAdChecklist, null, 2));
