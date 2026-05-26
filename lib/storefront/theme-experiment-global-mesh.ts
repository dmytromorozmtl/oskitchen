/**
 * V5 — Global experiment mesh: CRDT outcomes sync across AWS/GCP/Azure + federated publish quorum.
 */

import { createHash } from "node:crypto";
import { mergeCrdtLww, readCrdtLwwState, writeCrdtLwwToJson } from "@/lib/storefront/theme-experiment-crdt-lww";
import { readVersionVector } from "@/lib/storefront/theme-experiment-crdt";
import { readFederatedLearningSnapshot } from "@/lib/storefront/theme-experiment-federated-learning";

export type GlobalMeshCloud = "aws" | "gcp" | "azure";

export type GlobalMeshRegionOutcome = {
  at: string;
  cloud: GlobalMeshCloud;
  region: string;
  armId: string;
  conversions: number;
  checkouts: number;
  liftPp: number;
  vector: number;
  outcomeHash: string;
};

export type GlobalExperimentMeshSnapshot = {
  at: string;
  outcomes: GlobalMeshRegionOutcome[];
  mergedLiftPp: number;
  crdtConflicts: number;
  quorumRequired: number;
  quorumReached: boolean;
  cloudsReporting: GlobalMeshCloud[];
};

export const GLOBAL_MESH_CLOUDS: GlobalMeshCloud[] = ["aws", "gcp", "azure"];

export function isGlobalExperimentMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_GLOBAL_MESH === "1";
}

export function globalMeshQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_GLOBAL_MESH_QUORUM ?? "0.67");
}

export function hashRegionOutcome(o: Omit<GlobalMeshRegionOutcome, "outcomeHash" | "at">): string {
  return createHash("sha256")
    .update(`${o.cloud}:${o.region}:${o.armId}:${o.conversions}:${o.checkouts}:${o.liftPp}`)
    .digest("hex")
    .slice(0, 32);
}

export function readGlobalExperimentMesh(raw: unknown): GlobalExperimentMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).globalExperimentMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    outcomes: Array.isArray(s.outcomes) ? (s.outcomes as GlobalMeshRegionOutcome[]) : [],
    mergedLiftPp: typeof s.mergedLiftPp === "number" ? s.mergedLiftPp : 0,
    crdtConflicts: typeof s.crdtConflicts === "number" ? s.crdtConflicts : 0,
    quorumRequired: typeof s.quorumRequired === "number" ? s.quorumRequired : 2,
    quorumReached: s.quorumReached === true,
    cloudsReporting: Array.isArray(s.cloudsReporting) ? (s.cloudsReporting as GlobalMeshCloud[]) : [],
  };
}

export function mergeGlobalMeshIntoJson(
  previousRaw: unknown,
  snap: GlobalExperimentMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.globalExperimentMesh = snap;
  return base;
}

/** CRDT LWW merge of cross-cloud region outcomes. */
export function ingestGlobalMeshOutcomes(
  previousRaw: unknown,
  incoming: Omit<GlobalMeshRegionOutcome, "at" | "outcomeHash" | "vector">[],
): { json: Record<string, unknown>; snap: GlobalExperimentMeshSnapshot } {
  const prev = readGlobalExperimentMesh(previousRaw);
  const byKey = new Map<string, GlobalMeshRegionOutcome>();

  for (const o of prev?.outcomes ?? []) {
    byKey.set(`${o.cloud}:${o.region}`, o);
  }

  let crdtConflicts = prev?.crdtConflicts ?? 0;
  const vv = readVersionVector(previousRaw);

  for (const cell of incoming) {
    const key = `${cell.cloud}:${cell.region}`;
    const vector = (byKey.get(key)?.vector ?? vv.logical) + 1;
    const entry: GlobalMeshRegionOutcome = {
      at: new Date().toISOString(),
      ...cell,
      vector,
      outcomeHash: hashRegionOutcome({ ...cell, vector }),
    };
    if (byKey.has(key) && byKey.get(key)!.vector >= vector) {
      crdtConflicts++;
    }
    byKey.set(key, entry);
  }

  const outcomes = [...byKey.values()].slice(-60);
  const cloudsReporting = [...new Set(outcomes.map((o) => o.cloud))];
  const quorumRequired = Math.max(2, Math.ceil(GLOBAL_MESH_CLOUDS.length * globalMeshQuorumFraction()));
  const quorumReached = cloudsReporting.length >= quorumRequired;

  let liftSum = 0;
  let liftN = 0;
  for (const o of outcomes) {
    liftSum += o.liftPp;
    liftN++;
  }
  const mergedLiftPp = liftN > 0 ? Math.round((liftSum / liftN) * 10) / 10 : 0;

  const snap: GlobalExperimentMeshSnapshot = {
    at: new Date().toISOString(),
    outcomes,
    mergedLiftPp,
    crdtConflicts,
    quorumRequired,
    quorumReached,
    cloudsReporting,
  };

  let json = mergeGlobalMeshIntoJson(previousRaw, snap);
  const lww = readCrdtLwwState(json) ?? { vector: vv, tombstones: [] };
  const maxVector = outcomes.length > 0 ? Math.max(...outcomes.map((o) => o.vector)) : vv.logical;
  const remote = {
    vector: {
      ...vv,
      logical: maxVector,
      updatedAt: new Date().toISOString(),
    },
    tombstones: lww.tombstones,
  };
  const { merged, conflict } = mergeCrdtLww(lww, remote);
  if (conflict) snap.crdtConflicts += 1;
  json = writeCrdtLwwToJson(json, merged);
  json = mergeGlobalMeshIntoJson(json, snap);

  return { json, snap };
}

export function evaluateGlobalMeshPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isGlobalExperimentMeshEnabled()) {
    return { passed: true, headline: "Global mesh off", detail: "" };
  }
  const mesh = readGlobalExperimentMesh(raw);
  const federated = readFederatedLearningSnapshot(raw);

  if (!mesh) {
    return {
      passed: true,
      headline: "Awaiting global mesh sync",
      detail: "Cross-cloud outcomes not merged yet.",
    };
  }
  if (!mesh.quorumReached) {
    return {
      passed: false,
      headline: `Federated quorum ${mesh.cloudsReporting.length}/${mesh.quorumRequired}`,
      detail: `Need ${mesh.quorumRequired} clouds (aws/gcp/azure) reporting.`,
    };
  }
  if (federated?.piiExportBlocked) {
    return {
      passed: false,
      headline: "Federated privacy budget blocks mesh publish",
      detail: "R1 federated learning budget exhausted.",
    };
  }
  if (mesh.crdtConflicts > 50) {
    return {
      passed: false,
      headline: `CRDT conflicts elevated (${mesh.crdtConflicts})`,
      detail: "Resolve cross-region outcome divergence before publish.",
    };
  }
  return {
    passed: true,
    headline: `Global mesh OK (lift ${mesh.mergedLiftPp}pp)`,
    detail: `${mesh.cloudsReporting.join(", ")} · quorum ${mesh.quorumRequired}`,
  };
}
