#!/usr/bin/env tsx
/**
 * Tiered production rollout for theme experiment (without enabling all 40+ flags at once).
 * Run: npm run ops:tier-prod-rollout
 */

const tierProdRollout = {
  title: "OS Kitchen Theme Experiment — Tiered Prod Rollout",
  tier_0_core_ab: {
    description: "Core A/B only — no advanced gates",
    env: {
      THEME_EXPERIMENT_STRICT_PUBLISH_GATES: "0",
      THEME_EXPERIMENT_PRODUCTION_HARDENING: "0",
      THEME_EXPERIMENT_CRYPTO_BACKEND: "sim",
    },
    enables: ["Traffic split", "SRM", "Sequential testing", "Edge sync"],
  },
  tier_1_prod_crypto: {
    description: "Production crypto backends",
    env: {
      THEME_EXPERIMENT_CRYPTO_BACKEND: "prod",
      THEME_EXPERIMENT_REQUIRE_PROD_CRYPTO: "1",
      CIRCOM_DNA_ROLLUP_VKEY_HASH: "<sha256 of verification_key.json>",
      CIRCOM_DNA_ROLLUP_WASM: "<path/to/circuit.wasm>",
      CIRCOM_DNA_ROLLUP_VKEY: "<path/to/circuit_final.zkey>",
      PQC_HSM_URL: "<liboqs or HSM endpoint>",
      SEAL_HOMOMORPHIC_CONTEXT_ID: "kos-ckks-8192",
      THEME_EXPERIMENT_SNARKJS_GROTH16: "1",
    },
    crons: ["recursive-zk-dna-rollup", "zk-dna-rollup", "pqc-dna-archival-seal"],
  },
  tier_2_strict_y_to_aa: {
    description: "Full compliance chain Y→Z→AA with strict dependency enforcement",
    env: {
      THEME_EXPERIMENT_STRICT_PUBLISH_GATES: "1",
      THEME_EXPERIMENT_HOMOMORPHIC_DNA_FEDERATION: "1",
      THEME_EXPERIMENT_ZK_DNA_ROLLUP: "1",
      THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP: "1",
      THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH: "1",
      THEME_EXPERIMENT_INTERGALACTIC_MESH_FEDERATION: "1",
      THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT: "1",
      THEME_EXPERIMENT_EU_AI_OFFICE_CONTINUOUS_CONFORMITY: "1",
    },
    note: "Enable dependencies in order per ops:phase-y-prod-wiring through phase-aa-prod-wiring",
  },
  tier_2c_ae_sci_fi: {
    description: "AE1–AE5 on top of Tier 2b AD",
    env: {
      THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH: "1",
      THEME_EXPERIMENT_UK_DSIT_ALGORITHMIC_TRANSPARENCY: "1",
      THEME_EXPERIMENT_MULTIVERSE_OUTCOME_CRDT: "1",
      THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR: "1",
      THEME_EXPERIMENT_CEREBELLAR_MOTOR_ORGANOID: "1",
    },
    game_day: "npm run ops:tier-2-staging-game-day",
  },
  tier_2b_ad_sci_fi: {
    description: "AD1–AD5 sci-fi tracks on top of Tier 2 Y→AA→AC",
    env: {
      THEME_EXPERIMENT_INDO_PACIFIC_COMPACT: "1",
      THEME_EXPERIMENT_EU_AI_ACT_LIVE_REGISTRY: "1",
      THEME_EXPERIMENT_COSMIC_WEB_FEDERATION: "1",
      THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION: "1",
      THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD: "1",
      KAFKA_EU_CONFORMITY_TOPIC: "eu-ai-conformity-events",
    },
    game_day: "npm run ops:tier-2-staging-game-day",
  },
  tier_3_ac_live_integrations: {
    description: "AC1 hypergraph + AC2 prefrontal + live EU/Kafka/Five Eyes",
    env: {
      THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA: "1",
      THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH: "1",
      THEME_EXPERIMENT_EU_AI_OFFICE_LIVE_API: "1",
      EU_AI_OFFICE_API_URL: "<eu registry>",
      THEME_EXPERIMENT_MESH_KAFKA_RELAY: "1",
      KAFKA_BROKERS: "<brokers>",
      KAFKA_REST_URL: "<rest proxy>",
      THEME_EXPERIMENT_FIVE_EYES_CLOUD_ATTESTATION: "1",
      FIVE_EYES_LEGAL_SIGNOFF_ID: "<legal-attestation-id>",
    },
    crons: [
      "hypergraph-zk-dna-rollup",
      "prefrontal-organoid-mesh-sync",
      "eu-ai-office-continuous-conformity-sync",
    ],
  },
  verification: {
    unit: "npm test -- tests/unit/theme-experiment-phase-*.test.ts tests/unit/experiment-production-crypto.test.ts",
    integration: "npm test -- tests/integration/",
    e2e: "npm run test:e2e:sprint5-lifecycle",
    load: "k6 run scripts/load/edge-assign-wormhole.k6.js",
  },
};

console.log(JSON.stringify(tierProdRollout, null, 2));
