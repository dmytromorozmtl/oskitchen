/**
 * Z5 — Galactic mesh quorum: Andromeda relay + intergalactic CRDT merge (Y5 heliopause + V5 global mesh).
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  ingestGlobalMeshOutcomes,
  isGlobalExperimentMeshEnabled,
  readGlobalExperimentMesh,
  type GlobalMeshCloud,
} from "@/lib/storefront/theme-experiment-global-mesh";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";

export type GalacticRelayId = "andromeda_relay" | "milky_way_hub" | "intergalactic_edge";

export type GalacticMeshOutcome = {
  at: string;
  relay: GalacticRelayId;
  cloud: GlobalMeshCloud;
  region: string;
  armId: string;
  conversions: number;
  checkouts: number;
  liftPp: number;
  latencyLy: number;
  crdtVector: number;
};

export type GalacticMeshSnapshot = {
  at: string;
  outcomes: GalacticMeshOutcome[];
  intergalacticQuorum: number;
  quorumReached: boolean;
  globalMeshQuorumReached: boolean;
  heliopauseSynced: boolean;
  mergedLiftPp: number;
};

export const GALACTIC_RELAYS: GalacticRelayId[] = ["andromeda_relay", "milky_way_hub", "intergalactic_edge"];

export function isGalacticMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_GALACTIC_MESH === "1";
}

export function galacticMeshQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_GALACTIC_MESH_QUORUM ?? "0.67");
}

export function readGalacticMesh(raw: unknown): GalacticMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).galacticExperimentMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    outcomes: Array.isArray(s.outcomes) ? (s.outcomes as GalacticMeshOutcome[]) : [],
    intergalacticQuorum: typeof s.intergalacticQuorum === "number" ? s.intergalacticQuorum : 0,
    quorumReached: s.quorumReached === true,
    globalMeshQuorumReached: s.globalMeshQuorumReached === true,
    heliopauseSynced: s.heliopauseSynced === true,
    mergedLiftPp: typeof s.mergedLiftPp === "number" ? s.mergedLiftPp : 0,
  };
}

function mergeGalacticIntoJson(
  previousRaw: unknown,
  snap: GalacticMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.galacticExperimentMesh = snap;
  return base;
}

export function ingestGalacticMeshOutcomes(
  previousRaw: unknown,
  cells: Omit<GalacticMeshOutcome, "at" | "crdtVector">[],
): { json: Record<string, unknown>; snap: GalacticMeshSnapshot } {
  const prev = readGalacticMesh(previousRaw);
  const outcomes: GalacticMeshOutcome[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    crdtVector: (prev?.outcomes.length ?? 0) + i + 1,
  }));

  const all = [...(prev?.outcomes ?? []), ...outcomes].slice(-90);
  const relays = new Set(all.map((o) => o.relay));
  const quorumRequired = Math.max(2, Math.ceil(GALACTIC_RELAYS.length * galacticMeshQuorumFraction()));
  const quorumReached = relays.size >= quorumRequired;

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (quorumReached) {
    const meshCells = all.map((o) => ({
      cloud: o.cloud,
      region: `galactic-${o.region}`,
      armId: o.armId,
      conversions: o.conversions,
      checkouts: o.checkouts,
      liftPp: o.liftPp,
    }));
    const merged = ingestGlobalMeshOutcomes(json, meshCells);
    json = merged.json;
  }

  const globalMesh = readGlobalExperimentMesh(json);
  const helio = readHeliopauseDtn(json);
  const mergedLiftPp =
    all.length > 0 ? all.reduce((s, o) => s + o.liftPp, 0) / all.length : 0;

  const snap: GalacticMeshSnapshot = {
    at: new Date().toISOString(),
    outcomes: all,
    intergalacticQuorum: relays.size,
    quorumReached,
    globalMeshQuorumReached: globalMesh?.quorumReached ?? false,
    heliopauseSynced: helio ? helio.pendingBundles === 0 : false,
    mergedLiftPp,
  };

  json = mergeGalacticIntoJson(json, snap);
  return { json, snap };
}

export function evaluateGalacticMeshPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isGalacticMeshEnabled()) {
    return { passed: true, headline: "Galactic mesh off", detail: "" };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (Y5).",
    };
  }
  if (!isGlobalExperimentMeshEnabled()) {
    return {
      passed: false,
      headline: "Global mesh required",
      detail: "Enable THEME_EXPERIMENT_GLOBAL_MESH=1 (V5).",
    };
  }
  const gal = readGalacticMesh(raw);
  const helio = readHeliopauseDtn(raw);
  const globalMesh = readGlobalExperimentMesh(raw);

  if (!gal || gal.outcomes.length === 0) {
    return {
      passed: true,
      headline: "Awaiting galactic outcomes",
      detail: "Andromeda relay bundles not merged yet.",
    };
  }
  if (!gal.quorumReached) {
    return {
      passed: false,
      headline: "Intergalactic quorum missing",
      detail: `${gal.intergalacticQuorum}/${GALACTIC_RELAYS.length} relays reporting`,
    };
  }
  if (!gal.globalMeshQuorumReached && globalMesh && !globalMesh.quorumReached) {
    return {
      passed: false,
      headline: "Galactic path needs global mesh quorum",
      detail: "CRDT merge into AWS/GCP/Azure incomplete.",
    };
  }
  if (helio && helio.pendingBundles > 0) {
    return {
      passed: false,
      headline: "Heliopause backlog blocks galactic publish",
      detail: "Clear deep-space pending bundles first.",
    };
  }
  return {
    passed: true,
    headline: `Galactic mesh OK (${gal.outcomes.length} outcomes)`,
    detail: `Lift ~${gal.mergedLiftPp.toFixed(1)}pp · ${gal.intergalacticQuorum} relays`,
  };
}
