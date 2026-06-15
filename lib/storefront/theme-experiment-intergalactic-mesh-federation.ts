/**
 * AA5 — Intergalactic mesh federation: Laniakea supercluster CRDT + wormhole latency SLO (Z5 + V5).
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  ingestGalacticMeshOutcomes,
  isGalacticMeshEnabled,
  readGalacticMesh,
  type GalacticRelayId,
} from "@/lib/storefront/theme-experiment-galactic-mesh";
import {
  isGlobalExperimentMeshEnabled,
  readGlobalExperimentMesh,
  type GlobalMeshCloud,
} from "@/lib/storefront/theme-experiment-global-mesh";

export type LaniakeaClusterId = "virgo" | "hydra_centaurus" | "fornax";

export type IntergalacticFederationOutcome = {
  at: string;
  cluster: LaniakeaClusterId;
  relay: GalacticRelayId;
  cloud: GlobalMeshCloud;
  region: string;
  armId: string;
  conversions: number;
  checkouts: number;
  liftPp: number;
  wormholeLatencyMs: number;
  crdtVector: number;
};

export type IntergalacticMeshFederationSnapshot = {
  at: string;
  outcomes: IntergalacticFederationOutcome[];
  superclusterQuorum: number;
  quorumReached: boolean;
  galacticMeshSynced: boolean;
  globalMeshQuorumReached: boolean;
  wormholeSloMet: boolean;
  maxWormholeLatencyMs: number;
  mergedLiftPp: number;
};

export const LANIAKEA_CLUSTERS: LaniakeaClusterId[] = ["virgo", "hydra_centaurus", "fornax"];

export function isIntergalacticMeshFederationEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_INTERGALACTIC_MESH_FEDERATION === "1";
}

export function intergalacticMeshQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_INTERGALACTIC_MESH_QUORUM ?? "0.67");
}

export function wormholeLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_WORMHOLE_LATENCY_SLO_MS ?? "500");
}

export function readIntergalacticMeshFederation(raw: unknown): IntergalacticMeshFederationSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).intergalacticMeshFederation;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    outcomes: Array.isArray(s.outcomes) ? (s.outcomes as IntergalacticFederationOutcome[]) : [],
    superclusterQuorum: typeof s.superclusterQuorum === "number" ? s.superclusterQuorum : 0,
    quorumReached: s.quorumReached === true,
    galacticMeshSynced: s.galacticMeshSynced === true,
    globalMeshQuorumReached: s.globalMeshQuorumReached === true,
    wormholeSloMet: s.wormholeSloMet === true,
    maxWormholeLatencyMs: typeof s.maxWormholeLatencyMs === "number" ? s.maxWormholeLatencyMs : 0,
    mergedLiftPp: typeof s.mergedLiftPp === "number" ? s.mergedLiftPp : 0,
  };
}

function mergeIntergalacticIntoJson(
  previousRaw: unknown,
  snap: IntergalacticMeshFederationSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.intergalacticMeshFederation = snap;
  return base;
}

export function ingestIntergalacticFederationOutcomes(
  previousRaw: unknown,
  cells: Omit<IntergalacticFederationOutcome, "at" | "crdtVector">[],
): { json: Record<string, unknown>; snap: IntergalacticMeshFederationSnapshot } {
  const prev = readIntergalacticMeshFederation(previousRaw);
  const outcomes: IntergalacticFederationOutcome[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    crdtVector: (prev?.outcomes.length ?? 0) + i + 1,
  }));

  const all = [...(prev?.outcomes ?? []), ...outcomes].slice(-120);
  const clusters = new Set(all.map((o) => o.cluster));
  const quorumRequired = Math.max(2, Math.ceil(LANIAKEA_CLUSTERS.length * intergalacticMeshQuorumFraction()));
  const quorumReached = clusters.size >= quorumRequired;

  const slo = wormholeLatencySloMs();
  const maxLatency = all.length > 0 ? Math.max(...all.map((o) => o.wormholeLatencyMs)) : 0;
  const wormholeSloMet = maxLatency <= slo;

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (quorumReached) {
    const galacticCells = all.map((o) => ({
      relay: o.relay,
      cloud: o.cloud,
      region: `laniakea-${o.region}`,
      armId: o.armId,
      conversions: o.conversions,
      checkouts: o.checkouts,
      liftPp: o.liftPp,
      latencyLy: o.wormholeLatencyMs / 1_000_000,
    }));
    const merged = ingestGalacticMeshOutcomes(json, galacticCells);
    json = merged.json;
  }

  const gal = readGalacticMesh(json);
  const globalMesh = readGlobalExperimentMesh(json);
  const mergedLiftPp =
    all.length > 0 ? all.reduce((s, o) => s + o.liftPp, 0) / all.length : 0;

  const snap: IntergalacticMeshFederationSnapshot = {
    at: new Date().toISOString(),
    outcomes: all,
    superclusterQuorum: clusters.size,
    quorumReached,
    galacticMeshSynced: gal?.quorumReached ?? false,
    globalMeshQuorumReached: globalMesh?.quorumReached ?? false,
    wormholeSloMet,
    maxWormholeLatencyMs: maxLatency,
    mergedLiftPp,
  };

  json = mergeIntergalacticIntoJson(json, snap);
  return { json, snap };
}

export function evaluateIntergalacticMeshFederationGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIntergalacticMeshFederationEnabled()) {
    return { passed: true, headline: "Intergalactic mesh federation off", detail: "" };
  }
  if (!isGalacticMeshEnabled()) {
    return {
      passed: false,
      headline: "Galactic mesh required",
      detail: "Enable THEME_EXPERIMENT_GALACTIC_MESH=1 (Z5).",
    };
  }
  if (!isGlobalExperimentMeshEnabled()) {
    return {
      passed: false,
      headline: "Global mesh required",
      detail: "Enable THEME_EXPERIMENT_GLOBAL_MESH=1 (V5).",
    };
  }
  const fed = readIntergalacticMeshFederation(raw);
  const gal = readGalacticMesh(raw);
  const globalMesh = readGlobalExperimentMesh(raw);

  if (!fed || fed.outcomes.length === 0) {
    return {
      passed: true,
      headline: "Awaiting Laniakea outcomes",
      detail: "Supercluster federation bundles not merged yet.",
    };
  }
  if (!fed.quorumReached) {
    return {
      passed: false,
      headline: "Laniakea supercluster quorum missing",
      detail: `${fed.superclusterQuorum}/${LANIAKEA_CLUSTERS.length} clusters reporting`,
    };
  }
  if (!fed.wormholeSloMet) {
    return {
      passed: false,
      headline: "Wormhole latency SLO breached",
      detail: `Max ${fed.maxWormholeLatencyMs}ms > SLO ${wormholeLatencySloMs()}ms`,
    };
  }
  if (!fed.galacticMeshSynced && gal && !gal.quorumReached) {
    return {
      passed: false,
      headline: "Intergalactic path needs galactic mesh",
      detail: "Z5 galactic quorum incomplete.",
    };
  }
  if (!fed.globalMeshQuorumReached && globalMesh && !globalMesh.quorumReached) {
    return {
      passed: false,
      headline: "Intergalactic path needs global mesh quorum",
      detail: "V5 CRDT merge incomplete.",
    };
  }
  return {
    passed: true,
    headline: `Intergalactic federation OK (${fed.outcomes.length} outcomes)`,
    detail: `Lift ~${fed.mergedLiftPp.toFixed(1)}pp · wormhole ≤${fed.maxWormholeLatencyMs}ms`,
  };
}
