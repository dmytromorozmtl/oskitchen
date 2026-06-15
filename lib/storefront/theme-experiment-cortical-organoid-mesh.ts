/**
 * Z2 — Cortical organoid mesh: shared wetware plasticity graph across storefronts (Y2 organoid).
 */

import type { WetwareSynapse } from "@/lib/storefront/theme-experiment-wetware-calibration";
import { toJsonValue } from "@/lib/prisma/json";
import { readWetwareCalibration } from "@/lib/storefront/theme-experiment-wetware-calibration";
import {
  isOrganoidWetwareEnabled,
  shouldUseOrganoidWetware,
} from "@/lib/storefront/theme-experiment-organoid-wetware";

export type CorticalMeshEdge = {
  fromStore: string;
  toStore: string;
  armId: string;
  sharedPlasticity: number;
  weight: number;
};

export type CorticalOrganoidMeshSnapshot = {
  at: string;
  nodes: string[];
  edges: CorticalMeshEdge[];
  mergedSynapses: WetwareSynapse[];
  graphQuorum: number;
  meshSynced: boolean;
};

export function isCorticalOrganoidMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CORTICAL_ORGANOID_MESH === "1";
}

export function corticalMeshStoreQuorum(): number {
  return Number(process.env.THEME_EXPERIMENT_CORTICAL_MESH_QUORUM ?? "2");
}

export function readCorticalOrganoidMesh(raw: unknown): CorticalOrganoidMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).corticalOrganoidMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    nodes: Array.isArray(s.nodes) ? (s.nodes as string[]) : [],
    edges: Array.isArray(s.edges) ? (s.edges as CorticalMeshEdge[]) : [],
    mergedSynapses: Array.isArray(s.mergedSynapses) ? (s.mergedSynapses as WetwareSynapse[]) : [],
    graphQuorum: typeof s.graphQuorum === "number" ? s.graphQuorum : 0,
    meshSynced: s.meshSynced === true,
  };
}

function mergeSynapsesAcrossStores(
  local: WetwareSynapse[],
  peers: { storeSlug: string; synapses: WetwareSynapse[] }[],
): WetwareSynapse[] {
  const byArm = new Map<string, { weight: number; plasticity: number; updates: number; n: number }>();

  const ingest = (synapses: WetwareSynapse[]) => {
    for (const s of synapses) {
      const e = byArm.get(s.armId) ?? { weight: 0, plasticity: 0, updates: 0, n: 0 };
      e.weight += s.weight;
      e.plasticity += s.plasticity;
      e.updates += s.updates;
      e.n += 1;
      byArm.set(s.armId, e);
    }
  };

  ingest(local);
  for (const p of peers) ingest(p.synapses);

  return [...byArm.entries()].map(([armId, e]) => ({
    armId,
    weight: Math.round(e.weight / Math.max(1, e.n)),
    lastOutcome: "neutral" as const,
    plasticity: Math.round((e.plasticity / Math.max(1, e.n)) * 100) / 100,
    updates: e.updates,
  }));
}

export function mergeCorticalOrganoidMesh(
  previousRaw: unknown,
  localStoreSlug: string,
  peerGraphs: { storeSlug: string; synapses: WetwareSynapse[] }[],
): { json: Record<string, unknown>; snap: CorticalOrganoidMeshSnapshot } {
  const cal = readWetwareCalibration(previousRaw);
  const localSynapses = cal?.synapses ?? [];

  const edges: CorticalMeshEdge[] = [];
  for (const peer of peerGraphs) {
    for (const syn of peer.synapses) {
      const localSyn = localSynapses.find((s) => s.armId === syn.armId);
      if (!localSyn) continue;
      edges.push({
        fromStore: localStoreSlug,
        toStore: peer.storeSlug,
        armId: syn.armId,
        sharedPlasticity: (localSyn.plasticity + syn.plasticity) / 2,
        weight: Math.round((localSyn.weight + syn.weight) / 2),
      });
    }
  }

  const nodes = new Set([localStoreSlug, ...peerGraphs.map((p) => p.storeSlug)]);
  const mergedSynapses = mergeSynapsesAcrossStores(localSynapses, peerGraphs);
  const graphQuorum = nodes.size;
  const meshSynced = graphQuorum >= corticalMeshStoreQuorum() && edges.length > 0;

  const snap: CorticalOrganoidMeshSnapshot = {
    at: new Date().toISOString(),
    nodes: [...nodes],
    edges: edges.slice(-500),
    mergedSynapses,
    graphQuorum,
    meshSynced,
  };

  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.corticalOrganoidMesh = snap;
  return { json: base, snap };
}

/** Apply cortical mesh merged weights into wetware calibration snapshot. */
export function applyCorticalMeshToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const mesh = readCorticalOrganoidMesh(previousRaw);
  const cal = readWetwareCalibration(previousRaw);
  if (!mesh?.meshSynced || !cal || mesh.mergedSynapses.length === 0) {
    return previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  }
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.wetwareCalibration = {
    ...cal,
    synapses: mesh.mergedSynapses,
    at: new Date().toISOString(),
  };
  return base;
}

export function evaluateCorticalOrganoidMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCorticalOrganoidMeshEnabled()) {
    return { passed: true, headline: "Cortical organoid mesh off", detail: "" };
  }
  if (!isOrganoidWetwareEnabled()) {
    return {
      passed: false,
      headline: "Organoid wetware required",
      detail: "Enable THEME_EXPERIMENT_ORGANOID_WETWARE=1 (Y2).",
    };
  }
  if (!shouldUseOrganoidWetware(raw)) {
    return {
      passed: true,
      headline: "Cortical mesh standby",
      detail: "Activates with organoid path (>64 factorial cells).",
    };
  }
  const mesh = readCorticalOrganoidMesh(raw);
  if (!mesh || !mesh.meshSynced) {
    return {
      passed: false,
      headline: "Cortical plasticity graph not synced",
      detail: `Need ${corticalMeshStoreQuorum()} storefronts in mesh.`,
    };
  }
  return {
    passed: true,
    headline: `Cortical mesh OK (${mesh.nodes.length} nodes)`,
    detail: `${mesh.edges.length} edges · ${mesh.mergedSynapses.length} merged synapses`,
  };
}
