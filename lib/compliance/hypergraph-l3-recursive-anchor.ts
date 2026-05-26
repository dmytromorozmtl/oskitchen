/**
 * AE3 — Recursive hypergraph L3 anchoring over AD3 L2 evolution anchors.
 */

import { createHash } from "node:crypto";
import {
  isHypergraphEvolutionEnabled,
  readHypergraphEvolution,
  type HypergraphL2Anchor,
} from "@/lib/compliance/hypergraph-evolution-snapshot";

export type HypergraphL3RecursiveAnchor = {
  anchorId: string;
  at: string;
  l2AnchorId: string;
  l3ChainId: string;
  recursiveProofHash: string;
  l2StackDepth: number;
  anchored: boolean;
  anchorBackend: "sim" | "notary" | "rollup";
};

export type HypergraphL3RecursiveSnapshot = {
  at: string;
  anchors: HypergraphL3RecursiveAnchor[];
  latestAnchorId: string | null;
  l3Ready: boolean;
  l2StackAnchored: boolean;
};

export function isHypergraphL3RecursiveAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR === "1";
}

export function hypergraphL3ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L3_CHAIN_ID?.trim() || "kos-l3-recursive-sim";
}

function buildRecursiveProofHash(l2: HypergraphL2Anchor, depth: number): string {
  return createHash("sha256")
    .update(`l3-recursive:${l2.anchorId}:${l2.notaryAttestationHash}:${depth}:${hypergraphL3ChainId()}`)
    .digest("hex");
}

export function readHypergraphL3Recursive(raw: unknown): HypergraphL3RecursiveSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL3Recursive;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL3RecursiveAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l3Ready: s.l3Ready === true,
    l2StackAnchored: s.l2StackAnchored === true,
  };
}

export function mergeHypergraphL3Recursive(
  previousRaw: unknown,
  snap: HypergraphL3RecursiveSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL3Recursive = snap;
  return base;
}

export function anchorL3FromL2(
  previousRaw: unknown,
  l2: HypergraphL2Anchor,
  stackDepth: number,
): { json: Record<string, unknown>; anchor: HypergraphL3RecursiveAnchor } {
  const anchor: HypergraphL3RecursiveAnchor = {
    anchorId: `l3-${l2.anchorId}`,
    at: new Date().toISOString(),
    l2AnchorId: l2.anchorId,
    l3ChainId: hypergraphL3ChainId(),
    recursiveProofHash: buildRecursiveProofHash(l2, stackDepth),
    l2StackDepth: stackDepth,
    anchored: l2.anchored,
    anchorBackend: process.env.HYPERGRAPH_L3_NOTARY_URL ? "notary" : "rollup",
  };

  const prev = readHypergraphL3Recursive(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-30);
  const snap: HypergraphL3RecursiveSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l3Ready: anchors.every((a) => a.anchored),
    l2StackAnchored: true,
  };

  return { json: mergeHypergraphL3Recursive(previousRaw, snap), anchor };
}

export function recursiveAnchorL3FromEvolution(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL3RecursiveAnchor | null;
} {
  const evo = readHypergraphEvolution(previousRaw);
  if (!evo?.anchors.length || !evo.verifiedDagAnchored) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latestL2 = evo.anchors[evo.anchors.length - 1]!;
  return anchorL3FromL2(previousRaw, latestL2, evo.anchors.length);
}

export function evaluateHypergraphL3RecursiveAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL3RecursiveAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L3 recursive anchor off", detail: "" };
  }
  if (!isHypergraphEvolutionEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L2 evolution required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION=1 (AD3).",
    };
  }
  const evo = readHypergraphEvolution(raw);
  if (!evo?.verifiedDagAnchored) {
    return {
      passed: false,
      headline: "L2 anchor missing for L3 recursion",
      detail: "Anchor hypergraph to L2 before L3 recursive stack.",
    };
  }
  const l3 = readHypergraphL3Recursive(raw);
  if (!l3?.l3Ready || !l3.l2StackAnchored) {
    return {
      passed: false,
      headline: "L3 recursive anchor stack incomplete",
      detail: "Run hypergraph L3 recursive anchor cron.",
    };
  }
  return {
    passed: true,
    headline: "Hypergraph L3 recursive anchor OK",
    detail: `L3 ${l3.latestAnchorId ?? "—"} on ${hypergraphL3ChainId()}`,
  };
}
