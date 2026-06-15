/**
 * AD3 hypergraph evolution snapshot — edge/middleware-safe (no Groth16 prover imports).
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  isHypergraphZkDnaEnabled,
  readHypergraphZkDna,
} from "@/lib/compliance/hypergraph-zk-dna-snapshot";

export type HypergraphL2Anchor = {
  anchorId: string;
  at: string;
  dagRoot: string;
  proofId: string;
  l2ChainId: string;
  anchorTxHash: string | null;
  notaryAttestationHash: string;
  anchored: boolean;
  anchorBackend: "sim" | "notary" | "onchain";
};

export type HypergraphEvolutionSnapshot = {
  at: string;
  anchors: HypergraphL2Anchor[];
  latestAnchorId: string | null;
  evolutionReady: boolean;
  verifiedDagAnchored: boolean;
};

export function isHypergraphEvolutionEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION === "1";
}

export function readHypergraphEvolution(raw: unknown): HypergraphEvolutionSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphEvolution;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL2Anchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    evolutionReady: s.evolutionReady === true,
    verifiedDagAnchored: s.verifiedDagAnchored === true,
  };
}

export function evaluateHypergraphEvolutionGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphEvolutionEnabled()) {
    return { passed: true, headline: "Hypergraph evolution off", detail: "" };
  }
  if (!isHypergraphZkDnaEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph ZK DNA required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA=1 (AC1).",
    };
  }
  const hg = readHypergraphZkDna(raw);
  const verified = hg?.proofs.filter((p) => p.verified).length ?? 0;
  if (verified === 0) {
    return {
      passed: false,
      headline: "No verified hypergraph DAG proof",
      detail: "Run hypergraph ZK rollup before L2 evolution anchor.",
    };
  }
  const evo = readHypergraphEvolution(raw);
  if (!evo?.verifiedDagAnchored || !evo.evolutionReady) {
    return {
      passed: false,
      headline: "L2 anchor missing for verified DAG",
      detail: "Anchor hypergraph proof to notary or on-chain L2.",
    };
  }
  return {
    passed: true,
    headline: "Hypergraph evolution anchored",
    detail: `L2 ${evo.latestAnchorId ?? "—"} on ${process.env.THEME_EXPERIMENT_HYPERGRAPH_L2_CHAIN_ID?.trim() || "kos-l2-rollup-sim"}`,
  };
}
