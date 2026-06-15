/**
 * Z1 — ZK DNA rollup: Groth16-sim proof of federated DNA trail validity without revealing PQC seals.
 */

import { createHash } from "node:crypto";
import {
  isHomomorphicDnaFederationEnabled,
  readHomomorphicDnaFederation,
} from "@/lib/compliance/homomorphic-dna-federation";
import { proveGroth16, verifyGroth16 } from "@/lib/experiment-production/zk-groth16-prover";
import { isZkAssignmentFairnessEnabled } from "@/lib/storefront/theme-experiment-zk-assignment-fairness";

export type {
  ZkDnaRollupProof,
  ZkDnaRollupSnapshot,
} from "@/lib/compliance/zk-dna-rollup-snapshot";
export {
  isZkDnaRollupEnabled,
  readZkDnaRollup,
  zkDnaMinRollupsForPublish,
} from "@/lib/compliance/zk-dna-rollup-snapshot";

import type { ZkDnaRollupProof, ZkDnaRollupSnapshot } from "@/lib/compliance/zk-dna-rollup-snapshot";
import {
  isZkDnaRollupEnabled,
  readZkDnaRollup,
  zkDnaMinRollupsForPublish,
} from "@/lib/compliance/zk-dna-rollup-snapshot";

/** Hide raw ML-DSA / FHE material — only commitment enters the circuit. */
export function commitFederatedTrail(federatedChainHash: string, cellCount: number): string {
  return createHash("sha256")
    .update(`zk-dna-trail:${federatedChainHash}:${cellCount}:${process.env.THEME_EXPERIMENT_ZK_SALT ?? "kos"}`)
    .digest("hex");
}

export function proveZkDnaRollup(input: {
  federatedChainHash: string;
  cellCount: number;
  storeQuorum: number;
}): ZkDnaRollupProof {
  const trailCommitment = commitFederatedTrail(input.federatedChainHash, input.cellCount);
  const publicInputsHash = createHash("sha256")
    .update(`${trailCommitment}:${input.storeQuorum}:${input.cellCount}`)
    .digest("hex");

  const bundle = proveGroth16({
    circuit: "dna-federation-rollup-v1",
    publicInputsHash,
  });

  const proof: ZkDnaRollupProof = {
    at: new Date().toISOString(),
    rollupId: `zk-dna-${Date.now()}`,
    trailCommitment,
    cellCount: input.cellCount,
    storeQuorum: input.storeQuorum,
    groth16Proof: bundle.proof,
    publicInputsHash,
    verified: bundle.verified,
    circuit: "dna-federation-rollup-v1",
    cryptoBackend: bundle.backend,
  };
  return proof;
}

export function verifyZkDnaRollupProof(proof: ZkDnaRollupProof): boolean {
  return verifyGroth16({
    circuit: proof.circuit,
    publicInputsHash: proof.publicInputsHash,
    proof: proof.groth16Proof,
    backend: proof.cryptoBackend,
  });
}

export function recordZkDnaRollup(
  previousRaw: unknown,
  proof: ZkDnaRollupProof,
): { json: Record<string, unknown>; snap: ZkDnaRollupSnapshot } {
  const prev = readZkDnaRollup(previousRaw);
  const rollups = [...(prev?.rollups ?? []), proof].slice(-100);
  const verified = rollups.filter((r) => r.verified).length;
  const snap: ZkDnaRollupSnapshot = {
    at: new Date().toISOString(),
    rollups,
    verificationRate: rollups.length > 0 ? verified / rollups.length : 0,
    latestTrailCommitment: proof.trailCommitment,
  };
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.zkDnaRollup = snap;
  return { json: base, snap };
}

export function rollupZkDnaFromFederation(previousRaw: unknown): {
  json: Record<string, unknown>;
  proof: ZkDnaRollupProof | null;
} {
  const fed = readHomomorphicDnaFederation(previousRaw);
  if (!fed?.federationComplete || !fed.federatedChainHash) {
    return { json: previousRaw as Record<string, unknown>, proof: null };
  }
  const proof = proveZkDnaRollup({
    federatedChainHash: fed.federatedChainHash,
    cellCount: fed.cells.length,
    storeQuorum: fed.storeQuorum,
  });
  const { json } = recordZkDnaRollup(previousRaw, proof);
  return { json, proof };
}

export function evaluateZkDnaRollupGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isZkDnaRollupEnabled()) {
    return { passed: true, headline: "ZK DNA rollup off", detail: "" };
  }
  if (!isHomomorphicDnaFederationEnabled()) {
    return {
      passed: false,
      headline: "Homomorphic DNA federation required",
      detail: "Enable THEME_EXPERIMENT_HOMOMORPHIC_DNA_FEDERATION=1 (Y1).",
    };
  }
  if (!isZkAssignmentFairnessEnabled()) {
    return {
      passed: false,
      headline: "ZK assignment fairness required",
      detail: "Enable THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS=1 (U1).",
    };
  }
  const fed = readHomomorphicDnaFederation(raw);
  if (!fed?.federationComplete) {
    return {
      passed: true,
      headline: "ZK rollup awaiting federation",
      detail: "Complete homomorphic DNA federation before rollup proof.",
    };
  }
  const rollup = readZkDnaRollup(raw);
  if (!rollup || rollup.rollups.length < zkDnaMinRollupsForPublish()) {
    return {
      passed: false,
      headline: "ZK DNA rollup proof missing",
      detail: `Run zk-dna-rollup cron (min ${zkDnaMinRollupsForPublish()} proofs).`,
    };
  }
  if (rollup.verificationRate < 0.99) {
    return {
      passed: false,
      headline: `ZK DNA verification ${Math.round(rollup.verificationRate * 100)}%`,
      detail: "Rollup proofs failed verification.",
    };
  }
  const latest = rollup.rollups[rollup.rollups.length - 1]!;
  const expectedCommitment = commitFederatedTrail(fed.federatedChainHash, fed.cells.length);
  if (latest.trailCommitment !== expectedCommitment) {
    return {
      passed: false,
      headline: "ZK rollup stale vs federation",
      detail: "Re-roll up after new federated cells.",
    };
  }
  return {
    passed: true,
    headline: `ZK DNA rollup OK (${rollup.rollups.length} proofs)`,
    detail: `Trail commitment ${latest.trailCommitment.slice(0, 16)}… · seals hidden`,
  };
}
