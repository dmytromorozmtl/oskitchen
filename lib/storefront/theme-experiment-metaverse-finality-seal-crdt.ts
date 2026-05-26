/**
 * AK5 — Metaverse finality seal CRDT: irreversible finality after AJ5 omniverse epoch seal.
 */

import { createHash } from "node:crypto";
import {
  isOmniverseEpochSealCrdtEnabled,
  readOmniverseEpochSealCrdt,
} from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export type MetaverseFinalityPhase = "finality_proposed" | "finality_committed" | "finality_irreversible";

export type MetaverseFinalitySeal = {
  at: string;
  phase: MetaverseFinalityPhase;
  finalityNumber: number;
  sealedLiftPp: number;
  epochToken: string | null;
  causallyFinal: boolean;
  irreversible: boolean;
};

export type MetaverseFinalitySealCrdtSnapshot = {
  at: string;
  seals: MetaverseFinalitySeal[];
  phaseQuorum: number;
  quorumReached: boolean;
  epochSealSynced: boolean;
  counterfactualSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusFinalLiftPp: number;
  metaverseFinalitySealed: boolean;
};

export const METAVERSE_FINALITY_PHASES: MetaverseFinalityPhase[] = [
  "finality_proposed",
  "finality_committed",
  "finality_irreversible",
];

export function isMetaverseFinalitySealCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_METAVERSE_FINALITY_SEAL_CRDT === "1";
}

export function metaverseFinalityQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_METAVERSE_FINALITY_QUORUM ?? "0.67");
}

export function readMetaverseFinalitySealCrdt(raw: unknown): MetaverseFinalitySealCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).metaverseFinalitySealCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    seals: Array.isArray(s.seals) ? (s.seals as MetaverseFinalitySeal[]) : [],
    phaseQuorum: typeof s.phaseQuorum === "number" ? s.phaseQuorum : 0,
    quorumReached: s.quorumReached === true,
    epochSealSynced: s.epochSealSynced === true,
    counterfactualSynced: s.counterfactualSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusFinalLiftPp: typeof s.consensusFinalLiftPp === "number" ? s.consensusFinalLiftPp : 0,
    metaverseFinalitySealed: s.metaverseFinalitySealed === true,
  };
}

function mergeFinalityIntoJson(
  previousRaw: unknown,
  snap: MetaverseFinalitySealCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.metaverseFinalitySealCrdt = snap;
  return base;
}

export function ingestMetaverseFinalitySeals(
  previousRaw: unknown,
  cells: Omit<MetaverseFinalitySeal, "at" | "epochToken" | "causallyFinal" | "irreversible">[],
): { json: Record<string, unknown>; snap: MetaverseFinalitySealCrdtSnapshot } {
  const epoch = readOmniverseEpochSealCrdt(previousRaw);
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const token = epoch
    ? createHash("sha256")
        .update(`${epoch.epochQuorum}:${epoch.consensusSealedLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const baseLift = epoch?.consensusSealedLiftPp ?? cf?.mergedWhatIfLiftPp ?? 2.0;
  const seals: MetaverseFinalitySeal[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    epochToken: token,
    causallyFinal: epoch?.omniverseEpochSealed ?? false,
    irreversible: c.phase === "finality_irreversible",
  }));

  const prev = readMetaverseFinalitySealCrdt(previousRaw);
  const all = [...(prev?.seals ?? []), ...seals].slice(-60);
  const phaseSet = new Set(all.map((s) => s.phase));
  const quorumRequired = Math.max(
    2,
    Math.ceil(METAVERSE_FINALITY_PHASES.length * metaverseFinalityQuorumFraction()),
  );
  const quorumReached = phaseSet.size >= quorumRequired;

  const consensusFinalLiftPp =
    all.length > 0 ? all.reduce((sum, s) => sum + s.sealedLiftPp, 0) / all.length : 0;
  const hasIrreversible = all.some((s) => s.irreversible);
  const liftDrift = Math.abs(consensusFinalLiftPp - baseLift);
  const metaverseFinalitySealed =
    quorumReached && hasIrreversible && liftDrift <= 0.2 && all.every((s) => s.causallyFinal);

  const snap: MetaverseFinalitySealCrdtSnapshot = {
    at: new Date().toISOString(),
    seals: all,
    phaseQuorum: phaseSet.size,
    quorumReached,
    epochSealSynced: epoch?.omniverseEpochSealed ?? false,
    counterfactualSynced: cf?.omniverseSynced ?? false,
    dagAcyclicPreserved: (cf?.omniverseDagAcyclic ?? false) && (epoch?.dagAcyclicPreserved ?? false),
    consensusFinalLiftPp,
    metaverseFinalitySealed,
  };

  return { json: mergeFinalityIntoJson(previousRaw, snap), snap };
}

export function sealMetaverseFinalityFromEpoch(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MetaverseFinalitySealCrdtSnapshot } {
  const epoch = readOmniverseEpochSealCrdt(previousRaw);
  const lift = epoch?.consensusSealedLiftPp ?? 2.0;
  const cells = METAVERSE_FINALITY_PHASES.map((phase, i) => ({
    phase,
    finalityNumber: i + 1,
    sealedLiftPp: lift * (1 - i * 0.005),
  }));
  return ingestMetaverseFinalitySeals(previousRaw, cells);
}

export function evaluateMetaverseFinalitySealCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMetaverseFinalitySealCrdtEnabled()) {
    return { passed: true, headline: "Metaverse finality seal CRDT off", detail: "" };
  }
  if (!isOmniverseEpochSealCrdtEnabled()) {
    return {
      passed: false,
      headline: "Omniverse epoch seal CRDT required",
      detail: "Enable THEME_EXPERIMENT_OMNIVERSE_EPOCH_SEAL_CRDT=1 (AJ5).",
    };
  }
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse counterfactual CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1 (AG5).",
    };
  }
  const epoch = readOmniverseEpochSealCrdt(raw);
  if (!epoch?.omniverseEpochSealed) {
    return {
      passed: false,
      headline: "Omniverse epoch not sealed",
      detail: "Complete AJ5 epoch seal before metaverse finality.",
    };
  }
  const snap = readMetaverseFinalitySealCrdt(raw);
  if (!snap?.metaverseFinalitySealed || !snap.quorumReached) {
    return {
      passed: false,
      headline: "Metaverse finality not irreversible",
      detail: "Commit proposed → committed → irreversible finality phases.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG finality consistency lost",
      detail: "Re-sync epoch seal before metaverse finality CRDT.",
    };
  }
  return {
    passed: true,
    headline: "Metaverse finality seal CRDT aligned",
    detail: `${snap.phaseQuorum} phases · consensus ${snap.consensusFinalLiftPp.toFixed(1)}pp irreversible`,
  };
}
