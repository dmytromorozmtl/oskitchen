/**
 * AH5 — Parallel universe merge CRDT over AG5 counterfactual branches.
 */

import { createHash } from "node:crypto";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export type ParallelUniverseId = "universe_alpha" | "universe_beta" | "universe_gamma";

export type ParallelUniverseMerge = {
  at: string;
  universeId: ParallelUniverseId;
  mergedLiftPp: number;
  counterfactualToken: string | null;
  mergeVector: number;
  causallyConsistent: boolean;
};

export type ParallelUniverseMergeCrdtSnapshot = {
  at: string;
  merges: ParallelUniverseMerge[];
  universeQuorum: number;
  quorumReached: boolean;
  counterfactualSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusLiftPp: number;
};

export const PARALLEL_UNIVERSES: ParallelUniverseId[] = [
  "universe_alpha",
  "universe_beta",
  "universe_gamma",
];

export function isParallelUniverseMergeCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PARALLEL_UNIVERSE_MERGE_CRDT === "1";
}

export function parallelUniverseQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_PARALLEL_UNIVERSE_QUORUM ?? "0.67");
}

export function readParallelUniverseMergeCrdt(raw: unknown): ParallelUniverseMergeCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).parallelUniverseMergeCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    merges: Array.isArray(s.merges) ? (s.merges as ParallelUniverseMerge[]) : [],
    universeQuorum: typeof s.universeQuorum === "number" ? s.universeQuorum : 0,
    quorumReached: s.quorumReached === true,
    counterfactualSynced: s.counterfactualSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusLiftPp: typeof s.consensusLiftPp === "number" ? s.consensusLiftPp : 0,
  };
}

function mergeParallelIntoJson(
  previousRaw: unknown,
  snap: ParallelUniverseMergeCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.parallelUniverseMergeCrdt = snap;
  return base;
}

export function ingestParallelUniverseMerges(
  previousRaw: unknown,
  cells: Omit<ParallelUniverseMerge, "at" | "counterfactualToken" | "mergeVector" | "causallyConsistent">[],
): { json: Record<string, unknown>; snap: ParallelUniverseMergeCrdtSnapshot } {
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const token = cf
    ? createHash("sha256")
        .update(`${cf.branchQuorum}:${cf.mergedWhatIfLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const prev = readParallelUniverseMergeCrdt(previousRaw);
  const baseVector = prev?.merges.length ?? 0;
  const merges: ParallelUniverseMerge[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    counterfactualToken: token,
    mergeVector: baseVector + i + 1,
    causallyConsistent: cf?.omniverseDagAcyclic ?? false,
  }));

  const all = [...(prev?.merges ?? []), ...merges].slice(-60);
  const universeSet = new Set(all.map((m) => m.universeId));
  const quorumRequired = Math.max(2, Math.ceil(PARALLEL_UNIVERSES.length * parallelUniverseQuorumFraction()));
  const quorumReached = universeSet.size >= quorumRequired;

  const consensusLiftPp =
    all.length > 0 ? all.reduce((s, m) => s + m.mergedLiftPp, 0) / all.length : 0;

  const snap: ParallelUniverseMergeCrdtSnapshot = {
    at: new Date().toISOString(),
    merges: all,
    universeQuorum: universeSet.size,
    quorumReached,
    counterfactualSynced: (cf?.quorumReached ?? false) && (cf?.omniverseSynced ?? false),
    dagAcyclicPreserved: cf?.omniverseDagAcyclic ?? false,
    consensusLiftPp,
  };

  return { json: mergeParallelIntoJson(previousRaw, snap), snap };
}

export function mergeParallelUniversesFromCounterfactuals(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: ParallelUniverseMergeCrdtSnapshot } {
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const lift = cf?.mergedWhatIfLiftPp ?? 2.0;
  const cells = PARALLEL_UNIVERSES.map((universeId, i) => ({
    universeId,
    mergedLiftPp: lift * (1 - i * 0.05),
  }));
  return ingestParallelUniverseMerges(previousRaw, cells);
}

export function evaluateParallelUniverseMergeCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isParallelUniverseMergeCrdtEnabled()) {
    return { passed: true, headline: "Parallel universe merge CRDT off", detail: "" };
  }
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse counterfactual CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1 (AG5).",
    };
  }
  const cf = readMultiverseCounterfactualCrdt(raw);
  if (!cf?.omniverseDagAcyclic) {
    return {
      passed: false,
      headline: "Counterfactual omniverse DAG not acyclic",
      detail: "Resolve DAG cycles before parallel universe merge.",
    };
  }
  const snap = readParallelUniverseMergeCrdt(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Parallel universe quorum missing",
      detail: "Merge alpha/beta/gamma universes over counterfactual branches.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG acyclicity lost in parallel merge",
      detail: "Re-sync counterfactual CRDT before universe merge.",
    };
  }
  return {
    passed: true,
    headline: "Parallel universe merge CRDT aligned",
    detail: `${snap.universeQuorum} universes · consensus ${snap.consensusLiftPp.toFixed(1)}pp`,
  };
}
