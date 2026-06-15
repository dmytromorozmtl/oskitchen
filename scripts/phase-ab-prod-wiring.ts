#!/usr/bin/env tsx
/**
 * Phase AB+ — Production hardening (Layer D, strict env, peers, tests).
 * Run: npm run ops:phase-ab-prod-wiring
 */

const phaseAbChecklist = {
  phase: "AB+ (production hardening)",
  addresses: ["4.1 sim→prod crypto", "4.2 strict env", "4.3 peer discovery", "4.4 integration tests"],
  ab1_production_crypto: {
    env: [
      "THEME_EXPERIMENT_CRYPTO_BACKEND=prod",
      "THEME_EXPERIMENT_REQUIRE_PROD_CRYPTO=1",
      "CIRCOM_DNA_ROLLUP_VKEY_HASH or CIRCOM_DNA_ROLLUP_VKEY",
      "CIRCOM_DNA_ROLLUP_WASM (optional snarkjs path)",
      "SEAL_HOMOMORPHIC_CONTEXT_ID=kos-ckks-8192",
      "PQC_HSM_URL or LIBOQS_SIGN_URL",
      "PQC_HSM_API_KEY",
    ],
    modules: [
      "lib/experiment-production/zk-groth16-prover.ts",
      "lib/experiment-production/homomorphic-seal-backend.ts",
      "lib/experiment-production/pqc-signing-backend.ts",
    ],
    wired_into: ["zk-dna-rollup", "recursive-zk-dna-rollup", "pqc-dna-archival", "homomorphic-metrics"],
  },
  ab2_strict_env: {
    env: ["THEME_EXPERIMENT_STRICT_PUBLISH_GATES=1"],
    gate: "strictEnvPassed — enabled flags must have dependency env set",
    module: "lib/experiment-production/strict-env-validator.ts",
  },
  ab3_workspace_peers: {
    env: [
      "THEME_EXPERIMENT_WORKSPACE_PEER_DISCOVERY=1 (default on)",
      "CORTICAL_MESH_PEER_STORES (fallback when no workspaceId)",
      "DNA_FEDERATION_PEER_STORES",
    ],
    module: "lib/experiment-production/workspace-peer-discovery.ts",
    wired_into: ["cortical-organoid-mesh-sync-service"],
  },
  ab4_eu_mesh_attestation: {
    env: [
      "THEME_EXPERIMENT_EU_AI_OFFICE_LIVE_API=1",
      "EU_AI_OFFICE_API_URL",
      "EU_AI_OFFICE_API_KEY",
      "THEME_EXPERIMENT_MESH_KAFKA_RELAY=1",
      "KAFKA_BROKERS",
      "KAFKA_REST_URL",
      "THEME_EXPERIMENT_FIVE_EYES_CLOUD_ATTESTATION=1",
      "FIVE_EYES_LEGAL_SIGNOFF_ID",
      "AWS_ATTESTATION_URL / GCP_ATTESTATION_URL / AZURE_ATTESTATION_URL",
    ],
    modules: [
      "eu-ai-office-api-client.ts",
      "mesh-kafka-relay.ts",
      "five-eyes-cloud-attestation.ts",
    ],
  },
  ab5_production_hardening_gate: {
    env: ["THEME_EXPERIMENT_PRODUCTION_HARDENING=1"],
    gate: "productionHardeningPassed",
    publish: "storefront-theme-publish-service + theme-experiment-decision",
  },
  tests: {
    unit: "tests/unit/experiment-production-crypto.test.ts",
    integration: [
      "tests/integration/theme-experiment-middleware-assign.test.ts",
      "tests/integration/eu-ai-office-webhook-contract.test.ts",
    ],
    phase_regression: "tests/unit/theme-experiment-phase-*.test.ts (79 tests)",
  },
  all_ab_env_flags: [
    "THEME_EXPERIMENT_CRYPTO_BACKEND=prod",
    "THEME_EXPERIMENT_STRICT_PUBLISH_GATES=1",
    "THEME_EXPERIMENT_PRODUCTION_HARDENING=1",
    "THEME_EXPERIMENT_WORKSPACE_PEER_DISCOVERY=1",
  ],
  phase_ac: "Implemented — run npm run ops:phase-ac-prod-wiring",
};

console.log(JSON.stringify(phaseAbChecklist, null, 2));
