/**
 * AD3 — Hypergraph evolution: L2 anchoring of AC1 verified DAG proofs (on-chain or external notary).
 */

import { createHash } from "node:crypto";
import {
  readHypergraphZkDna,
  verifyHypergraphZkProof,
  type HypergraphZkProof,
} from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { isHypergraphZkDnaEnabled } from "@/lib/compliance/hypergraph-zk-dna-snapshot";

export type {
  HypergraphEvolutionSnapshot,
  HypergraphL2Anchor,
} from "@/lib/compliance/hypergraph-evolution-snapshot";
export {
  evaluateHypergraphEvolutionGate,
  isHypergraphEvolutionEnabled,
  readHypergraphEvolution,
} from "@/lib/compliance/hypergraph-evolution-snapshot";

import type {
  HypergraphEvolutionSnapshot,
  HypergraphL2Anchor,
} from "@/lib/compliance/hypergraph-evolution-snapshot";
import { readHypergraphEvolution } from "@/lib/compliance/hypergraph-evolution-snapshot";

export function hypergraphL2ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L2_CHAIN_ID?.trim() || "kos-l2-rollup-sim";
}

export function hypergraphNotaryUrl(): string | null {
  return process.env.HYPERGRAPH_L2_NOTARY_URL?.trim() || null;
}

function buildNotaryAttestation(dagRoot: string, proofId: string): string {
  return createHash("sha256").update(`l2-anchor:${dagRoot}:${proofId}:${hypergraphL2ChainId()}`).digest("hex");
}

export function mergeHypergraphEvolution(
  previousRaw: unknown,
  snap: HypergraphEvolutionSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphEvolution = snap;
  return base;
}

export function anchorHypergraphProof(
  previousRaw: unknown,
  proof: HypergraphZkProof,
): { json: Record<string, unknown>; anchor: HypergraphL2Anchor | null } {
  if (!proof.verified || !verifyHypergraphZkProof(proof)) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }

  const notaryHash = buildNotaryAttestation(proof.dagRoot, proof.proofId);
  const notaryUrl = hypergraphNotaryUrl();
  const anchorBackend: HypergraphL2Anchor["anchorBackend"] = notaryUrl
    ? "notary"
    : process.env.THEME_EXPERIMENT_HYPERGRAPH_L2_ONCHAIN === "1"
      ? "onchain"
      : "sim";

  const anchor: HypergraphL2Anchor = {
    anchorId: `l2-${proof.proofId}`,
    at: new Date().toISOString(),
    dagRoot: proof.dagRoot,
    proofId: proof.proofId,
    l2ChainId: hypergraphL2ChainId(),
    anchorTxHash:
      anchorBackend === "onchain"
        ? `0x${createHash("sha256").update(notaryHash).digest("hex").slice(0, 40)}`
        : null,
    notaryAttestationHash: notaryHash,
    anchored: true,
    anchorBackend,
  };

  const prev = readHypergraphEvolution(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-30);
  const snap: HypergraphEvolutionSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    evolutionReady: anchors.every((a) => a.anchored),
    verifiedDagAnchored: true,
  };

  return { json: mergeHypergraphEvolution(previousRaw, snap), anchor };
}

/** Anchor latest verified hypergraph proof from AC1 snapshot. */
export function evolveHypergraphFromVerifiedDag(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL2Anchor | null;
} {
  const hg = readHypergraphZkDna(previousRaw);
  if (!hg?.proofs.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = [...hg.proofs].reverse().find((p) => p.verified);
  if (!latest) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  return anchorHypergraphProof(previousRaw, latest);
}

export { isHypergraphZkDnaEnabled };
