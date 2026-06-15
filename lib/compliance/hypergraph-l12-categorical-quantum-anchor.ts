/**
 * AN3 — Hypergraph L12 categorical quantum anchor over AM3 L11 topological fault-tolerant stack.
 */

import { createHash } from "node:crypto";
import { isCircomProdBackendActive } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  isHypergraphL11TopologicalFaultTolerantAnchorEnabled,
  readHypergraphL11TopologicalFaultTolerant,
  type HypergraphL11TopologicalFaultTolerantAnchor,
} from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";

export type HypergraphL12CategoricalQuantumAnchor = {
  anchorId: string;
  at: string;
  l11AnchorId: string;
  l12ChainId: string;
  categoricalProofHash: string;
  functorCompositionHash: string | null;
  circomGroth16Hash: string | null;
  morphismCount: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "categorical-quantum";
};

export type HypergraphL12CategoricalQuantumSnapshot = {
  at: string;
  anchors: HypergraphL12CategoricalQuantumAnchor[];
  latestAnchorId: string | null;
  l12Ready: boolean;
  l11StackCategoricallyAnchored: boolean;
  circomProdPath: boolean;
  categoryLawMet: boolean;
};

export function isHypergraphL12CategoricalQuantumAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L12_CATEGORICAL_QUANTUM_ANCHOR === "1";
}

export function hypergraphL12ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L12_CHAIN_ID?.trim() || "kos-l12-categorical-quantum-sim";
}

export function isHypergraphL12CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L12_CIRCOM === "1";
}

export function hypergraphL12MorphismCount(): number {
  return Number(process.env.THEME_EXPERIMENT_HYPERGRAPH_L12_MORPHISM_COUNT ?? "4");
}

function buildCategoricalProofHash(l11: HypergraphL11TopologicalFaultTolerantAnchor): string {
  return createHash("sha256")
    .update(`l12-cat:${l11.anchorId}:${l11.topologicalProofHash}:${hypergraphL12ChainId()}`)
    .digest("hex");
}

function buildFunctorCompositionHash(catHash: string, morphisms: number): string {
  return createHash("sha256").update(`l12-functor:${catHash}:${morphisms}`).digest("hex");
}

function buildL12CircomGroth16Hash(catHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL12CircomProdRequired()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l12-groth16:${catHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL12CategoricalQuantum(raw: unknown): HypergraphL12CategoricalQuantumSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL12CategoricalQuantum;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL12CategoricalQuantumAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l12Ready: s.l12Ready === true,
    l11StackCategoricallyAnchored: s.l11StackCategoricallyAnchored === true,
    circomProdPath: s.circomProdPath === true,
    categoryLawMet: s.categoryLawMet === true,
  };
}

export function mergeHypergraphL12CategoricalQuantum(
  previousRaw: unknown,
  snap: HypergraphL12CategoricalQuantumSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL12CategoricalQuantum = snap;
  return base;
}

export function anchorL12FromL11(
  previousRaw: unknown,
  l11: HypergraphL11TopologicalFaultTolerantAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL12CategoricalQuantumAnchor } {
  const categoricalProofHash = buildCategoricalProofHash(l11);
  const morphisms = hypergraphL12MorphismCount();
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL12CategoricalQuantumAnchor = {
    anchorId: `l12-${l11.anchorId}`,
    at: new Date().toISOString(),
    l11AnchorId: l11.anchorId,
    l12ChainId: hypergraphL12ChainId(),
    categoricalProofHash,
    functorCompositionHash: buildFunctorCompositionHash(categoricalProofHash, morphisms),
    circomGroth16Hash: buildL12CircomGroth16Hash(categoricalProofHash),
    morphismCount: morphisms,
    anchored: l11.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "categorical-quantum",
  };

  const prev = readHypergraphL12CategoricalQuantum(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL12CategoricalQuantumSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l12Ready: anchors.every((a) => a.anchored),
    l11StackCategoricallyAnchored: true,
    circomProdPath: circomProd,
    categoryLawMet: morphisms >= 2,
  };

  return { json: mergeHypergraphL12CategoricalQuantum(previousRaw, snap), anchor };
}

export function categoricalQuantumAnchorL12FromL11Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL12CategoricalQuantumAnchor | null;
} {
  const l11 = readHypergraphL11TopologicalFaultTolerant(previousRaw);
  if (!l11?.l11Ready || !l11.topologicalFtMet || !l11.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l11.anchors[l11.anchors.length - 1]!;
  return anchorL12FromL11(previousRaw, latest);
}

export function evaluateHypergraphL12CategoricalQuantumAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL12CategoricalQuantumAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L12 categorical quantum anchor off", detail: "" };
  }
  if (!isHypergraphL11TopologicalFaultTolerantAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L11 topological FT anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L11_TOPOLOGICAL_FAULT_TOLERANT_ANCHOR=1 (AM3).",
    };
  }
  if (isHypergraphL12CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L12",
      detail: "Complete L11 Circom prod sign-off and set THEME_EXPERIMENT_HYPERGRAPH_L12_CIRCOM=1.",
    };
  }
  const l11 = readHypergraphL11TopologicalFaultTolerant(raw);
  if (!l11?.l11Ready || !l11.topologicalFtMet) {
    return {
      passed: false,
      headline: "L11 stack not ready for L12 categorical",
      detail: "Complete L11 topological fault-tolerant anchoring first.",
    };
  }
  const l12 = readHypergraphL12CategoricalQuantum(raw);
  if (!l12?.l12Ready || !l12.categoryLawMet) {
    return {
      passed: false,
      headline: "L12 categorical quantum anchor missing",
      detail: "Run hypergraph L12 categorical quantum anchor cron.",
    };
  }
  const circomNote = l12.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L12 categorical quantum anchor OK",
    detail: `L12 ${l12.latestAnchorId ?? "—"} · ${hypergraphL12MorphismCount()} morphisms${circomNote}`,
  };
}
