/**
 * AO5 — Multiverse branch merge seal CRDT: branch merge after AN5 timeline seal + parallel-universe merge.
 */

import { createHash } from "node:crypto";
import {
  isMultiverseTimelineSealCrdtEnabled,
  readMultiverseTimelineSealCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-timeline-seal-crdt";
import {
  isParallelUniverseMergeCrdtEnabled,
  readParallelUniverseMergeCrdt,
} from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";

export type BranchMergePhase = "branch_proposed" | "branch_merged" | "branch_sealed";

export type MultiverseBranchMergeSeal = {
  at: string;
  phase: BranchMergePhase;
  branchId: string;
  mergedLiftPp: number;
  timelineToken: string | null;
  timelineSealed: boolean;
  parallelUniverseSynced: boolean;
};

export type MultiverseBranchMergeSealCrdtSnapshot = {
  at: string;
  seals: MultiverseBranchMergeSeal[];
  phaseQuorum: number;
  quorumReached: boolean;
  timelineSealSynced: boolean;
  parallelUniverseSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusMergedLiftPp: number;
  multiverseBranchMergeSealed: boolean;
};

export const BRANCH_MERGE_PHASES: BranchMergePhase[] = [
  "branch_proposed",
  "branch_merged",
  "branch_sealed",
];

export function isMultiverseBranchMergeSealCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MULTIVERSE_BRANCH_MERGE_SEAL_CRDT === "1";
}

export function multiverseBranchMergeSealQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_BRANCH_MERGE_SEAL_QUORUM ?? "0.67");
}

export function readMultiverseBranchMergeSealCrdt(raw: unknown): MultiverseBranchMergeSealCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).multiverseBranchMergeSealCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    seals: Array.isArray(s.seals) ? (s.seals as MultiverseBranchMergeSeal[]) : [],
    phaseQuorum: typeof s.phaseQuorum === "number" ? s.phaseQuorum : 0,
    quorumReached: s.quorumReached === true,
    timelineSealSynced: s.timelineSealSynced === true,
    parallelUniverseSynced: s.parallelUniverseSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusMergedLiftPp: typeof s.consensusMergedLiftPp === "number" ? s.consensusMergedLiftPp : 0,
    multiverseBranchMergeSealed: s.multiverseBranchMergeSealed === true,
  };
}

function mergeBranchSealIntoJson(
  previousRaw: unknown,
  snap: MultiverseBranchMergeSealCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.multiverseBranchMergeSealCrdt = snap;
  return base;
}

export function ingestMultiverseBranchMergeSeals(
  previousRaw: unknown,
  cells: Omit<MultiverseBranchMergeSeal, "at" | "timelineToken" | "timelineSealed" | "parallelUniverseSynced">[],
): { json: Record<string, unknown>; snap: MultiverseBranchMergeSealCrdtSnapshot } {
  const timeline = readMultiverseTimelineSealCrdt(previousRaw);
  const parallel = readParallelUniverseMergeCrdt(previousRaw);
  const token = timeline
    ? createHash("sha256")
        .update(`${timeline.phaseQuorum}:${timeline.consensusSealedLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const baseLift = timeline?.consensusSealedLiftPp ?? parallel?.consensusLiftPp ?? 2.0;
  const seals: MultiverseBranchMergeSeal[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    timelineToken: token,
    timelineSealed: timeline?.multiverseTimelineSealed ?? false,
    parallelUniverseSynced: parallel?.quorumReached ?? false,
  }));

  const prev = readMultiverseBranchMergeSealCrdt(previousRaw);
  const all = [...(prev?.seals ?? []), ...seals].slice(-60);
  const phaseSet = new Set(all.map((s) => s.phase));
  const quorumRequired = Math.max(2, Math.ceil(BRANCH_MERGE_PHASES.length * multiverseBranchMergeSealQuorumFraction()));
  const quorumReached = phaseSet.size >= quorumRequired;

  const consensusMergedLiftPp =
    all.length > 0 ? all.reduce((sum, s) => sum + s.mergedLiftPp, 0) / all.length : 0;
  const hasSealed = all.some((s) => s.phase === "branch_sealed");
  const liftDrift = Math.abs(consensusMergedLiftPp - baseLift);
  const multiverseBranchMergeSealed =
    quorumReached &&
    hasSealed &&
    liftDrift <= 0.2 &&
    all.every((s) => s.timelineSealed && s.parallelUniverseSynced);

  const snap: MultiverseBranchMergeSealCrdtSnapshot = {
    at: new Date().toISOString(),
    seals: all,
    phaseQuorum: phaseSet.size,
    quorumReached,
    timelineSealSynced: timeline?.multiverseTimelineSealed ?? false,
    parallelUniverseSynced: parallel?.quorumReached ?? false,
    dagAcyclicPreserved: (parallel?.dagAcyclicPreserved ?? false) && (timeline?.dagAcyclicPreserved ?? false),
    consensusMergedLiftPp,
    multiverseBranchMergeSealed,
  };

  return { json: mergeBranchSealIntoJson(previousRaw, snap), snap };
}

export function sealMultiverseBranchMergeFromTimeline(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MultiverseBranchMergeSealCrdtSnapshot } {
  const timeline = readMultiverseTimelineSealCrdt(previousRaw);
  const lift = timeline?.consensusSealedLiftPp ?? 2.0;
  const cells = BRANCH_MERGE_PHASES.map((phase, i) => ({
    phase,
    branchId: `branch-${i + 1}`,
    mergedLiftPp: lift * (1 - i * 0.003),
  }));
  return ingestMultiverseBranchMergeSeals(previousRaw, cells);
}

export function evaluateMultiverseBranchMergeSealCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMultiverseBranchMergeSealCrdtEnabled()) {
    return { passed: true, headline: "Multiverse branch merge seal CRDT off", detail: "" };
  }
  if (!isMultiverseTimelineSealCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse timeline seal CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_TIMELINE_SEAL_CRDT=1 (AN5).",
    };
  }
  if (!isParallelUniverseMergeCrdtEnabled()) {
    return {
      passed: false,
      headline: "Parallel universe merge CRDT required",
      detail: "Enable THEME_EXPERIMENT_PARALLEL_UNIVERSE_MERGE_CRDT=1.",
    };
  }
  const timeline = readMultiverseTimelineSealCrdt(raw);
  if (!timeline?.multiverseTimelineSealed) {
    return {
      passed: false,
      headline: "Multiverse timeline not sealed",
      detail: "Complete AN5 timeline seal before branch merge seal.",
    };
  }
  const snap = readMultiverseBranchMergeSealCrdt(raw);
  if (!snap?.multiverseBranchMergeSealed || !snap.quorumReached) {
    return {
      passed: false,
      headline: "Multiverse branch merge not sealed",
      detail: "Commit proposed → merged → sealed branch phases.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG branch consistency lost",
      detail: "Re-sync timeline seal and parallel universe merge before branch seal.",
    };
  }
  return {
    passed: true,
    headline: "Multiverse branch merge seal CRDT aligned",
    detail: `${snap.phaseQuorum} phases · consensus ${snap.consensusMergedLiftPp.toFixed(1)}pp merged`,
  };
}
