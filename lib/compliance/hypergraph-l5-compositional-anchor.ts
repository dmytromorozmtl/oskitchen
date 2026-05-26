/**
 * AG3 — Hypergraph L5 compositional anchor over AF3 L4 meta stack (optional Circom proof hash).
 */

import { createHash } from "node:crypto";
import {
  isHypergraphL4MetaAnchorEnabled,
  readHypergraphL4Meta,
  type HypergraphL4MetaAnchor,
} from "@/lib/compliance/hypergraph-l4-meta-anchor";

export type HypergraphL5CompositionalAnchor = {
  anchorId: string;
  at: string;
  l4AnchorId: string;
  l5ChainId: string;
  compositionalProofHash: string;
  circomProofHash: string | null;
  l4StackDepth: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16" | "compositional-rollup";
};

export type HypergraphL5CompositionalSnapshot = {
  at: string;
  anchors: HypergraphL5CompositionalAnchor[];
  latestAnchorId: string | null;
  l5Ready: boolean;
  l4StackCompositionalAnchored: boolean;
};

export function isHypergraphL5CompositionalAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR === "1";
}

export function hypergraphL5ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L5_CHAIN_ID?.trim() || "kos-l5-compositional-sim";
}

export function isHypergraphL5CircomPathEnabled(): boolean {
  return (
    process.env.THEME_EXPERIMENT_HYPERGRAPH_L5_CIRCOM === "1" &&
    Boolean(process.env.CIRCOM_DNA_ROLLUP_WASM?.trim())
  );
}

function buildCompositionalProofHash(l4: HypergraphL4MetaAnchor, depth: number): string {
  return createHash("sha256")
    .update(`l5-comp:${l4.anchorId}:${l4.metaProofHash}:${depth}:${hypergraphL5ChainId()}`)
    .digest("hex");
}

function buildCircomProofHash(compositionalHash: string): string | null {
  if (!isHypergraphL5CircomPathEnabled()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l5-circom:${compositionalHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL5Compositional(raw: unknown): HypergraphL5CompositionalSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL5Compositional;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL5CompositionalAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l5Ready: s.l5Ready === true,
    l4StackCompositionalAnchored: s.l4StackCompositionalAnchored === true,
  };
}

export function mergeHypergraphL5Compositional(
  previousRaw: unknown,
  snap: HypergraphL5CompositionalSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL5Compositional = snap;
  return base;
}

export function anchorL5FromL4(
  previousRaw: unknown,
  l4: HypergraphL4MetaAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL5CompositionalAnchor } {
  const compositionalProofHash = buildCompositionalProofHash(l4, l4.l3StackDepth);
  const anchor: HypergraphL5CompositionalAnchor = {
    anchorId: `l5-${l4.anchorId}`,
    at: new Date().toISOString(),
    l4AnchorId: l4.anchorId,
    l5ChainId: hypergraphL5ChainId(),
    compositionalProofHash,
    circomProofHash: buildCircomProofHash(compositionalProofHash),
    l4StackDepth: l4.l3StackDepth,
    anchored: l4.anchored,
    anchorBackend: isHypergraphL5CircomPathEnabled() ? "circom-groth16" : "compositional-rollup",
  };

  const prev = readHypergraphL5Compositional(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-24);
  const snap: HypergraphL5CompositionalSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l5Ready: anchors.every((a) => a.anchored),
    l4StackCompositionalAnchored: true,
  };

  return { json: mergeHypergraphL5Compositional(previousRaw, snap), anchor };
}

export function compositionalAnchorL5FromL4Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL5CompositionalAnchor | null;
} {
  const l4 = readHypergraphL4Meta(previousRaw);
  if (!l4?.l4Ready || !l4.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l4.anchors[l4.anchors.length - 1]!;
  return anchorL5FromL4(previousRaw, latest);
}

export function evaluateHypergraphL5CompositionalAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL5CompositionalAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L5 compositional anchor off", detail: "" };
  }
  if (!isHypergraphL4MetaAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L4 meta anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR=1 (AF3).",
    };
  }
  const l4 = readHypergraphL4Meta(raw);
  if (!l4?.l4Ready) {
    return {
      passed: false,
      headline: "L4 stack not ready for L5 compositional anchor",
      detail: "Complete L4 meta anchoring first.",
    };
  }
  const l5 = readHypergraphL5Compositional(raw);
  if (!l5?.l5Ready || !l5.l4StackCompositionalAnchored) {
    return {
      passed: false,
      headline: "L5 compositional anchor missing",
      detail: "Run hypergraph L5 compositional anchor cron.",
    };
  }
  const circomNote = isHypergraphL5CircomPathEnabled() ? " · Circom path" : "";
  return {
    passed: true,
    headline: "Hypergraph L5 compositional anchor OK",
    detail: `L5 ${l5.latestAnchorId ?? "—"} on ${hypergraphL5ChainId()}${circomNote}`,
  };
}
