/**
 * AA1 — Recursive ZK DNA rollup: batched Groth16 over Z1 rollup-proof chain (Z1 + U1).
 */

import { createHash } from "node:crypto";
import {
  isZkDnaRollupEnabled,
  readZkDnaRollup,
  verifyZkDnaRollupProof,
  type ZkDnaRollupProof,
} from "@/lib/compliance/zk-dna-rollup";
import { proveGroth16, verifyGroth16 } from "@/lib/experiment-production/zk-groth16-prover";
import { isZkAssignmentFairnessEnabled } from "@/lib/storefront/theme-experiment-zk-assignment-fairness";

export type {
  RecursiveZkBatchProof,
  RecursiveZkDnaRollupSnapshot,
} from "@/lib/compliance/recursive-zk-dna-rollup-snapshot";
export {
  isRecursiveZkDnaRollupEnabled,
  readRecursiveZkDnaRollup,
  recursiveZkBatchSize,
  recursiveZkMinBatchesForPublish,
} from "@/lib/compliance/recursive-zk-dna-rollup-snapshot";

import type {
  RecursiveZkBatchProof,
  RecursiveZkDnaRollupSnapshot,
} from "@/lib/compliance/recursive-zk-dna-rollup-snapshot";
import {
  isRecursiveZkDnaRollupEnabled,
  readRecursiveZkDnaRollup,
  recursiveZkBatchSize,
  recursiveZkMinBatchesForPublish,
} from "@/lib/compliance/recursive-zk-dna-rollup-snapshot";

function hashRollupChain(rollups: ZkDnaRollupProof[]): string {
  const chain = rollups.map((r) => r.groth16Proof).join(":");
  return createHash("sha256").update(`recursive-zk-chain:${chain}`).digest("hex");
}

export function proveRecursiveZkBatch(rollups: ZkDnaRollupProof[]): RecursiveZkBatchProof | null {
  const verified = rollups.filter((r) => r.verified && verifyZkDnaRollupProof(r));
  if (verified.length === 0) return null;

  const rollupChainHash = hashRollupChain(verified);
  const childProofHashes = verified.map((r) =>
    createHash("sha256").update(r.groth16Proof).digest("hex").slice(0, 32),
  );
  const publicBatchHash = createHash("sha256")
    .update(`${rollupChainHash}:${verified.length}:${childProofHashes.join(",")}`)
    .digest("hex");

  const bundle = proveGroth16({
    circuit: "dna-recursive-rollup-v1",
    publicInputsHash: publicBatchHash,
  });

  const batch: RecursiveZkBatchProof = {
    at: new Date().toISOString(),
    batchId: `recursive-zk-${Date.now()}`,
    rollupChainHash,
    proofCount: verified.length,
    childProofHashes,
    publicBatchHash,
    groth16BatchProof: bundle.proof,
    verified: bundle.verified,
    circuit: "dna-recursive-rollup-v1",
    cryptoBackend: bundle.backend,
  };
  return batch;
}

export function verifyRecursiveZkBatchProof(batch: RecursiveZkBatchProof): boolean {
  return verifyGroth16({
    circuit: batch.circuit,
    publicInputsHash: batch.publicBatchHash,
    proof: batch.groth16BatchProof,
    backend: batch.cryptoBackend,
  });
}

export function recordRecursiveZkBatch(
  previousRaw: unknown,
  batch: RecursiveZkBatchProof,
): { json: Record<string, unknown>; snap: RecursiveZkDnaRollupSnapshot } {
  const prev = readRecursiveZkDnaRollup(previousRaw);
  const batches = [...(prev?.batches ?? []), batch].slice(-50);
  const verified = batches.filter((b) => b.verified).length;
  const snap: RecursiveZkDnaRollupSnapshot = {
    at: new Date().toISOString(),
    batches,
    verificationRate: batches.length > 0 ? verified / batches.length : 0,
    latestRollupChainHash: batch.rollupChainHash,
  };
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.recursiveZkDnaRollup = snap;
  return { json: base, snap };
}

export function batchRecursiveZkFromRollups(previousRaw: unknown): {
  json: Record<string, unknown>;
  batch: RecursiveZkBatchProof | null;
} {
  const rollup = readZkDnaRollup(previousRaw);
  if (!rollup || rollup.rollups.length === 0) {
    return { json: previousRaw as Record<string, unknown>, batch: null };
  }
  const size = recursiveZkBatchSize();
  const slice = rollup.rollups.slice(-size);
  const batch = proveRecursiveZkBatch(slice);
  if (!batch) return { json: previousRaw as Record<string, unknown>, batch: null };
  const { json } = recordRecursiveZkBatch(previousRaw, batch);
  return { json, batch };
}

export function evaluateRecursiveZkDnaRollupGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isRecursiveZkDnaRollupEnabled()) {
    return { passed: true, headline: "Recursive ZK DNA rollup off", detail: "" };
  }
  if (!isZkDnaRollupEnabled()) {
    return {
      passed: false,
      headline: "ZK DNA rollup required",
      detail: "Enable THEME_EXPERIMENT_ZK_DNA_ROLLUP=1 (Z1).",
    };
  }
  if (!isZkAssignmentFairnessEnabled()) {
    return {
      passed: false,
      headline: "ZK assignment fairness required",
      detail: "Enable THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS=1 (U1).",
    };
  }
  const rollup = readZkDnaRollup(raw);
  if (!rollup || rollup.rollups.length === 0) {
    return {
      passed: true,
      headline: "Recursive rollup awaiting Z1 proofs",
      detail: "Complete Z1 zk-dna-rollup before recursive batch.",
    };
  }
  const recursive = readRecursiveZkDnaRollup(raw);
  if (!recursive || recursive.batches.length < recursiveZkMinBatchesForPublish()) {
    return {
      passed: false,
      headline: "Recursive ZK batch missing",
      detail: `Run recursive-zk-dna-rollup cron (min ${recursiveZkMinBatchesForPublish()} batches).`,
    };
  }
  if (recursive.verificationRate < 0.99) {
    return {
      passed: false,
      headline: `Recursive ZK verification ${Math.round(recursive.verificationRate * 100)}%`,
      detail: "Batch proofs failed verification.",
    };
  }
  const latest = recursive.batches[recursive.batches.length - 1]!;
  const expectedChain = hashRollupChain(
    rollup.rollups.slice(-recursiveZkBatchSize()).filter((r) => r.verified),
  );
  if (latest.rollupChainHash !== expectedChain) {
    return {
      passed: false,
      headline: "Recursive batch stale vs rollup chain",
      detail: "Re-batch after new Z1 rollup proofs.",
    };
  }
  return {
    passed: true,
    headline: `Recursive ZK OK (${recursive.batches.length} batches)`,
    detail: `Chain ${latest.rollupChainHash.slice(0, 16)}… · ${latest.proofCount} child proofs`,
  };
}
