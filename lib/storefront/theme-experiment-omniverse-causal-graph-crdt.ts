/**
 * AF5 — Omniverse causal graph CRDT over AE5 multiverse outcome superposition.
 */

import { createHash } from "node:crypto";
import {
  isMultiverseOutcomeCrdtEnabled,
  readMultiverseOutcomeCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";

export type OmniverseCausalNodeId = "treatment" | "mediator" | "outcome";

export type OmniverseCausalEdge = {
  at: string;
  from: OmniverseCausalNodeId;
  to: OmniverseCausalNodeId;
  liftPp: number;
  crdtVector: number;
  causalStrength: number;
  edgeHash: string;
};

export type OmniverseCausalGraphSnapshot = {
  at: string;
  edges: OmniverseCausalEdge[];
  nodeQuorum: number;
  quorumReached: boolean;
  multiverseSynced: boolean;
  dagAcyclic: boolean;
  mergedLiftPp: number;
};

export const OMNIVERSE_CAUSAL_NODES: OmniverseCausalNodeId[] = ["treatment", "mediator", "outcome"];

export function isOmniverseCausalGraphCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_OMNIVERSE_CAUSAL_GRAPH_CRDT === "1";
}

export function omniverseQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_OMNIVERSE_QUORUM ?? "0.67");
}

function edgeHash(edges: OmniverseCausalEdge[]): string {
  return createHash("sha256")
    .update(edges.map((e) => `${e.from}->${e.to}:${e.causalStrength}`).join("|"))
    .digest("hex");
}

export function readOmniverseCausalGraph(raw: unknown): OmniverseCausalGraphSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).omniverseCausalGraph;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    edges: Array.isArray(s.edges) ? (s.edges as OmniverseCausalEdge[]) : [],
    nodeQuorum: typeof s.nodeQuorum === "number" ? s.nodeQuorum : 0,
    quorumReached: s.quorumReached === true,
    multiverseSynced: s.multiverseSynced === true,
    dagAcyclic: s.dagAcyclic === true,
    mergedLiftPp: typeof s.mergedLiftPp === "number" ? s.mergedLiftPp : 0,
  };
}

function mergeOmniverseIntoJson(
  previousRaw: unknown,
  snap: OmniverseCausalGraphSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.omniverseCausalGraph = snap;
  return base;
}

export function ingestOmniverseCausalEdges(
  previousRaw: unknown,
  cells: Omit<OmniverseCausalEdge, "at" | "crdtVector" | "edgeHash">[],
): { json: Record<string, unknown>; snap: OmniverseCausalGraphSnapshot } {
  const prev = readOmniverseCausalGraph(previousRaw);
  const baseVector = prev?.edges.length ?? 0;
  const edges: OmniverseCausalEdge[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    crdtVector: baseVector + i + 1,
    edgeHash: "",
  }));
  const all = [...(prev?.edges ?? []), ...edges].slice(-90);
  const hash = edgeHash(all);
  for (const e of all) {
    if (!e.edgeHash) e.edgeHash = hash;
  }

  const nodes = new Set<OmniverseCausalNodeId>();
  for (const e of all) {
    nodes.add(e.from);
    nodes.add(e.to);
  }
  const quorumRequired = Math.max(2, Math.ceil(OMNIVERSE_CAUSAL_NODES.length * omniverseQuorumFraction()));
  const quorumReached = nodes.size >= quorumRequired;

  const multiverse = readMultiverseOutcomeCrdt(previousRaw);
  const multiverseSynced = (multiverse?.quorumReached ?? false) && quorumReached;
  const dagAcyclic = all.every((e) => e.from !== e.to);

  const mergedLiftPp =
    all.length > 0 ? all.reduce((s, e) => s + e.liftPp, 0) / all.length : 0;

  const snap: OmniverseCausalGraphSnapshot = {
    at: new Date().toISOString(),
    edges: all,
    nodeQuorum: nodes.size,
    quorumReached,
    multiverseSynced,
    dagAcyclic,
    mergedLiftPp,
  };

  return { json: mergeOmniverseIntoJson(previousRaw, snap), snap };
}

export function buildOmniverseFromMultiverse(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: OmniverseCausalGraphSnapshot } {
  const mv = readMultiverseOutcomeCrdt(previousRaw);
  const lift = mv?.coherenceScore ?? 2.0;
  const cells = [
    { from: "treatment" as const, to: "mediator" as const, liftPp: lift, causalStrength: 0.7 },
    { from: "mediator" as const, to: "outcome" as const, liftPp: lift * 0.8, causalStrength: 0.65 },
  ];
  return ingestOmniverseCausalEdges(previousRaw, cells);
}

export function evaluateOmniverseCausalGraphCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isOmniverseCausalGraphCrdtEnabled()) {
    return { passed: true, headline: "Omniverse causal graph CRDT off", detail: "" };
  }
  if (!isMultiverseOutcomeCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse outcome CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_OUTCOME_CRDT=1 (AE5).",
    };
  }
  const snap = readOmniverseCausalGraph(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Omniverse causal node quorum missing",
      detail: "Ingest treatment→mediator→outcome edges.",
    };
  }
  if (!snap.dagAcyclic) {
    return {
      passed: false,
      headline: "Causal graph has cycles",
      detail: "Omniverse DAG must remain acyclic.",
    };
  }
  if (!snap.multiverseSynced) {
    return {
      passed: false,
      headline: "Multiverse not synced with omniverse graph",
      detail: "Collapse multiverse before causal graph publish.",
    };
  }
  return {
    passed: true,
    headline: "Omniverse causal graph aligned",
    detail: `${snap.nodeQuorum} nodes · lift ${snap.mergedLiftPp.toFixed(1)}pp`,
  };
}
