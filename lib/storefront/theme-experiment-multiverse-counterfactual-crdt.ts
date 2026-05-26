/**
 * AG5 — Multiverse counterfactual branches CRDT over AF5 omniverse causal graph.
 */

import { createHash } from "node:crypto";
import {
  isOmniverseCausalGraphCrdtEnabled,
  readOmniverseCausalGraph,
} from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";
import {
  isMultiverseOutcomeCrdtEnabled,
  readMultiverseOutcomeCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";

export type CounterfactualBranchId = "what_if_draft" | "what_if_published" | "what_if_holdout";

export type CounterfactualBranch = {
  at: string;
  branchId: CounterfactualBranchId;
  parentCollapsedArm: string;
  liftPpDelta: number;
  crdtVersion: number;
  omniverseToken: string | null;
};

export type MultiverseCounterfactualCrdtSnapshot = {
  at: string;
  branches: CounterfactualBranch[];
  branchQuorum: number;
  quorumReached: boolean;
  omniverseDagAcyclic: boolean;
  omniverseSynced: boolean;
  mergedWhatIfLiftPp: number;
};

export const COUNTERFACTUAL_BRANCHES: CounterfactualBranchId[] = [
  "what_if_draft",
  "what_if_published",
  "what_if_holdout",
];

export function isMultiverseCounterfactualCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT === "1";
}

export function counterfactualQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_COUNTERFACTUAL_QUORUM ?? "0.67");
}

export function readMultiverseCounterfactualCrdt(raw: unknown): MultiverseCounterfactualCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).multiverseCounterfactualCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    branches: Array.isArray(s.branches) ? (s.branches as CounterfactualBranch[]) : [],
    branchQuorum: typeof s.branchQuorum === "number" ? s.branchQuorum : 0,
    quorumReached: s.quorumReached === true,
    omniverseDagAcyclic: s.omniverseDagAcyclic === true,
    omniverseSynced: s.omniverseSynced === true,
    mergedWhatIfLiftPp: typeof s.mergedWhatIfLiftPp === "number" ? s.mergedWhatIfLiftPp : 0,
  };
}

function mergeCounterfactualIntoJson(
  previousRaw: unknown,
  snap: MultiverseCounterfactualCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.multiverseCounterfactualCrdt = snap;
  return base;
}

export function ingestCounterfactualBranches(
  previousRaw: unknown,
  cells: Omit<CounterfactualBranch, "at" | "omniverseToken" | "crdtVersion">[],
): { json: Record<string, unknown>; snap: MultiverseCounterfactualCrdtSnapshot } {
  const omni = readOmniverseCausalGraph(previousRaw);
  const mv = readMultiverseOutcomeCrdt(previousRaw);
  const token = omni
    ? createHash("sha256")
        .update(`${omni.nodeQuorum}:${omni.mergedLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const prev = readMultiverseCounterfactualCrdt(previousRaw);
  const baseVersion = prev?.branches.length ?? 0;
  const parentArm = mv?.collapsedArmId ?? "draft";

  const branches: CounterfactualBranch[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    parentCollapsedArm: c.parentCollapsedArm || parentArm,
    crdtVersion: baseVersion + i + 1,
    omniverseToken: token,
  }));

  const all = [...(prev?.branches ?? []), ...branches].slice(-72);
  const branchSet = new Set(all.map((b) => b.branchId));
  const quorumRequired = Math.max(2, Math.ceil(COUNTERFACTUAL_BRANCHES.length * counterfactualQuorumFraction()));
  const quorumReached = branchSet.size >= quorumRequired;

  const mergedWhatIfLiftPp =
    all.length > 0 ? all.reduce((s, b) => s + b.liftPpDelta, 0) / all.length : 0;

  const snap: MultiverseCounterfactualCrdtSnapshot = {
    at: new Date().toISOString(),
    branches: all,
    branchQuorum: branchSet.size,
    quorumReached,
    omniverseDagAcyclic: omni?.dagAcyclic ?? false,
    omniverseSynced: (omni?.quorumReached ?? false) && (mv?.quorumReached ?? false),
    mergedWhatIfLiftPp,
  };

  return { json: mergeCounterfactualIntoJson(previousRaw, snap), snap };
}

export function buildCounterfactualsFromOmniverse(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MultiverseCounterfactualCrdtSnapshot } {
  const omni = readOmniverseCausalGraph(previousRaw);
  const lift = omni?.mergedLiftPp ?? 2.0;
  const cells = COUNTERFACTUAL_BRANCHES.map((branchId, i) => ({
    branchId,
    parentCollapsedArm: readMultiverseOutcomeCrdt(previousRaw)?.collapsedArmId ?? "draft",
    liftPpDelta: lift * (0.9 - i * 0.1),
  }));
  return ingestCounterfactualBranches(previousRaw, cells);
}

export function evaluateMultiverseCounterfactualCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return { passed: true, headline: "Multiverse counterfactual CRDT off", detail: "" };
  }
  if (!isOmniverseCausalGraphCrdtEnabled()) {
    return {
      passed: false,
      headline: "Omniverse causal graph required",
      detail: "Enable THEME_EXPERIMENT_OMNIVERSE_CAUSAL_GRAPH_CRDT=1 (AF5).",
    };
  }
  const omni = readOmniverseCausalGraph(raw);
  if (!omni?.dagAcyclic) {
    return {
      passed: false,
      headline: "Omniverse DAG not acyclic",
      detail: "Resolve causal cycles before counterfactual branches.",
    };
  }
  const snap = readMultiverseCounterfactualCrdt(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Counterfactual branch quorum missing",
      detail: "Ingest what-if branches over collapsed arm.",
    };
  }
  if (!snap.omniverseSynced) {
    return {
      passed: false,
      headline: "Omniverse not synced with counterfactuals",
      detail: "Run omniverse sync before counterfactual CRDT publish.",
    };
  }
  return {
    passed: true,
    headline: "Multiverse counterfactual CRDT aligned",
    detail: `${snap.branchQuorum} branches · lift ${snap.mergedWhatIfLiftPp.toFixed(1)}pp`,
  };
}
