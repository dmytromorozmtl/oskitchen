/**
 * AI3 — Hypergraph L7 entanglement anchor: QEC redundancy layer over AH3 L6 holographic stack.
 */

import { createHash } from "node:crypto";
import {
  isHypergraphL6HolographicAnchorEnabled,
  isCircomProdBackendActive,
  readHypergraphL6Holographic,
  type HypergraphL6HolographicAnchor,
} from "@/lib/compliance/hypergraph-l6-holographic-anchor";

export type HypergraphL7EntanglementAnchor = {
  anchorId: string;
  at: string;
  l6AnchorId: string;
  l7ChainId: string;
  entanglementProofHash: string;
  qecParityHash: string | null;
  circomGroth16Hash: string | null;
  l6StackDepth: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "qec-entanglement";
};

export type HypergraphL7EntanglementSnapshot = {
  at: string;
  anchors: HypergraphL7EntanglementAnchor[];
  latestAnchorId: string | null;
  l7Ready: boolean;
  l6StackEntangled: boolean;
  circomProdPath: boolean;
  qecRedundancyMet: boolean;
};

export function isHypergraphL7EntanglementAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L7_ENTANGLEMENT_ANCHOR === "1";
}

export function hypergraphL7ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L7_CHAIN_ID?.trim() || "kos-l7-entanglement-sim";
}

export function isHypergraphL7CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L7_CIRCOM === "1";
}

function buildEntanglementProofHash(l6: HypergraphL6HolographicAnchor): string {
  return createHash("sha256")
    .update(`l7-entangle:${l6.anchorId}:${l6.holographicProofHash}:${hypergraphL7ChainId()}`)
    .digest("hex");
}

function buildQecParityHash(entanglementHash: string): string {
  return createHash("sha256").update(`l7-qec:${entanglementHash}:parity`).digest("hex");
}

function buildL7CircomGroth16Hash(entanglementHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL7CircomProdRequired()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l7-groth16:${entanglementHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL7Entanglement(raw: unknown): HypergraphL7EntanglementSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL7Entanglement;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL7EntanglementAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l7Ready: s.l7Ready === true,
    l6StackEntangled: s.l6StackEntangled === true,
    circomProdPath: s.circomProdPath === true,
    qecRedundancyMet: s.qecRedundancyMet === true,
  };
}

export function mergeHypergraphL7Entanglement(
  previousRaw: unknown,
  snap: HypergraphL7EntanglementSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL7Entanglement = snap;
  return base;
}

export function anchorL7FromL6(
  previousRaw: unknown,
  l6: HypergraphL6HolographicAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL7EntanglementAnchor } {
  const entanglementProofHash = buildEntanglementProofHash(l6);
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL7EntanglementAnchor = {
    anchorId: `l7-${l6.anchorId}`,
    at: new Date().toISOString(),
    l6AnchorId: l6.anchorId,
    l7ChainId: hypergraphL7ChainId(),
    entanglementProofHash,
    qecParityHash: buildQecParityHash(entanglementProofHash),
    circomGroth16Hash: buildL7CircomGroth16Hash(entanglementProofHash),
    l6StackDepth: l6.l5StackDepth,
    anchored: l6.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "qec-entanglement",
  };

  const prev = readHypergraphL7Entanglement(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL7EntanglementSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l7Ready: anchors.every((a) => a.anchored),
    l6StackEntangled: true,
    circomProdPath: circomProd,
    qecRedundancyMet: anchors.every((a) => a.qecParityHash !== null),
  };

  return { json: mergeHypergraphL7Entanglement(previousRaw, snap), anchor };
}

export function entanglementAnchorL7FromL6Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL7EntanglementAnchor | null;
} {
  const l6 = readHypergraphL6Holographic(previousRaw);
  if (!l6?.l6Ready || !l6.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l6.anchors[l6.anchors.length - 1]!;
  return anchorL7FromL6(previousRaw, latest);
}

export function evaluateHypergraphL7EntanglementAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL7EntanglementAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L7 entanglement anchor off", detail: "" };
  }
  if (!isHypergraphL6HolographicAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L6 holographic anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L6_HOLOGRAPHIC_ANCHOR=1 (AH3).",
    };
  }
  if (isHypergraphL7CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L7",
      detail: "Complete L6 Circom prod sign-off and set THEME_EXPERIMENT_HYPERGRAPH_L7_CIRCOM=1.",
    };
  }
  const l6 = readHypergraphL6Holographic(raw);
  if (!l6?.l6Ready) {
    return {
      passed: false,
      headline: "L6 stack not ready for L7 entanglement",
      detail: "Complete L6 holographic anchoring first.",
    };
  }
  const l7 = readHypergraphL7Entanglement(raw);
  if (!l7?.l7Ready || !l7.l6StackEntangled || !l7.qecRedundancyMet) {
    return {
      passed: false,
      headline: "L7 entanglement anchor missing",
      detail: "Run hypergraph L7 entanglement anchor cron for QEC redundancy.",
    };
  }
  const circomNote = l7.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L7 entanglement anchor OK",
    detail: `L7 ${l7.latestAnchorId ?? "—"} on ${hypergraphL7ChainId()}${circomNote}`,
  };
}
