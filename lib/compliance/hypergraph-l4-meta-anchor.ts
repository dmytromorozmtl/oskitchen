/**
 * AF3 — Hypergraph L4 meta-anchoring over AE3 L3 recursive anchors.
 */

import { createHash } from "node:crypto";
import {
  isHypergraphL3RecursiveAnchorEnabled,
  readHypergraphL3Recursive,
  type HypergraphL3RecursiveAnchor,
} from "@/lib/compliance/hypergraph-l3-recursive-anchor";

export type HypergraphL4MetaAnchor = {
  anchorId: string;
  at: string;
  l3AnchorId: string;
  l4MetaChainId: string;
  metaProofHash: string;
  l3StackDepth: number;
  anchored: boolean;
  anchorBackend: "sim" | "notary" | "meta-rollup";
};

export type HypergraphL4MetaSnapshot = {
  at: string;
  anchors: HypergraphL4MetaAnchor[];
  latestAnchorId: string | null;
  l4Ready: boolean;
  l3StackMetaAnchored: boolean;
};

export function isHypergraphL4MetaAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR === "1";
}

export function hypergraphL4ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L4_CHAIN_ID?.trim() || "kos-l4-meta-sim";
}

function buildMetaProofHash(l3: HypergraphL3RecursiveAnchor, depth: number): string {
  return createHash("sha256")
    .update(`l4-meta:${l3.anchorId}:${l3.recursiveProofHash}:${depth}:${hypergraphL4ChainId()}`)
    .digest("hex");
}

export function readHypergraphL4Meta(raw: unknown): HypergraphL4MetaSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL4Meta;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL4MetaAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l4Ready: s.l4Ready === true,
    l3StackMetaAnchored: s.l3StackMetaAnchored === true,
  };
}

export function mergeHypergraphL4Meta(
  previousRaw: unknown,
  snap: HypergraphL4MetaSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL4Meta = snap;
  return base;
}

export function anchorL4FromL3(
  previousRaw: unknown,
  l3: HypergraphL3RecursiveAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL4MetaAnchor } {
  const anchor: HypergraphL4MetaAnchor = {
    anchorId: `l4-${l3.anchorId}`,
    at: new Date().toISOString(),
    l3AnchorId: l3.anchorId,
    l4MetaChainId: hypergraphL4ChainId(),
    metaProofHash: buildMetaProofHash(l3, l3.l2StackDepth),
    l3StackDepth: l3.l2StackDepth,
    anchored: l3.anchored,
    anchorBackend: process.env.HYPERGRAPH_L4_NOTARY_URL ? "notary" : "meta-rollup",
  };

  const prev = readHypergraphL4Meta(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-30);
  const snap: HypergraphL4MetaSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l4Ready: anchors.every((a) => a.anchored),
    l3StackMetaAnchored: true,
  };

  return { json: mergeHypergraphL4Meta(previousRaw, snap), anchor };
}

export function metaAnchorL4FromL3Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL4MetaAnchor | null;
} {
  const l3 = readHypergraphL3Recursive(previousRaw);
  if (!l3?.l3Ready || !l3.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l3.anchors[l3.anchors.length - 1]!;
  return anchorL4FromL3(previousRaw, latest);
}

export function evaluateHypergraphL4MetaAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL4MetaAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L4 meta anchor off", detail: "" };
  }
  if (!isHypergraphL3RecursiveAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L3 recursive anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR=1 (AE3).",
    };
  }
  const l3 = readHypergraphL3Recursive(raw);
  if (!l3?.l3Ready) {
    return {
      passed: false,
      headline: "L3 stack not ready for L4 meta anchor",
      detail: "Complete L3 recursive anchoring first.",
    };
  }
  const l4 = readHypergraphL4Meta(raw);
  if (!l4?.l4Ready || !l4.l3StackMetaAnchored) {
    return {
      passed: false,
      headline: "L4 meta anchor missing",
      detail: "Run hypergraph L4 meta anchor cron.",
    };
  }
  return {
    passed: true,
    headline: "Hypergraph L4 meta anchor OK",
    detail: `L4 ${l4.latestAnchorId ?? "—"} on ${hypergraphL4ChainId()}`,
  };
}
