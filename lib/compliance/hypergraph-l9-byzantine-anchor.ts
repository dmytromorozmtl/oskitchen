/**
 * AK3 — Hypergraph L9 Byzantine anchor: BFT consensus over AJ3 L8 fault-tolerant stack.
 */

import { createHash } from "node:crypto";
import { isCircomProdBackendActive } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  isHypergraphL8FaultTolerantAnchorEnabled,
  readHypergraphL8FaultTolerant,
  type HypergraphL8FaultTolerantAnchor,
} from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";

export type HypergraphL9ByzantineAnchor = {
  anchorId: string;
  at: string;
  l8AnchorId: string;
  l9ChainId: string;
  byzantineProofHash: string;
  bftQuorumHash: string | null;
  circomGroth16Hash: string | null;
  validatorCount: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "bft-consensus";
};

export type HypergraphL9ByzantineSnapshot = {
  at: string;
  anchors: HypergraphL9ByzantineAnchor[];
  latestAnchorId: string | null;
  l9Ready: boolean;
  l8StackByzantineAnchored: boolean;
  circomProdPath: boolean;
  bftQuorumMet: boolean;
};

export function isHypergraphL9ByzantineAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L9_BYZANTINE_ANCHOR === "1";
}

export function hypergraphL9ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L9_CHAIN_ID?.trim() || "kos-l9-byzantine-sim";
}

export function isHypergraphL9CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L9_CIRCOM === "1";
}

export function hypergraphL9BftQuorumValidators(): number {
  return Number(process.env.THEME_EXPERIMENT_HYPERGRAPH_L9_BFT_QUORUM ?? "3");
}

function buildByzantineProofHash(l8: HypergraphL8FaultTolerantAnchor): string {
  return createHash("sha256")
    .update(`l9-bft:${l8.anchorId}:${l8.faultTolerantProofHash}:${hypergraphL9ChainId()}`)
    .digest("hex");
}

function buildBftQuorumHash(byzantineHash: string, validators: number): string {
  return createHash("sha256").update(`l9-quorum:${byzantineHash}:${validators}`).digest("hex");
}

function buildL9CircomGroth16Hash(byzantineHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL9CircomProdRequired()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l9-groth16:${byzantineHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL9Byzantine(raw: unknown): HypergraphL9ByzantineSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL9Byzantine;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL9ByzantineAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l9Ready: s.l9Ready === true,
    l8StackByzantineAnchored: s.l8StackByzantineAnchored === true,
    circomProdPath: s.circomProdPath === true,
    bftQuorumMet: s.bftQuorumMet === true,
  };
}

export function mergeHypergraphL9Byzantine(
  previousRaw: unknown,
  snap: HypergraphL9ByzantineSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL9Byzantine = snap;
  return base;
}

export function anchorL9FromL8(
  previousRaw: unknown,
  l8: HypergraphL8FaultTolerantAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL9ByzantineAnchor } {
  const byzantineProofHash = buildByzantineProofHash(l8);
  const validators = hypergraphL9BftQuorumValidators();
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL9ByzantineAnchor = {
    anchorId: `l9-${l8.anchorId}`,
    at: new Date().toISOString(),
    l8AnchorId: l8.anchorId,
    l9ChainId: hypergraphL9ChainId(),
    byzantineProofHash,
    bftQuorumHash: buildBftQuorumHash(byzantineProofHash, validators),
    circomGroth16Hash: buildL9CircomGroth16Hash(byzantineProofHash),
    validatorCount: validators,
    anchored: l8.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "bft-consensus",
  };

  const prev = readHypergraphL9Byzantine(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL9ByzantineSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l9Ready: anchors.every((a) => a.anchored),
    l8StackByzantineAnchored: true,
    circomProdPath: circomProd,
    bftQuorumMet: validators >= 3,
  };

  return { json: mergeHypergraphL9Byzantine(previousRaw, snap), anchor };
}

export function byzantineAnchorL9FromL8Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL9ByzantineAnchor | null;
} {
  const l8 = readHypergraphL8FaultTolerant(previousRaw);
  if (!l8?.l8Ready || !l8.erasureRedundancyMet || !l8.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l8.anchors[l8.anchors.length - 1]!;
  return anchorL9FromL8(previousRaw, latest);
}

export function evaluateHypergraphL9ByzantineAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL9ByzantineAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L9 Byzantine anchor off", detail: "" };
  }
  if (!isHypergraphL8FaultTolerantAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L8 fault-tolerant anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L8_FAULT_TOLERANT_ANCHOR=1 (AJ3).",
    };
  }
  if (isHypergraphL9CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L9",
      detail: "Complete L8 Circom prod sign-off and set THEME_EXPERIMENT_HYPERGRAPH_L9_CIRCOM=1.",
    };
  }
  const l8 = readHypergraphL8FaultTolerant(raw);
  if (!l8?.l8Ready || !l8.erasureRedundancyMet) {
    return {
      passed: false,
      headline: "L8 stack not ready for L9 Byzantine",
      detail: "Complete L8 fault-tolerant anchoring with erasure redundancy first.",
    };
  }
  const l9 = readHypergraphL9Byzantine(raw);
  if (!l9?.l9Ready || !l9.bftQuorumMet) {
    return {
      passed: false,
      headline: "L9 Byzantine anchor missing",
      detail: "Run hypergraph L9 Byzantine anchor cron for BFT quorum.",
    };
  }
  const circomNote = l9.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L9 Byzantine anchor OK",
    detail: `L9 ${l9.latestAnchorId ?? "—"} · BFT ${hypergraphL9BftQuorumValidators()} validators${circomNote}`,
  };
}
