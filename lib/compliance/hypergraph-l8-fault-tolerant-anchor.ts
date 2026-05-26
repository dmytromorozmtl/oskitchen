/**
 * AJ3 — Hypergraph L8 fault-tolerant anchor over AI3 L7 entanglement (Circom L7 path).
 */

import { createHash } from "node:crypto";
import { isCircomProdBackendActive } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  isHypergraphL7EntanglementAnchorEnabled,
  readHypergraphL7Entanglement,
  type HypergraphL7EntanglementAnchor,
} from "@/lib/compliance/hypergraph-l7-entanglement-anchor";

export type HypergraphL8FaultTolerantAnchor = {
  anchorId: string;
  at: string;
  l7AnchorId: string;
  l8ChainId: string;
  faultTolerantProofHash: string;
  erasureShardHash: string | null;
  circomGroth16Hash: string | null;
  l7StackDepth: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "fault-tolerant-erasure";
};

export type HypergraphL8FaultTolerantSnapshot = {
  at: string;
  anchors: HypergraphL8FaultTolerantAnchor[];
  latestAnchorId: string | null;
  l8Ready: boolean;
  l7StackFaultTolerant: boolean;
  circomProdPath: boolean;
  erasureRedundancyMet: boolean;
};

export function isHypergraphL8FaultTolerantAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L8_FAULT_TOLERANT_ANCHOR === "1";
}

export function hypergraphL8ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L8_CHAIN_ID?.trim() || "kos-l8-fault-tolerant-sim";
}

export function isHypergraphL8CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L8_CIRCOM === "1";
}

function buildFaultTolerantProofHash(l7: HypergraphL7EntanglementAnchor): string {
  return createHash("sha256")
    .update(`l8-ft:${l7.anchorId}:${l7.entanglementProofHash}:${hypergraphL8ChainId()}`)
    .digest("hex");
}

function buildErasureShardHash(ftHash: string): string {
  return createHash("sha256").update(`l8-erasure:${ftHash}:shard`).digest("hex");
}

function buildL8CircomGroth16Hash(ftHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL8CircomProdRequired()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l8-groth16:${ftHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL8FaultTolerant(raw: unknown): HypergraphL8FaultTolerantSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL8FaultTolerant;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL8FaultTolerantAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l8Ready: s.l8Ready === true,
    l7StackFaultTolerant: s.l7StackFaultTolerant === true,
    circomProdPath: s.circomProdPath === true,
    erasureRedundancyMet: s.erasureRedundancyMet === true,
  };
}

export function mergeHypergraphL8FaultTolerant(
  previousRaw: unknown,
  snap: HypergraphL8FaultTolerantSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL8FaultTolerant = snap;
  return base;
}

export function anchorL8FromL7(
  previousRaw: unknown,
  l7: HypergraphL7EntanglementAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL8FaultTolerantAnchor } {
  const faultTolerantProofHash = buildFaultTolerantProofHash(l7);
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL8FaultTolerantAnchor = {
    anchorId: `l8-${l7.anchorId}`,
    at: new Date().toISOString(),
    l7AnchorId: l7.anchorId,
    l8ChainId: hypergraphL8ChainId(),
    faultTolerantProofHash,
    erasureShardHash: buildErasureShardHash(faultTolerantProofHash),
    circomGroth16Hash: buildL8CircomGroth16Hash(faultTolerantProofHash),
    l7StackDepth: l7.l6StackDepth,
    anchored: l7.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "fault-tolerant-erasure",
  };

  const prev = readHypergraphL8FaultTolerant(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL8FaultTolerantSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l8Ready: anchors.every((a) => a.anchored),
    l7StackFaultTolerant: true,
    circomProdPath: circomProd,
    erasureRedundancyMet: anchors.every((a) => a.erasureShardHash !== null),
  };

  return { json: mergeHypergraphL8FaultTolerant(previousRaw, snap), anchor };
}

export function faultTolerantAnchorL8FromL7Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL8FaultTolerantAnchor | null;
} {
  const l7 = readHypergraphL7Entanglement(previousRaw);
  if (!l7?.l7Ready || !l7.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l7.anchors[l7.anchors.length - 1]!;
  return anchorL8FromL7(previousRaw, latest);
}

export function evaluateHypergraphL8FaultTolerantAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL8FaultTolerantAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L8 fault-tolerant anchor off", detail: "" };
  }
  if (!isHypergraphL7EntanglementAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L7 entanglement anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L7_ENTANGLEMENT_ANCHOR=1 (AI3).",
    };
  }
  if (isHypergraphL8CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L8",
      detail: "Complete L7 Circom prod sign-off and set THEME_EXPERIMENT_HYPERGRAPH_L8_CIRCOM=1.",
    };
  }
  const l7 = readHypergraphL7Entanglement(raw);
  if (!l7?.l7Ready || !l7.qecRedundancyMet) {
    return {
      passed: false,
      headline: "L7 stack not ready for L8 fault tolerance",
      detail: "Complete L7 entanglement anchoring with QEC parity first.",
    };
  }
  const l8 = readHypergraphL8FaultTolerant(raw);
  if (!l8?.l8Ready || !l8.erasureRedundancyMet) {
    return {
      passed: false,
      headline: "L8 fault-tolerant anchor missing",
      detail: "Run hypergraph L8 fault-tolerant anchor cron.",
    };
  }
  const circomNote = l8.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L8 fault-tolerant anchor OK",
    detail: `L8 ${l8.latestAnchorId ?? "—"} on ${hypergraphL8ChainId()}${circomNote}`,
  };
}
