/**
 * AM3 — Hypergraph L11 topological fault-tolerant anchor over AL3 L10 quantum-resilient QEC.
 */

import { createHash } from "node:crypto";
import { isCircomProdBackendActive } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  isHypergraphL10QuantumResilientAnchorEnabled,
  readHypergraphL10QuantumResilient,
  type HypergraphL10QuantumResilientAnchor,
} from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";

export type HypergraphL11TopologicalFaultTolerantAnchor = {
  anchorId: string;
  at: string;
  l10AnchorId: string;
  l11ChainId: string;
  topologicalProofHash: string;
  homotopyClassHash: string | null;
  circomGroth16Hash: string | null;
  topologicalGenus: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "topological-ft";
};

export type HypergraphL11TopologicalFaultTolerantSnapshot = {
  at: string;
  anchors: HypergraphL11TopologicalFaultTolerantAnchor[];
  latestAnchorId: string | null;
  l11Ready: boolean;
  l10StackTopologicallyAnchored: boolean;
  circomProdPath: boolean;
  topologicalFtMet: boolean;
};

export function isHypergraphL11TopologicalFaultTolerantAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L11_TOPOLOGICAL_FAULT_TOLERANT_ANCHOR === "1";
}

export function hypergraphL11ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L11_CHAIN_ID?.trim() || "kos-l11-topological-ft-sim";
}

export function isHypergraphL11CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L11_CIRCOM === "1";
}

export function hypergraphL11TopologicalGenus(): number {
  return Number(process.env.THEME_EXPERIMENT_HYPERGRAPH_L11_TOPOLOGICAL_GENUS ?? "2");
}

function buildTopologicalProofHash(l10: HypergraphL10QuantumResilientAnchor): string {
  return createHash("sha256")
    .update(`l11-topo:${l10.anchorId}:${l10.qecProofHash}:${hypergraphL11ChainId()}`)
    .digest("hex");
}

function buildHomotopyClassHash(topoHash: string, genus: number): string {
  return createHash("sha256").update(`l11-homotopy:${topoHash}:${genus}`).digest("hex");
}

function buildL11CircomGroth16Hash(topoHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL11CircomProdRequired()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l11-groth16:${topoHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL11TopologicalFaultTolerant(
  raw: unknown,
): HypergraphL11TopologicalFaultTolerantSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL11TopologicalFaultTolerant;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL11TopologicalFaultTolerantAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l11Ready: s.l11Ready === true,
    l10StackTopologicallyAnchored: s.l10StackTopologicallyAnchored === true,
    circomProdPath: s.circomProdPath === true,
    topologicalFtMet: s.topologicalFtMet === true,
  };
}

export function mergeHypergraphL11TopologicalFaultTolerant(
  previousRaw: unknown,
  snap: HypergraphL11TopologicalFaultTolerantSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL11TopologicalFaultTolerant = snap;
  return base;
}

export function anchorL11FromL10(
  previousRaw: unknown,
  l10: HypergraphL10QuantumResilientAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL11TopologicalFaultTolerantAnchor } {
  const topologicalProofHash = buildTopologicalProofHash(l10);
  const genus = hypergraphL11TopologicalGenus();
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL11TopologicalFaultTolerantAnchor = {
    anchorId: `l11-${l10.anchorId}`,
    at: new Date().toISOString(),
    l10AnchorId: l10.anchorId,
    l11ChainId: hypergraphL11ChainId(),
    topologicalProofHash,
    homotopyClassHash: buildHomotopyClassHash(topologicalProofHash, genus),
    circomGroth16Hash: buildL11CircomGroth16Hash(topologicalProofHash),
    topologicalGenus: genus,
    anchored: l10.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "topological-ft",
  };

  const prev = readHypergraphL11TopologicalFaultTolerant(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL11TopologicalFaultTolerantSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l11Ready: anchors.every((a) => a.anchored),
    l10StackTopologicallyAnchored: true,
    circomProdPath: circomProd,
    topologicalFtMet: genus >= 1,
  };

  return { json: mergeHypergraphL11TopologicalFaultTolerant(previousRaw, snap), anchor };
}

export function topologicalFaultTolerantAnchorL11FromL10Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL11TopologicalFaultTolerantAnchor | null;
} {
  const l10 = readHypergraphL10QuantumResilient(previousRaw);
  if (!l10?.l10Ready || !l10.qecThresholdMet || !l10.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l10.anchors[l10.anchors.length - 1]!;
  return anchorL11FromL10(previousRaw, latest);
}

export function evaluateHypergraphL11TopologicalFaultTolerantAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL11TopologicalFaultTolerantAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L11 topological FT anchor off", detail: "" };
  }
  if (!isHypergraphL10QuantumResilientAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L10 quantum-resilient anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L10_QUANTUM_RESILIENT_ANCHOR=1 (AL3).",
    };
  }
  if (isHypergraphL11CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L11",
      detail: "Complete L10 Circom prod sign-off and set THEME_EXPERIMENT_HYPERGRAPH_L11_CIRCOM=1.",
    };
  }
  const l10 = readHypergraphL10QuantumResilient(raw);
  if (!l10?.l10Ready || !l10.qecThresholdMet) {
    return {
      passed: false,
      headline: "L10 stack not ready for L11 topological FT",
      detail: "Complete L10 QEC anchoring with threshold met first.",
    };
  }
  const l11 = readHypergraphL11TopologicalFaultTolerant(raw);
  if (!l11?.l11Ready || !l11.topologicalFtMet) {
    return {
      passed: false,
      headline: "L11 topological FT anchor missing",
      detail: "Run hypergraph L11 topological fault-tolerant anchor cron.",
    };
  }
  const circomNote = l11.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L11 topological FT anchor OK",
    detail: `L11 ${l11.latestAnchorId ?? "—"} · genus ${hypergraphL11TopologicalGenus()}${circomNote}`,
  };
}
