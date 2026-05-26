/**
 * AH3 — Hypergraph L6 holographic anchor over AG3 L5 compositional stack (Circom prod path).
 */

import { createHash } from "node:crypto";
import {
  isHypergraphL5CompositionalAnchorEnabled,
  isHypergraphL5CircomPathEnabled,
  readHypergraphL5Compositional,
  type HypergraphL5CompositionalAnchor,
} from "@/lib/compliance/hypergraph-l5-compositional-anchor";

export type HypergraphL6HolographicAnchor = {
  anchorId: string;
  at: string;
  l5AnchorId: string;
  l6ChainId: string;
  holographicProofHash: string;
  circomGroth16Hash: string | null;
  l5StackDepth: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "holographic-rollup";
};

export type HypergraphL6HolographicSnapshot = {
  at: string;
  anchors: HypergraphL6HolographicAnchor[];
  latestAnchorId: string | null;
  l6Ready: boolean;
  l5StackHolographicAnchored: boolean;
  circomProdPath: boolean;
};

export function isHypergraphL6HolographicAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L6_HOLOGRAPHIC_ANCHOR === "1";
}

export function hypergraphL6ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L6_CHAIN_ID?.trim() || "kos-l6-holographic-sim";
}

export function isHypergraphL6CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L6_CIRCOM_PROD === "1";
}

export function isCircomProdBackendActive(): boolean {
  return (
    process.env.THEME_EXPERIMENT_CRYPTO_BACKEND === "prod" &&
    process.env.THEME_EXPERIMENT_SNARKJS_GROTH16 === "1" &&
    Boolean(process.env.CIRCOM_DNA_ROLLUP_WASM?.trim()) &&
    Boolean(process.env.CIRCOM_DNA_ROLLUP_VKEY?.trim())
  );
}

function buildHolographicProofHash(l5: HypergraphL5CompositionalAnchor): string {
  return createHash("sha256")
    .update(`l6-holo:${l5.anchorId}:${l5.compositionalProofHash}:${hypergraphL6ChainId()}`)
    .digest("hex");
}

function buildCircomGroth16Hash(holographicHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL5CircomPathEnabled()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l6-groth16:${holographicHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL6Holographic(raw: unknown): HypergraphL6HolographicSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL6Holographic;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL6HolographicAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l6Ready: s.l6Ready === true,
    l5StackHolographicAnchored: s.l5StackHolographicAnchored === true,
    circomProdPath: s.circomProdPath === true,
  };
}

export function mergeHypergraphL6Holographic(
  previousRaw: unknown,
  snap: HypergraphL6HolographicSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL6Holographic = snap;
  return base;
}

export function anchorL6FromL5(
  previousRaw: unknown,
  l5: HypergraphL5CompositionalAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL6HolographicAnchor } {
  const holographicProofHash = buildHolographicProofHash(l5);
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL6HolographicAnchor = {
    anchorId: `l6-${l5.anchorId}`,
    at: new Date().toISOString(),
    l5AnchorId: l5.anchorId,
    l6ChainId: hypergraphL6ChainId(),
    holographicProofHash,
    circomGroth16Hash: buildCircomGroth16Hash(holographicProofHash),
    l5StackDepth: l5.l4StackDepth,
    anchored: l5.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "holographic-rollup",
  };

  const prev = readHypergraphL6Holographic(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL6HolographicSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l6Ready: anchors.every((a) => a.anchored),
    l5StackHolographicAnchored: true,
    circomProdPath: circomProd,
  };

  return { json: mergeHypergraphL6Holographic(previousRaw, snap), anchor };
}

export function holographicAnchorL6FromL5Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL6HolographicAnchor | null;
} {
  const l5 = readHypergraphL5Compositional(previousRaw);
  if (!l5?.l5Ready || !l5.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l5.anchors[l5.anchors.length - 1]!;
  return anchorL6FromL5(previousRaw, latest);
}

export function evaluateHypergraphL6HolographicAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL6HolographicAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L6 holographic anchor off", detail: "" };
  }
  if (!isHypergraphL5CompositionalAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L5 compositional anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR=1 (AG3).",
    };
  }
  if (isHypergraphL6CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L6",
      detail: "Run staging-circom-dna-rollup.sh and set THEME_EXPERIMENT_CRYPTO_BACKEND=prod.",
    };
  }
  const l5 = readHypergraphL5Compositional(raw);
  if (!l5?.l5Ready) {
    return {
      passed: false,
      headline: "L5 stack not ready for L6 holographic anchor",
      detail: "Complete L5 compositional anchoring first.",
    };
  }
  const l6 = readHypergraphL6Holographic(raw);
  if (!l6?.l6Ready || !l6.l5StackHolographicAnchored) {
    return {
      passed: false,
      headline: "L6 holographic anchor missing",
      detail: "Run hypergraph L6 holographic anchor cron.",
    };
  }
  const circomNote = l6.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L6 holographic anchor OK",
    detail: `L6 ${l6.latestAnchorId ?? "—"} on ${hypergraphL6ChainId()}${circomNote}`,
  };
}
