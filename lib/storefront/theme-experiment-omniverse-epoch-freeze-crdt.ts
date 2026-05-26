/**
 * AM5 — Omniverse epoch freeze CRDT: absolute epoch freeze after AL5 multiverse causality lock.
 */

import { createHash } from "node:crypto";
import {
  isMultiverseCausalityLockCrdtEnabled,
  readMultiverseCausalityLockCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-causality-lock-crdt";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export type OmniverseEpochFreezePhase = "freeze_proposed" | "freeze_committed" | "freeze_absolute";

export type OmniverseEpochFreeze = {
  at: string;
  phase: OmniverseEpochFreezePhase;
  freezeNumber: number;
  frozenLiftPp: number;
  causalityToken: string | null;
  causallyFrozen: boolean;
  absolutelyFrozen: boolean;
};

export type OmniverseEpochFreezeCrdtSnapshot = {
  at: string;
  freezes: OmniverseEpochFreeze[];
  phaseQuorum: number;
  quorumReached: boolean;
  causalityLockSynced: boolean;
  counterfactualSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusFrozenLiftPp: number;
  omniverseEpochFrozen: boolean;
};

export const OMNIVERSE_EPOCH_FREEZE_PHASES: OmniverseEpochFreezePhase[] = [
  "freeze_proposed",
  "freeze_committed",
  "freeze_absolute",
];

export function isOmniverseEpochFreezeCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_OMNIVERSE_EPOCH_FREEZE_CRDT === "1";
}

export function omniverseEpochFreezeQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_OMNIVERSE_EPOCH_FREEZE_QUORUM ?? "0.67");
}

export function readOmniverseEpochFreezeCrdt(raw: unknown): OmniverseEpochFreezeCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).omniverseEpochFreezeCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    freezes: Array.isArray(s.freezes) ? (s.freezes as OmniverseEpochFreeze[]) : [],
    phaseQuorum: typeof s.phaseQuorum === "number" ? s.phaseQuorum : 0,
    quorumReached: s.quorumReached === true,
    causalityLockSynced: s.causalityLockSynced === true,
    counterfactualSynced: s.counterfactualSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusFrozenLiftPp: typeof s.consensusFrozenLiftPp === "number" ? s.consensusFrozenLiftPp : 0,
    omniverseEpochFrozen: s.omniverseEpochFrozen === true,
  };
}

function mergeFreezeIntoJson(
  previousRaw: unknown,
  snap: OmniverseEpochFreezeCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.omniverseEpochFreezeCrdt = snap;
  return base;
}

export function ingestOmniverseEpochFreezes(
  previousRaw: unknown,
  cells: Omit<OmniverseEpochFreeze, "at" | "causalityToken" | "causallyFrozen" | "absolutelyFrozen">[],
): { json: Record<string, unknown>; snap: OmniverseEpochFreezeCrdtSnapshot } {
  const lock = readMultiverseCausalityLockCrdt(previousRaw);
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const token = lock
    ? createHash("sha256")
        .update(`${lock.phaseQuorum}:${lock.consensusLockedLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const baseLift = lock?.consensusLockedLiftPp ?? cf?.mergedWhatIfLiftPp ?? 2.0;
  const freezes: OmniverseEpochFreeze[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    causalityToken: token,
    causallyFrozen: lock?.multiverseCausalityLocked ?? false,
    absolutelyFrozen: c.phase === "freeze_absolute",
  }));

  const prev = readOmniverseEpochFreezeCrdt(previousRaw);
  const all = [...(prev?.freezes ?? []), ...freezes].slice(-60);
  const phaseSet = new Set(all.map((f) => f.phase));
  const quorumRequired = Math.max(
    2,
    Math.ceil(OMNIVERSE_EPOCH_FREEZE_PHASES.length * omniverseEpochFreezeQuorumFraction()),
  );
  const quorumReached = phaseSet.size >= quorumRequired;

  const consensusFrozenLiftPp =
    all.length > 0 ? all.reduce((sum, f) => sum + f.frozenLiftPp, 0) / all.length : 0;
  const hasAbsolute = all.some((f) => f.absolutelyFrozen);
  const liftDrift = Math.abs(consensusFrozenLiftPp - baseLift);
  const omniverseEpochFrozen =
    quorumReached && hasAbsolute && liftDrift <= 0.2 && all.every((f) => f.causallyFrozen);

  const snap: OmniverseEpochFreezeCrdtSnapshot = {
    at: new Date().toISOString(),
    freezes: all,
    phaseQuorum: phaseSet.size,
    quorumReached,
    causalityLockSynced: lock?.multiverseCausalityLocked ?? false,
    counterfactualSynced: cf?.omniverseSynced ?? false,
    dagAcyclicPreserved: (cf?.omniverseDagAcyclic ?? false) && (lock?.dagAcyclicPreserved ?? false),
    consensusFrozenLiftPp,
    omniverseEpochFrozen,
  };

  return { json: mergeFreezeIntoJson(previousRaw, snap), snap };
}

export function freezeOmniverseEpochFromCausalityLock(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: OmniverseEpochFreezeCrdtSnapshot } {
  const lock = readMultiverseCausalityLockCrdt(previousRaw);
  const lift = lock?.consensusLockedLiftPp ?? 2.0;
  const cells = OMNIVERSE_EPOCH_FREEZE_PHASES.map((phase, i) => ({
    phase,
    freezeNumber: i + 1,
    frozenLiftPp: lift * (1 - i * 0.003),
  }));
  return ingestOmniverseEpochFreezes(previousRaw, cells);
}

export function evaluateOmniverseEpochFreezeCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isOmniverseEpochFreezeCrdtEnabled()) {
    return { passed: true, headline: "Omniverse epoch freeze CRDT off", detail: "" };
  }
  if (!isMultiverseCausalityLockCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse causality lock CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_CAUSALITY_LOCK_CRDT=1 (AL5).",
    };
  }
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse counterfactual CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1 (AG5).",
    };
  }
  const lock = readMultiverseCausalityLockCrdt(raw);
  if (!lock?.multiverseCausalityLocked) {
    return {
      passed: false,
      headline: "Multiverse causality not locked",
      detail: "Complete AL5 causality lock before omniverse epoch freeze.",
    };
  }
  const snap = readOmniverseEpochFreezeCrdt(raw);
  if (!snap?.omniverseEpochFrozen || !snap.quorumReached) {
    return {
      passed: false,
      headline: "Omniverse epoch not absolutely frozen",
      detail: "Commit proposed → committed → absolute freeze phases.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG freeze consistency lost",
      detail: "Re-sync causality lock before omniverse epoch freeze CRDT.",
    };
  }
  return {
    passed: true,
    headline: "Omniverse epoch freeze CRDT aligned",
    detail: `${snap.phaseQuorum} phases · consensus ${snap.consensusFrozenLiftPp.toFixed(1)}pp frozen`,
  };
}
