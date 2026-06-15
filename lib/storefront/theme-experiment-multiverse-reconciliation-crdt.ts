/**
 * AI5 — Multiverse reconciliation CRDT: collapse divergent branches after AH5 parallel merge.
 */

import { createHash } from "node:crypto";
import {
  isParallelUniverseMergeCrdtEnabled,
  readParallelUniverseMergeCrdt,
} from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export type ReconciliationBranchId = "branch_prime" | "branch_echo" | "branch_shadow";

export type MultiverseReconciliation = {
  at: string;
  branchId: ReconciliationBranchId;
  reconciledLiftPp: number;
  parallelUniverseToken: string | null;
  divergencePp: number;
  causallyCollapsed: boolean;
};

export type MultiverseReconciliationCrdtSnapshot = {
  at: string;
  reconciliations: MultiverseReconciliation[];
  branchQuorum: number;
  quorumReached: boolean;
  parallelUniverseSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusReconciledLiftPp: number;
  divergentBranchesCollapsed: boolean;
};

export const RECONCILIATION_BRANCHES: ReconciliationBranchId[] = [
  "branch_prime",
  "branch_echo",
  "branch_shadow",
];

export function isMultiverseReconciliationCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MULTIVERSE_RECONCILIATION_CRDT === "1";
}

export function reconciliationBranchQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_RECONCILIATION_QUORUM ?? "0.67");
}

export function readMultiverseReconciliationCrdt(raw: unknown): MultiverseReconciliationCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).multiverseReconciliationCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    reconciliations: Array.isArray(s.reconciliations)
      ? (s.reconciliations as MultiverseReconciliation[])
      : [],
    branchQuorum: typeof s.branchQuorum === "number" ? s.branchQuorum : 0,
    quorumReached: s.quorumReached === true,
    parallelUniverseSynced: s.parallelUniverseSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusReconciledLiftPp:
      typeof s.consensusReconciledLiftPp === "number" ? s.consensusReconciledLiftPp : 0,
    divergentBranchesCollapsed: s.divergentBranchesCollapsed === true,
  };
}

function mergeReconciliationIntoJson(
  previousRaw: unknown,
  snap: MultiverseReconciliationCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.multiverseReconciliationCrdt = snap;
  return base;
}

export function ingestMultiverseReconciliations(
  previousRaw: unknown,
  cells: Omit<MultiverseReconciliation, "at" | "parallelUniverseToken" | "divergencePp" | "causallyCollapsed">[],
): { json: Record<string, unknown>; snap: MultiverseReconciliationCrdtSnapshot } {
  const parallel = readParallelUniverseMergeCrdt(previousRaw);
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const token = parallel
    ? createHash("sha256")
        .update(`${parallel.universeQuorum}:${parallel.consensusLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const baseLift = parallel?.consensusLiftPp ?? cf?.mergedWhatIfLiftPp ?? 2.0;
  const reconciliations: MultiverseReconciliation[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    parallelUniverseToken: token,
    divergencePp: Math.abs(c.reconciledLiftPp - baseLift),
    causallyCollapsed: (cf?.omniverseDagAcyclic ?? false) && (parallel?.dagAcyclicPreserved ?? false),
  }));

  const prev = readMultiverseReconciliationCrdt(previousRaw);
  const all = [...(prev?.reconciliations ?? []), ...reconciliations].slice(-60);
  const branchSet = new Set(all.map((r) => r.branchId));
  const quorumRequired = Math.max(
    2,
    Math.ceil(RECONCILIATION_BRANCHES.length * reconciliationBranchQuorumFraction()),
  );
  const quorumReached = branchSet.size >= quorumRequired;

  const consensusReconciledLiftPp =
    all.length > 0 ? all.reduce((s, r) => s + r.reconciledLiftPp, 0) / all.length : 0;
  const maxDivergence = all.length > 0 ? Math.max(...all.map((r) => r.divergencePp)) : Infinity;
  const divergentBranchesCollapsed = maxDivergence <= 0.5;

  const snap: MultiverseReconciliationCrdtSnapshot = {
    at: new Date().toISOString(),
    reconciliations: all,
    branchQuorum: branchSet.size,
    quorumReached,
    parallelUniverseSynced: parallel?.quorumReached ?? false,
    dagAcyclicPreserved: (cf?.omniverseDagAcyclic ?? false) && (parallel?.dagAcyclicPreserved ?? false),
    consensusReconciledLiftPp,
    divergentBranchesCollapsed,
  };

  return { json: mergeReconciliationIntoJson(previousRaw, snap), snap };
}

export function reconcileMultiverseFromParallelUniverses(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MultiverseReconciliationCrdtSnapshot } {
  const parallel = readParallelUniverseMergeCrdt(previousRaw);
  const lift = parallel?.consensusLiftPp ?? 2.0;
  const cells = RECONCILIATION_BRANCHES.map((branchId, i) => ({
    branchId,
    reconciledLiftPp: lift * (1 - i * 0.02),
  }));
  return ingestMultiverseReconciliations(previousRaw, cells);
}

export function evaluateMultiverseReconciliationCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMultiverseReconciliationCrdtEnabled()) {
    return { passed: true, headline: "Multiverse reconciliation CRDT off", detail: "" };
  }
  if (!isParallelUniverseMergeCrdtEnabled()) {
    return {
      passed: false,
      headline: "Parallel universe merge CRDT required",
      detail: "Enable THEME_EXPERIMENT_PARALLEL_UNIVERSE_MERGE_CRDT=1 (AH5).",
    };
  }
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse counterfactual CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1 (AG5).",
    };
  }
  const parallel = readParallelUniverseMergeCrdt(raw);
  if (!parallel?.quorumReached) {
    return {
      passed: false,
      headline: "Parallel universe merge not ready",
      detail: "Complete AH5 parallel universe merge before reconciliation.",
    };
  }
  const snap = readMultiverseReconciliationCrdt(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Reconciliation branch quorum missing",
      detail: "Collapse prime/echo/shadow branches over parallel merge.",
    };
  }
  if (!snap.divergentBranchesCollapsed) {
    return {
      passed: false,
      headline: "Divergent branches not collapsed",
      detail: "Reconcile lift divergence before publish.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG acyclicity lost in reconciliation",
      detail: "Re-sync parallel universe merge before reconciliation CRDT.",
    };
  }
  return {
    passed: true,
    headline: "Multiverse reconciliation CRDT aligned",
    detail: `${snap.branchQuorum} branches · consensus ${snap.consensusReconciledLiftPp.toFixed(1)}pp`,
  };
}
