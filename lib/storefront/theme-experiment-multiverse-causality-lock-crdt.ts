/**
 * AL5 — Multiverse causality lock CRDT: causal lock after AK5 metaverse irreversible finality.
 */

import { createHash } from "node:crypto";
import {
  isMetaverseFinalitySealCrdtEnabled,
  readMetaverseFinalitySealCrdt,
} from "@/lib/storefront/theme-experiment-metaverse-finality-seal-crdt";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export type CausalityLockPhase = "lock_proposed" | "lock_committed" | "lock_sealed";

export type MultiverseCausalityLock = {
  at: string;
  phase: CausalityLockPhase;
  lockNumber: number;
  lockedLiftPp: number;
  finalityToken: string | null;
  causallyLocked: boolean;
  acyclicPreserved: boolean;
};

export type MultiverseCausalityLockCrdtSnapshot = {
  at: string;
  locks: MultiverseCausalityLock[];
  phaseQuorum: number;
  quorumReached: boolean;
  finalitySealSynced: boolean;
  counterfactualSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusLockedLiftPp: number;
  multiverseCausalityLocked: boolean;
};

export const CAUSALITY_LOCK_PHASES: CausalityLockPhase[] = [
  "lock_proposed",
  "lock_committed",
  "lock_sealed",
];

export function isMultiverseCausalityLockCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MULTIVERSE_CAUSALITY_LOCK_CRDT === "1";
}

export function multiverseCausalityLockQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_CAUSALITY_LOCK_QUORUM ?? "0.67");
}

export function readMultiverseCausalityLockCrdt(raw: unknown): MultiverseCausalityLockCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).multiverseCausalityLockCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    locks: Array.isArray(s.locks) ? (s.locks as MultiverseCausalityLock[]) : [],
    phaseQuorum: typeof s.phaseQuorum === "number" ? s.phaseQuorum : 0,
    quorumReached: s.quorumReached === true,
    finalitySealSynced: s.finalitySealSynced === true,
    counterfactualSynced: s.counterfactualSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusLockedLiftPp: typeof s.consensusLockedLiftPp === "number" ? s.consensusLockedLiftPp : 0,
    multiverseCausalityLocked: s.multiverseCausalityLocked === true,
  };
}

function mergeLockIntoJson(
  previousRaw: unknown,
  snap: MultiverseCausalityLockCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.multiverseCausalityLockCrdt = snap;
  return base;
}

export function ingestMultiverseCausalityLocks(
  previousRaw: unknown,
  cells: Omit<MultiverseCausalityLock, "at" | "finalityToken" | "causallyLocked" | "acyclicPreserved">[],
): { json: Record<string, unknown>; snap: MultiverseCausalityLockCrdtSnapshot } {
  const finality = readMetaverseFinalitySealCrdt(previousRaw);
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const token = finality
    ? createHash("sha256")
        .update(`${finality.phaseQuorum}:${finality.consensusFinalLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const baseLift = finality?.consensusFinalLiftPp ?? cf?.mergedWhatIfLiftPp ?? 2.0;
  const locks: MultiverseCausalityLock[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    finalityToken: token,
    causallyLocked: finality?.metaverseFinalitySealed ?? false,
    acyclicPreserved: (cf?.omniverseDagAcyclic ?? false) && (finality?.dagAcyclicPreserved ?? false),
  }));

  const prev = readMultiverseCausalityLockCrdt(previousRaw);
  const all = [...(prev?.locks ?? []), ...locks].slice(-60);
  const phaseSet = new Set(all.map((l) => l.phase));
  const quorumRequired = Math.max(
    2,
    Math.ceil(CAUSALITY_LOCK_PHASES.length * multiverseCausalityLockQuorumFraction()),
  );
  const quorumReached = phaseSet.size >= quorumRequired;

  const consensusLockedLiftPp =
    all.length > 0 ? all.reduce((sum, l) => sum + l.lockedLiftPp, 0) / all.length : 0;
  const hasSealed = all.some((l) => l.phase === "lock_sealed");
  const liftDrift = Math.abs(consensusLockedLiftPp - baseLift);
  const multiverseCausalityLocked =
    quorumReached && hasSealed && liftDrift <= 0.2 && all.every((l) => l.causallyLocked && l.acyclicPreserved);

  const snap: MultiverseCausalityLockCrdtSnapshot = {
    at: new Date().toISOString(),
    locks: all,
    phaseQuorum: phaseSet.size,
    quorumReached,
    finalitySealSynced: finality?.metaverseFinalitySealed ?? false,
    counterfactualSynced: cf?.omniverseSynced ?? false,
    dagAcyclicPreserved: (cf?.omniverseDagAcyclic ?? false) && (finality?.dagAcyclicPreserved ?? false),
    consensusLockedLiftPp,
    multiverseCausalityLocked,
  };

  return { json: mergeLockIntoJson(previousRaw, snap), snap };
}

export function lockMultiverseCausalityFromFinality(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MultiverseCausalityLockCrdtSnapshot } {
  const finality = readMetaverseFinalitySealCrdt(previousRaw);
  const lift = finality?.consensusFinalLiftPp ?? 2.0;
  const cells = CAUSALITY_LOCK_PHASES.map((phase, i) => ({
    phase,
    lockNumber: i + 1,
    lockedLiftPp: lift * (1 - i * 0.004),
  }));
  return ingestMultiverseCausalityLocks(previousRaw, cells);
}

export function evaluateMultiverseCausalityLockCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMultiverseCausalityLockCrdtEnabled()) {
    return { passed: true, headline: "Multiverse causality lock CRDT off", detail: "" };
  }
  if (!isMetaverseFinalitySealCrdtEnabled()) {
    return {
      passed: false,
      headline: "Metaverse finality seal CRDT required",
      detail: "Enable THEME_EXPERIMENT_METAVERSE_FINALITY_SEAL_CRDT=1 (AK5).",
    };
  }
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse counterfactual CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1 (AG5).",
    };
  }
  const finality = readMetaverseFinalitySealCrdt(raw);
  if (!finality?.metaverseFinalitySealed) {
    return {
      passed: false,
      headline: "Metaverse finality not irreversible",
      detail: "Complete AK5 irreversible finality before causality lock.",
    };
  }
  const snap = readMultiverseCausalityLockCrdt(raw);
  if (!snap?.multiverseCausalityLocked || !snap.quorumReached) {
    return {
      passed: false,
      headline: "Multiverse causality not locked",
      detail: "Commit proposed → committed → sealed causality lock phases.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG causality consistency lost",
      detail: "Re-sync metaverse finality before causality lock CRDT.",
    };
  }
  return {
    passed: true,
    headline: "Multiverse causality lock CRDT aligned",
    detail: `${snap.phaseQuorum} phases · consensus ${snap.consensusLockedLiftPp.toFixed(1)}pp locked`,
  };
}
