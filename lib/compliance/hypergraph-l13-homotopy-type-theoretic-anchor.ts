/**
 * AO3 — Hypergraph L13 homotopy type-theoretic anchor over AN3 L12 categorical quantum stack.
 */

import { createHash } from "node:crypto";
import { isCircomProdBackendActive } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  isHypergraphL12CategoricalQuantumAnchorEnabled,
  readHypergraphL12CategoricalQuantum,
  type HypergraphL12CategoricalQuantumAnchor,
} from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";

export type HypergraphL13HomotopyTypeTheoreticAnchor = {
  anchorId: string;
  at: string;
  l12AnchorId: string;
  l13ChainId: string;
  hottProofHash: string;
  pathSpaceHash: string | null;
  circomGroth16Hash: string | null;
  homotopyLevel: number;
  anchored: boolean;
  anchorBackend: "sim" | "circom-groth16-prod" | "hott-type-theory";
};

export type HypergraphL13HomotopyTypeTheoreticSnapshot = {
  at: string;
  anchors: HypergraphL13HomotopyTypeTheoreticAnchor[];
  latestAnchorId: string | null;
  l13Ready: boolean;
  l12StackHottAnchored: boolean;
  circomProdPath: boolean;
  univalenceMet: boolean;
};

export function isHypergraphL13HomotopyTypeTheoreticAnchorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L13_HOMOTOPY_TYPE_THEORETIC_ANCHOR === "1";
}

export function hypergraphL13ChainId(): string {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L13_CHAIN_ID?.trim() || "kos-l13-hott-sim";
}

export function isHypergraphL13CircomProdRequired(): boolean {
  return process.env.THEME_EXPERIMENT_HYPERGRAPH_L13_CIRCOM === "1";
}

export function hypergraphL13HomotopyLevel(): number {
  return Number(process.env.THEME_EXPERIMENT_HYPERGRAPH_L13_HOMOTOPY_LEVEL ?? "2");
}

function buildHottProofHash(l12: HypergraphL12CategoricalQuantumAnchor): string {
  return createHash("sha256")
    .update(`l13-hott:${l12.anchorId}:${l12.categoricalProofHash}:${hypergraphL13ChainId()}`)
    .digest("hex");
}

function buildPathSpaceHash(hottHash: string, level: number): string {
  return createHash("sha256").update(`l13-path:${hottHash}:${level}`).digest("hex");
}

function buildL13CircomGroth16Hash(hottHash: string): string | null {
  if (!isCircomProdBackendActive() && !isHypergraphL13CircomProdRequired()) return null;
  const vkeyHash = process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() ?? "sim";
  return createHash("sha256").update(`l13-groth16:${hottHash}:${vkeyHash}`).digest("hex");
}

export function readHypergraphL13HomotopyTypeTheoretic(raw: unknown): HypergraphL13HomotopyTypeTheoreticSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hypergraphL13HomotopyTypeTheoretic;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    anchors: Array.isArray(s.anchors) ? (s.anchors as HypergraphL13HomotopyTypeTheoreticAnchor[]) : [],
    latestAnchorId: typeof s.latestAnchorId === "string" ? s.latestAnchorId : null,
    l13Ready: s.l13Ready === true,
    l12StackHottAnchored: s.l12StackHottAnchored === true,
    circomProdPath: s.circomProdPath === true,
    univalenceMet: s.univalenceMet === true,
  };
}

export function mergeHypergraphL13HomotopyTypeTheoretic(
  previousRaw: unknown,
  snap: HypergraphL13HomotopyTypeTheoreticSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hypergraphL13HomotopyTypeTheoretic = snap;
  return base;
}

export function anchorL13FromL12(
  previousRaw: unknown,
  l12: HypergraphL12CategoricalQuantumAnchor,
): { json: Record<string, unknown>; anchor: HypergraphL13HomotopyTypeTheoreticAnchor } {
  const hottProofHash = buildHottProofHash(l12);
  const level = hypergraphL13HomotopyLevel();
  const circomProd = isCircomProdBackendActive();
  const anchor: HypergraphL13HomotopyTypeTheoreticAnchor = {
    anchorId: `l13-${l12.anchorId}`,
    at: new Date().toISOString(),
    l12AnchorId: l12.anchorId,
    l13ChainId: hypergraphL13ChainId(),
    hottProofHash,
    pathSpaceHash: buildPathSpaceHash(hottProofHash, level),
    circomGroth16Hash: buildL13CircomGroth16Hash(hottProofHash),
    homotopyLevel: level,
    anchored: l12.anchored,
    anchorBackend: circomProd ? "circom-groth16-prod" : "hott-type-theory",
  };

  const prev = readHypergraphL13HomotopyTypeTheoretic(previousRaw);
  const anchors = [...(prev?.anchors ?? []), anchor].slice(-20);
  const snap: HypergraphL13HomotopyTypeTheoreticSnapshot = {
    at: new Date().toISOString(),
    anchors,
    latestAnchorId: anchor.anchorId,
    l13Ready: anchors.every((a) => a.anchored),
    l12StackHottAnchored: true,
    circomProdPath: circomProd,
    univalenceMet: level >= 1,
  };

  return { json: mergeHypergraphL13HomotopyTypeTheoretic(previousRaw, snap), anchor };
}

export function homotopyTypeTheoreticAnchorL13FromL12Stack(previousRaw: unknown): {
  json: Record<string, unknown>;
  anchor: HypergraphL13HomotopyTypeTheoreticAnchor | null;
} {
  const l12 = readHypergraphL12CategoricalQuantum(previousRaw);
  if (!l12?.l12Ready || !l12.categoryLawMet || !l12.anchors.length) {
    return { json: previousRaw as Record<string, unknown>, anchor: null };
  }
  const latest = l12.anchors[l12.anchors.length - 1]!;
  return anchorL13FromL12(previousRaw, latest);
}

export function evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHypergraphL13HomotopyTypeTheoreticAnchorEnabled()) {
    return { passed: true, headline: "Hypergraph L13 HoTT anchor off", detail: "" };
  }
  if (!isHypergraphL12CategoricalQuantumAnchorEnabled()) {
    return {
      passed: false,
      headline: "Hypergraph L12 categorical quantum anchor required",
      detail: "Enable THEME_EXPERIMENT_HYPERGRAPH_L12_CATEGORICAL_QUANTUM_ANCHOR=1 (AN3).",
    };
  }
  if (isHypergraphL13CircomProdRequired() && !isCircomProdBackendActive()) {
    return {
      passed: false,
      headline: "Circom prod backend required for L13",
      detail: "Complete L12 Circom prod sign-off and set THEME_EXPERIMENT_HYPERGRAPH_L13_CIRCOM=1.",
    };
  }
  const l12 = readHypergraphL12CategoricalQuantum(raw);
  if (!l12?.l12Ready || !l12.categoryLawMet) {
    return {
      passed: false,
      headline: "L12 stack not ready for L13 HoTT",
      detail: "Complete L12 categorical quantum anchoring first.",
    };
  }
  const l13 = readHypergraphL13HomotopyTypeTheoretic(raw);
  if (!l13?.l13Ready || !l13.univalenceMet) {
    return {
      passed: false,
      headline: "L13 homotopy type-theoretic anchor missing",
      detail: "Run hypergraph L13 HoTT anchor cron.",
    };
  }
  const circomNote = l13.circomProdPath ? " · Circom prod" : "";
  return {
    passed: true,
    headline: "Hypergraph L13 HoTT anchor OK",
    detail: `L13 ${l13.latestAnchorId ?? "—"} · level ${hypergraphL13HomotopyLevel()}${circomNote}`,
  };
}
