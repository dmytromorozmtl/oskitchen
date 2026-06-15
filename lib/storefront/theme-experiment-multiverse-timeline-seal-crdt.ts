/**
 * AN5 — Multiverse timeline seal CRDT: timeline seal after AM5 omniverse epoch absolute freeze.
 */

import { createHash } from "node:crypto";
import {
  isOmniverseEpochFreezeCrdtEnabled,
  readOmniverseEpochFreezeCrdt,
} from "@/lib/storefront/theme-experiment-omniverse-epoch-freeze-crdt";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export type TimelineSealPhase = "timeline_proposed" | "timeline_committed" | "timeline_sealed";

export type MultiverseTimelineSeal = {
  at: string;
  phase: TimelineSealPhase;
  timelineNumber: number;
  sealedLiftPp: number;
  freezeToken: string | null;
  epochFrozen: boolean;
  causallyConsistent: boolean;
};

export type MultiverseTimelineSealCrdtSnapshot = {
  at: string;
  seals: MultiverseTimelineSeal[];
  phaseQuorum: number;
  quorumReached: boolean;
  epochFreezeSynced: boolean;
  counterfactualSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusSealedLiftPp: number;
  multiverseTimelineSealed: boolean;
};

export const TIMELINE_SEAL_PHASES: TimelineSealPhase[] = [
  "timeline_proposed",
  "timeline_committed",
  "timeline_sealed",
];

export function isMultiverseTimelineSealCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MULTIVERSE_TIMELINE_SEAL_CRDT === "1";
}

export function multiverseTimelineSealQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_TIMELINE_SEAL_QUORUM ?? "0.67");
}

export function readMultiverseTimelineSealCrdt(raw: unknown): MultiverseTimelineSealCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).multiverseTimelineSealCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    seals: Array.isArray(s.seals) ? (s.seals as MultiverseTimelineSeal[]) : [],
    phaseQuorum: typeof s.phaseQuorum === "number" ? s.phaseQuorum : 0,
    quorumReached: s.quorumReached === true,
    epochFreezeSynced: s.epochFreezeSynced === true,
    counterfactualSynced: s.counterfactualSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusSealedLiftPp: typeof s.consensusSealedLiftPp === "number" ? s.consensusSealedLiftPp : 0,
    multiverseTimelineSealed: s.multiverseTimelineSealed === true,
  };
}

function mergeTimelineSealIntoJson(
  previousRaw: unknown,
  snap: MultiverseTimelineSealCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.multiverseTimelineSealCrdt = snap;
  return base;
}

export function ingestMultiverseTimelineSeals(
  previousRaw: unknown,
  cells: Omit<MultiverseTimelineSeal, "at" | "freezeToken" | "epochFrozen" | "causallyConsistent">[],
): { json: Record<string, unknown>; snap: MultiverseTimelineSealCrdtSnapshot } {
  const freeze = readOmniverseEpochFreezeCrdt(previousRaw);
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const token = freeze
    ? createHash("sha256")
        .update(`${freeze.phaseQuorum}:${freeze.consensusFrozenLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const baseLift = freeze?.consensusFrozenLiftPp ?? cf?.mergedWhatIfLiftPp ?? 2.0;
  const seals: MultiverseTimelineSeal[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    freezeToken: token,
    epochFrozen: freeze?.omniverseEpochFrozen ?? false,
    causallyConsistent: (cf?.omniverseDagAcyclic ?? false) && (freeze?.dagAcyclicPreserved ?? false),
  }));

  const prev = readMultiverseTimelineSealCrdt(previousRaw);
  const all = [...(prev?.seals ?? []), ...seals].slice(-60);
  const phaseSet = new Set(all.map((s) => s.phase));
  const quorumRequired = Math.max(2, Math.ceil(TIMELINE_SEAL_PHASES.length * multiverseTimelineSealQuorumFraction()));
  const quorumReached = phaseSet.size >= quorumRequired;

  const consensusSealedLiftPp =
    all.length > 0 ? all.reduce((sum, s) => sum + s.sealedLiftPp, 0) / all.length : 0;
  const hasSealed = all.some((s) => s.phase === "timeline_sealed");
  const liftDrift = Math.abs(consensusSealedLiftPp - baseLift);
  const multiverseTimelineSealed =
    quorumReached && hasSealed && liftDrift <= 0.2 && all.every((s) => s.epochFrozen && s.causallyConsistent);

  const snap: MultiverseTimelineSealCrdtSnapshot = {
    at: new Date().toISOString(),
    seals: all,
    phaseQuorum: phaseSet.size,
    quorumReached,
    epochFreezeSynced: freeze?.omniverseEpochFrozen ?? false,
    counterfactualSynced: cf?.omniverseSynced ?? false,
    dagAcyclicPreserved: (cf?.omniverseDagAcyclic ?? false) && (freeze?.dagAcyclicPreserved ?? false),
    consensusSealedLiftPp,
    multiverseTimelineSealed,
  };

  return { json: mergeTimelineSealIntoJson(previousRaw, snap), snap };
}

export function sealMultiverseTimelineFromEpochFreeze(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MultiverseTimelineSealCrdtSnapshot } {
  const freeze = readOmniverseEpochFreezeCrdt(previousRaw);
  const lift = freeze?.consensusFrozenLiftPp ?? 2.0;
  const cells = TIMELINE_SEAL_PHASES.map((phase, i) => ({
    phase,
    timelineNumber: i + 1,
    sealedLiftPp: lift * (1 - i * 0.003),
  }));
  return ingestMultiverseTimelineSeals(previousRaw, cells);
}

export function evaluateMultiverseTimelineSealCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMultiverseTimelineSealCrdtEnabled()) {
    return { passed: true, headline: "Multiverse timeline seal CRDT off", detail: "" };
  }
  if (!isOmniverseEpochFreezeCrdtEnabled()) {
    return {
      passed: false,
      headline: "Omniverse epoch freeze CRDT required",
      detail: "Enable THEME_EXPERIMENT_OMNIVERSE_EPOCH_FREEZE_CRDT=1 (AM5).",
    };
  }
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse counterfactual CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1 (AG5).",
    };
  }
  const freeze = readOmniverseEpochFreezeCrdt(raw);
  if (!freeze?.omniverseEpochFrozen) {
    return {
      passed: false,
      headline: "Omniverse epoch not absolutely frozen",
      detail: "Complete AM5 absolute epoch freeze before timeline seal.",
    };
  }
  const snap = readMultiverseTimelineSealCrdt(raw);
  if (!snap?.multiverseTimelineSealed || !snap.quorumReached) {
    return {
      passed: false,
      headline: "Multiverse timeline not sealed",
      detail: "Commit proposed → committed → sealed timeline phases.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG timeline consistency lost",
      detail: "Re-sync epoch freeze before timeline seal CRDT.",
    };
  }
  return {
    passed: true,
    headline: "Multiverse timeline seal CRDT aligned",
    detail: `${snap.phaseQuorum} phases · consensus ${snap.consensusSealedLiftPp.toFixed(1)}pp sealed`,
  };
}
