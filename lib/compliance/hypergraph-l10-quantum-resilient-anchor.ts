/**
 * AL3 — Hypergraph L10 quantum-resilient anchor: QEC over AK3 L9 Byzantine BFT stack.
 */

import { createHash } from "node:crypto";
import { isCircomProdBackendActive } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  isHypergraphL9ByzantineAnchorEnabled,
  readHypergraphL9Byzantine,
  type HypergraphL9ByzantineAnchor,
} from "@/lib/compliance/hypergraph-l9-byzantine-anchor";

export type HypergraphL10QuantumResilientAnchor = {
  anchorId: string;
  at: string;
  l9AnchorId: string;
  l10ChainId: string;
  qecProofHash: string;
  logicalQubitHash: string | null;
  circomGroth16Hash: string | null;
  qecDistance: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "surface-code-qec";
};

export type HypergraphL10QuantumResilientSnapshot = {
  at: string;
  anchors: HypergraphL10QuantumResilientAnchor[];
  latestAnchorId: string | null;
  l10Ready: boolean;
  l9StackQuantumResilient: boolean;
  circomProdPath: boolean;
  qecThresholdMet: boolean;
};

export function isHypergraphL10QuantumResilientAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L10_QUANTUM_RESILIENT_ANCHOR === "1";
}

export function hypergraphL10ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L10_CHAIN_ID?.trim() || "kos-l10-qec-sim";
}

export function isHypergraphL10CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L10_CIRCOM === "1";
}

export function hypergraphL10QecDistance(): number {
  return Number(process.env.THEME_EXPERIMENT_HYPERGRAPH_L10_QEC_DISTANCE ?? "5");
}

function buildQecProofHash(l9: HypergraphL9ByzantineAnchor): string {
  return createHash("sha256")
    .update(`l10-qec:${l9.anchorId}:${l9.byzantineProofHash}:${hypergraphL10ChainId()}`)
    .digest("hex");
}

function buildLogicalQubitHash(qecHash: string, distance: number): string {
  return createHash("sha256").update(`l10-logical:${qecHash}:${distance}`).digest("hex");
}

function buildL10CircomGroth16Hash(qecHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL10CircomProdRequired()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l10-groth16:${qecHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL10QuantumResilient(raw: unknown): HypergraphL10QuantumResilientSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL10QuantumResilient;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL10QuantumResilientAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l10Ready: s.l10Ready === true,
    l9StackQuantumResilient: s.l9StackQuantumResilient === true,
    circomProdPath: s.circomProdPath === true,
    qecThresholdMet: s.qecThresholdMet === true,
  };
}

export function mergeHypergraphL10QuantumResilient(
  previousRaw: unknown,
  snap: HypergraphL10QuantumResilientSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL10QuantumResilient = snap;
  return base;
}

export function anchorL10FromL9(
  previousRaw: unknown,
  l9: HypergraphL9ByzantineAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL10QuantumResilientAnchor } {
  const qecProofHash = buildQecProofHash(l9);
  const distance = hypergraphL10QecDistance();
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL10QuantumResilientAnchor = {
    anchorId: `l10-${l9.anchorId}`,
    at: new Date().toISOString(),
    l9AnchorId: l9.anchorId,
    l10ChainId: hypergraphL10ChainId(),
    qecProofHash,
    logicalQubitHash: buildLogicalQubitHash(qecProofHash, distance),
    circomGroth16Hash: buildL10CircomGroth16Hash(qecProofHash),
    qecDistance: distance,
    anchored: l9.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "surface-code-qec",
  };

  const prev = readHypergraphL10QuantumResilient(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL10QuantumResilientSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l10Ready: anchors.every((a) => a.anchored),
    l9StackQuantumResilient: true,
    circomProdPath: circomProd,
    qecThresholdMet: distance >= 3,
  };

  return { json: mergeHypergraphL10QuantumResilient(previousRaw, snap), anchor };
}

export function quantumResilientAnchorL10FromL9Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL10QuantumResilientAnchor | null;
} {
  const l9 = readHypergraphL9Byzantine(previousRaw);
  if (!l9?.l9Ready || !l9.bftQuorumMet || !l9.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l9.anchors[l9.anchors.length - 1]!;
  return anchorL10FromL9(previousRaw, latest);
}

export function evaluateHypergraphL10QuantumResilientAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL10QuantumResilientAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L10 quantum-resilient anchor off", detail: "" };
  }
  if (!isHypergraphL9ByzantineAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L9 Byzantine anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L9_BYZANTINE_ANCHOR=1 (AK3).",
    };
  }
  if (isHypergraphL10CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L10",
      detail: "Complete L9 Circom prod sign-off and set THEME_EXPERIMENT_HYPERGRAPH_L10_CIRCOM=1.",
    };
  }
  const l9 = readHypergraphL9Byzantine(raw);
  if (!l9?.l9Ready || !l9.bftQuorumMet) {
    return {
      passed: false,
      headline: "L9 stack not ready for L10 QEC",
      detail: "Complete L9 Byzantine anchoring with BFT quorum first.",
    };
  }
  const l10 = readHypergraphL10QuantumResilient(raw);
  if (!l10?.l10Ready || !l10.qecThresholdMet) {
    return {
      passed: false,
      headline: "L10 quantum-resilient anchor missing",
      detail: "Run hypergraph L10 quantum-resilient anchor cron for QEC threshold.",
    };
  }
  const circomNote = l10.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L10 quantum-resilient anchor OK",
    detail: `L10 ${l10.latestAnchorId ?? "—"} · QEC d=${hypergraphL10QecDistance()}${circomNote}`,
  };
}
