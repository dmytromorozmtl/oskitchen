import { describe, expect, it } from "vitest";

import { sealDnaBlockWithMldsa } from "@/lib/compliance/pqc-dna-archival";
import { proveZkDnaRollup, verifyZkDnaRollupProof } from "@/lib/compliance/zk-dna-rollup";
import { batchRecursiveZkFromRollups, verifyRecursiveZkBatchProof } from "@/lib/compliance/recursive-zk-dna-rollup";
import { encryptArmMetricsCell } from "@/lib/storefront/theme-experiment-homomorphic-metrics";
import { proveGroth16, verifyGroth16 } from "@/lib/experiment-production/zk-groth16-prover";
import { encodeHomomorphicInteger, homomorphicScheme } from "@/lib/experiment-production/homomorphic-seal-backend";
import { signPqcDnaBlockSync } from "@/lib/experiment-production/pqc-signing-backend";
import { collectStrictEnvIssues } from "@/lib/experiment-production/strict-env-validator";

describe("production crypto backend", () => {
  it("sim Groth16 proves and verifies", () => {
    process.env.THEME_EXPERIMENT_CRYPTO_BACKEND = "sim";
    const bundle = proveGroth16({ circuit: "test-circuit", publicInputsHash: "abc123" });
    expect(bundle.verified).toBe(true);
    expect(verifyGroth16(bundle)).toBe(true);
  });

  it("prod Groth16 requires vkey hash", () => {
    process.env.THEME_EXPERIMENT_CRYPTO_BACKEND = "prod";
    process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH = "a".repeat(64);
    const bundle = proveGroth16({ circuit: "dna-federation-rollup-v1", publicInputsHash: "fed" });
    expect(bundle.backend).toBe("prod");
    expect(bundle.verified).toBe(true);
    expect(verifyGroth16(bundle)).toBe(true);
  });

  it("prod PQC signing uses liboqs-prod binding", () => {
    process.env.THEME_EXPERIMENT_CRYPTO_BACKEND = "prod";
    const signed = signPqcDnaBlockSync({
      algorithm: "ML-DSA-65",
      previousHash: "prev",
      blockHash: "block",
      dnaSequence: "ATGC",
      kemSalt: "kos",
    });
    expect(signed.backend).toBe("prod");
    expect(signed.mldsaFingerprint.length).toBeGreaterThan(64);
  });

  it("prod homomorphic uses CKKS-seal scheme", () => {
    process.env.THEME_EXPERIMENT_CRYPTO_BACKEND = "prod";
    expect(homomorphicScheme()).toBe("CKKS-seal");
    const enc = encodeHomomorphicInteger(42, 8, "draft");
    expect(enc).toMatch(/^[A-Za-z0-9_-]+$/);
    const cell = encryptArmMetricsCell({ armId: "draft", conversions: 5, checkouts: 50 });
    expect(cell.ciphertextHash.length).toBe(48);
  });

  it("strict env catches missing dependency chain", () => {
    process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES = "1";
    process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP = "1";
    delete process.env.THEME_EXPERIMENT_ZK_DNA_ROLLUP;
    const issues = collectStrictEnvIssues();
    expect(issues.some((i) => i.feature.includes("recursive"))).toBe(true);
    delete process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP;
    delete process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES;
  });
});

describe("wired rollup with backends", () => {
  it("ZK and recursive proofs verify under prod backend", () => {
    process.env.THEME_EXPERIMENT_CRYPTO_BACKEND = "prod";
    process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH = "b".repeat(64);

    const proof = proveZkDnaRollup({
      federatedChainHash: "fed-hash",
      cellCount: 2,
      storeQuorum: 2,
    });
    expect(proof.cryptoBackend).toBe("prod");
    expect(verifyZkDnaRollupProof(proof)).toBe(true);

    const json = { zkDnaRollup: { rollups: [proof], verificationRate: 1, latestTrailCommitment: proof.trailCommitment, at: new Date().toISOString() } };
    const batched = batchRecursiveZkFromRollups(json);
    expect(batched.batch?.verified).toBe(true);
    if (batched.batch) {
      expect(verifyRecursiveZkBatchProof(batched.batch)).toBe(true);
    }
  });
});
