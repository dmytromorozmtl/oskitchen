/**
 * AC1 — Hypergraph ZK DNA: Merkle-DAG multi-trail proofs over AA1 recursive batches.
 */

import { createHash } from "node:crypto";
import {
  isRecursiveZkDnaRollupEnabled,
  readRecursiveZkDnaRollup,
  type RecursiveZkBatchProof,
} from "@/lib/compliance/recursive-zk-dna-rollup-snapshot";
import { proveGroth16, verifyGroth16 } from "@/lib/experiment-production/zk-groth16-prover";

export type {
  HypergraphDagNode,
  HypergraphZkDnaSnapshot,
  HypergraphZkProof,
} from "@/lib/compliance/hypergraph-zk-dna-snapshot";
export {
  evaluateHypergraphZkDnaGate,
  hypergraphMinProofsForPublish,
  isHypergraphZkDnaEnabled,
  readHypergraphZkDna,
} from "@/lib/compliance/hypergraph-zk-dna-snapshot";

import type {
  HypergraphDagNode,
  HypergraphZkDnaSnapshot,
  HypergraphZkProof,
} from "@/lib/compliance/hypergraph-zk-dna-snapshot";
import { readHypergraphZkDna } from "@/lib/compliance/hypergraph-zk-dna-snapshot";

function merklePair(a: string, b: string): string {
  return createHash("sha256").update(`hg:${a}:${b}`).digest("hex");
}

function buildMerkleDagFromBatches(batches: RecursiveZkBatchProof[]): {
  nodes: HypergraphDagNode[];
  dagRoot: string;
  edgeCount: number;
} {
  const nodes: HypergraphDagNode[] = [];
  let prevRoot = "genesis";
  let edgeCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]!;
    const parentIds = i === 0 ? [] : [nodes[i - 1]!.nodeId];
    edgeCount += parentIds.length;
    const trailCommitment = batch.rollupChainHash;
    const merkleRoot = merklePair(prevRoot, trailCommitment);
    const node: HypergraphDagNode = {
      nodeId: `hg-node-${i}`,
      trailCommitment,
      parentIds,
      recursiveBatchId: batch.batchId,
      merkleRoot,
      depth: i,
    };
    nodes.push(node);
    prevRoot = merkleRoot;
  }

  return { nodes, dagRoot: prevRoot, edgeCount };
}

export function proveHypergraphZkDag(input: {
  nodes: HypergraphDagNode[];
  dagRoot: string;
}): HypergraphZkProof {
  const publicDagHash = createHash("sha256")
    .update(`${input.dagRoot}:${input.nodes.length}`)
    .digest("hex");

  const bundle = proveGroth16({
    circuit: "dna-hypergraph-rollup-v1",
    publicInputsHash: publicDagHash,
  });

  return {
    at: new Date().toISOString(),
    proofId: `hypergraph-zk-${Date.now()}`,
    dagRoot: input.dagRoot,
    nodeCount: input.nodes.length,
    edgeCount: input.nodes.reduce((s, n) => s + n.parentIds.length, 0),
    groth16HypergraphProof: bundle.proof,
    publicDagHash,
    verified: bundle.verified,
    circuit: "dna-hypergraph-rollup-v1",
    cryptoBackend: bundle.backend,
  };
}

export function verifyHypergraphZkProof(proof: HypergraphZkProof): boolean {
  return verifyGroth16({
    circuit: proof.circuit,
    publicInputsHash: proof.publicDagHash,
    proof: proof.groth16HypergraphProof,
    backend: proof.cryptoBackend,
  });
}

export function recordHypergraphZkProof(
  previousRaw: unknown,
  proof: HypergraphZkProof,
  nodes: HypergraphDagNode[],
): { json: Record<string, unknown>; snap: HypergraphZkDnaSnapshot } {
  const prev = readHypergraphZkDna(previousRaw);
  const proofs = [...(prev?.proofs ?? []), proof].slice(-50);
  const allNodes = [...(prev?.nodes ?? []), ...nodes].slice(-200);
  const verified = proofs.filter((p) => p.verified).length;
  const snap: HypergraphZkDnaSnapshot = {
    at: new Date().toISOString(),
    nodes: allNodes,
    proofs,
    verificationRate: proofs.length > 0 ? verified / proofs.length : 0,
    latestDagRoot: proof.dagRoot,
  };
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphZkDna = snap;
  return { json: base, snap };
}

export function rollupHypergraphFromRecursive(previousRaw: unknown): {
  json: Record<string, unknown>;
  proof: HypergraphZkProof | null;
} {
  const recursive = readRecursiveZkDnaRollup(previousRaw);
  if (!recursive || recursive.batches.length === 0) {
    return { json: previousRaw as Record<string, unknown>, proof: null };
  }
  const verifiedBatches = recursive.batches.filter((b) => b.verified);
  if (verifiedBatches.length === 0) {
    return { json: previousRaw as Record<string, unknown>, proof: null };
  }
  const { nodes, dagRoot, edgeCount } = buildMerkleDagFromBatches(verifiedBatches);
  const proof = proveHypergraphZkDag({ nodes, dagRoot });
  proof.edgeCount = edgeCount;
  const { json } = recordHypergraphZkProof(previousRaw, proof, nodes);
  return { json, proof };
}
