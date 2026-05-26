/**
 * AC1 hypergraph snapshot readers — edge/middleware-safe (no Groth16 prover imports).
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  isRecursiveZkDnaRollupEnabled,
  readRecursiveZkDnaRollup,
} from "@/lib/compliance/recursive-zk-dna-rollup-snapshot";
import {
  isZkDnaRollupEnabled,
  readZkDnaRollup,
} from "@/lib/compliance/zk-dna-rollup-snapshot";

export type HypergraphDagNode = {
  nodeId: string;
  trailCommitment: string;
  parentIds: string[];
  recursiveBatchId: string | null;
  merkleRoot: string;
  depth: number;
};

export type HypergraphZkProof = {
  at: string;
  proofId: string;
  dagRoot: string;
  nodeCount: number;
  edgeCount: number;
  groth16HypergraphProof: string;
  publicDagHash: string;
  verified: boolean;
  circuit: "dna-hypergraph-rollup-v1";
  cryptoBackend?: "sim" | "prod";
};

export type HypergraphZkDnaSnapshot = {
  at: string;
  nodes: HypergraphDagNode[];
  proofs: HypergraphZkProof[];
  verificationRate: number;
  latestDagRoot: string | null;
};

export function isHypergraphZkDnaEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA === "1";
}

export function hypergraphMinProofsForPublish(): number {
  return Number(process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_MIN_PROOFS ?? "1");
}

export function readHypergraphZkDna(raw: unknown): HypergraphZkDnaSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphZkDna;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    nodes: Array.isArray(s.nodes) ? (s.nodes as HypergraphDagNode[]) : [],
    proofs: Array.isArray(s.proofs) ? (s.proofs as HypergraphZkProof[]) : [],
    verificationRate: typeof s.verificationRate === "number" ? s.verificationRate : 0,
    latestDagRoot: typeof s.latestDagRoot === "string" ? s.latestDagRoot : null,
  };
}

export function evaluateHypergraphZkDnaGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphZkDnaEnabled()) {
    return { passed: true, headline: "Hypergraph ZK DNA off", detail: "" };
  }
  if (!isRecursiveZkDnaRollupEnabled()) {
    return {
      passed: false,
      headline: "Recursive ZK DNA rollup required",
      detail: "Enable THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP=1 (AA1).",
    };
  }
  if (!isZkDnaRollupEnabled()) {
    return {
      passed: false,
      headline: "ZK DNA rollup required",
      detail: "Enable THEME_EXPERIMENT_ZK_DNA_ROLLUP=1 (Z1).",
    };
  }
  const recursive = readRecursiveZkDnaRollup(raw);
  if (!recursive || recursive.batches.length === 0) {
    return {
      passed: true,
      headline: "Hypergraph awaiting recursive batches",
      detail: "Complete AA1 recursive rollup before Merkle-DAG.",
    };
  }
  const hg = readHypergraphZkDna(raw);
  if (!hg || hg.proofs.length < hypergraphMinProofsForPublish()) {
    return {
      passed: false,
      headline: "Hypergraph ZK proof missing",
      detail: `Run hypergraph-zk-dna-rollup cron (min ${hypergraphMinProofsForPublish()} proofs).`,
    };
  }
  if (hg.verificationRate < 0.99) {
    return {
      passed: false,
      headline: `Hypergraph verification ${Math.round(hg.verificationRate * 100)}%`,
      detail: "Merkle-DAG proofs failed verification.",
    };
  }
  const zk = readZkDnaRollup(raw);
  const latest = hg.proofs[hg.proofs.length - 1]!;
  if (zk && latest.nodeCount > 0 && latest.dagRoot.length < 16) {
    return {
      passed: false,
      headline: "Hypergraph DAG root invalid",
      detail: "Re-roll up hypergraph after new recursive batches.",
    };
  }
  return {
    passed: true,
    headline: `Hypergraph ZK OK (${hg.proofs.length} proofs, ${hg.nodes.length} nodes)`,
    detail: `DAG root ${latest.dagRoot.slice(0, 16)}… · ${latest.edgeCount} edges`,
  };
}
