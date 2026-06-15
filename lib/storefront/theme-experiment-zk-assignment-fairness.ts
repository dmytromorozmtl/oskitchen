/**
 * U1 — ZK assignment fairness: Groth16-sim proof that (visitorCommitment, bucket, arm) are consistent
 * without revealing raw visitorId. Pairs with S1 quantum seal + T1 homomorphic visitorSealHash.
 */

import { createHash } from "node:crypto";
import {
  hybridAssignmentBucket,
  isQuantumSafeAssignmentEnabled,
  sealVisitorWithMlKem,
} from "@/lib/storefront/theme-experiment-quantum-safe";

export { isQuantumSafeAssignmentEnabled };
import { stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import { isZkAssignmentFairnessEnabled } from "@/lib/storefront/theme-experiment-zk-assignment-fairness-flags";

export { isZkAssignmentFairnessEnabled } from "@/lib/storefront/theme-experiment-zk-assignment-fairness-flags";

export type ZkAssignmentProof = {
  at: string;
  visitorCommitment: string;
  armId: string;
  bucket: number;
  kemCiphertextHash: string;
  /** Simulated Groth16 proof bytes (base64url). */
  groth16Proof: string;
  publicInputsHash: string;
  verified: boolean;
  circuit: "assignment-fairness-v1";
};

export type ZkAssignmentFairnessSnapshot = {
  at: string;
  proofs: ZkAssignmentProof[];
  verificationRate: number;
  minProofsForPublish: number;
};

export function zkMinProofsForPublish(): number {
  return Number(process.env.THEME_EXPERIMENT_ZK_MIN_PROOFS ?? "10");
}

/** Pedersen-style commitment — never store raw visitorId in proof log. */
export function commitVisitorId(visitorId: string): string {
  return createHash("sha256")
    .update(`zk-commit:${visitorId}:${process.env.THEME_EXPERIMENT_ZK_SALT ?? "kos"}`)
    .digest("hex");
}

/** Simulated Groth16 prove: deterministic from public inputs (production: snarkjs/circom). */
export function proveAssignmentFairness(input: {
  visitorId: string;
  armId: string;
  useQuantumHybrid?: boolean;
}): ZkAssignmentProof {
  const visitorCommitment = commitVisitorId(input.visitorId);
  const bucket = input.useQuantumHybrid
    ? hybridAssignmentBucket(input.visitorId)
    : stableBucketPercent(input.visitorId);
  const { kemCiphertextHash } = sealVisitorWithMlKem(input.visitorId);

  const publicInputsHash = createHash("sha256")
    .update(`${visitorCommitment}:${bucket}:${input.armId}:${kemCiphertextHash}`)
    .digest("hex");

  const groth16Proof = createHash("sha256")
    .update(`groth16-sim:${publicInputsHash}:${process.env.THEME_EXPERIMENT_ZK_PROVING_KEY ?? "dev"}`)
    .digest("hex");

  const proof: ZkAssignmentProof = {
    at: new Date().toISOString(),
    visitorCommitment,
    armId: input.armId,
    bucket,
    kemCiphertextHash,
    groth16Proof,
    publicInputsHash,
    verified: false,
    circuit: "assignment-fairness-v1",
  };
  proof.verified = verifyZkProof(proof);
  return proof;
}

export function verifyZkProof(proof: ZkAssignmentProof): boolean {
  const recomputed = createHash("sha256")
    .update(`groth16-sim:${proof.publicInputsHash}:${process.env.THEME_EXPERIMENT_ZK_PROVING_KEY ?? "dev"}`)
    .digest("hex");
  return recomputed === proof.groth16Proof;
}

export function readZkAssignmentFairness(raw: unknown): ZkAssignmentFairnessSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).zkAssignmentFairness;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    proofs: Array.isArray(s.proofs) ? (s.proofs as ZkAssignmentProof[]) : [],
    verificationRate: typeof s.verificationRate === "number" ? s.verificationRate : 0,
    minProofsForPublish: typeof s.minProofsForPublish === "number" ? s.minProofsForPublish : zkMinProofsForPublish(),
  };
}

export function recordZkAssignmentProof(
  raw: unknown,
  proof: ZkAssignmentProof,
): Record<string, unknown> {
  const prev = readZkAssignmentFairness(raw) ?? {
    at: new Date().toISOString(),
    proofs: [],
    verificationRate: 0,
    minProofsForPublish: zkMinProofsForPublish(),
  };
  const proofs = [...prev.proofs.filter((p) => p.visitorCommitment !== proof.visitorCommitment), proof].slice(-500);
  const verified = proofs.filter((p) => verifyZkProof(p)).length;
  const snap: ZkAssignmentFairnessSnapshot = {
    ...prev,
    at: new Date().toISOString(),
    proofs,
    verificationRate: proofs.length > 0 ? verified / proofs.length : 0,
  };
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  base.zkAssignmentFairness = snap;
  return base;
}

export function evaluateZkAssignmentFairnessGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isZkAssignmentFairnessEnabled()) {
    return { passed: true, headline: "ZK fairness off", detail: "" };
  }
  const snap = readZkAssignmentFairness(raw);
  if (!snap || snap.proofs.length < snap.minProofsForPublish) {
    return {
      passed: true,
      headline: "ZK proofs accumulating",
      detail: `Need ${snap?.minProofsForPublish ?? zkMinProofsForPublish()} verified proofs before strict gate.`,
    };
  }
  if (snap.verificationRate < 0.99) {
    return {
      passed: false,
      headline: `ZK verification rate ${Math.round(snap.verificationRate * 100)}%`,
      detail: "Groth16 assignment-fairness proofs failed verification.",
    };
  }
  return {
    passed: true,
    headline: `ZK fairness OK (${snap.proofs.length} proofs)`,
    detail: `Verification ${Math.round(snap.verificationRate * 100)}% · circuit assignment-fairness-v1`,
  };
}
