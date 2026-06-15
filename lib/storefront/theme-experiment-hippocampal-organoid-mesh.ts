/**
 * AA2 — Hippocampal organoid mesh: temporal plasticity windows over Z2 cortical graph.
 */

import type { WetwareSynapse } from "@/lib/storefront/theme-experiment-wetware-calibration";
import { toJsonValue } from "@/lib/prisma/json";
import { readWetwareCalibration } from "@/lib/storefront/theme-experiment-wetware-calibration";
import {
  isCorticalOrganoidMeshEnabled,
  readCorticalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";
import {
  isOrganoidWetwareEnabled,
  shouldUseOrganoidWetware,
} from "@/lib/storefront/theme-experiment-organoid-wetware";

export type HippocampalPlasticityWindow = {
  windowId: string;
  startAt: string;
  endAt: string;
  armId: string;
  fromStore: string;
  plasticityBoost: number;
  decayFactor: number;
};

export type HippocampalOrganoidMeshSnapshot = {
  at: string;
  windows: HippocampalPlasticityWindow[];
  activeWindowCount: number;
  temporalQuorum: number;
  hippocampalSynced: boolean;
  boostedSynapses: WetwareSynapse[];
};

export function isHippocampalOrganoidMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH === "1";
}

export function hippocampalWindowTtlMs(): number {
  return Number(process.env.THEME_EXPERIMENT_HIPPOCAMPAL_WINDOW_TTL_MS ?? "3600000");
}

export function hippocampalMinActiveWindows(): number {
  return Number(process.env.THEME_EXPERIMENT_HIPPOCAMPAL_MIN_WINDOWS ?? "2");
}

export function readHippocampalOrganoidMesh(raw: unknown): HippocampalOrganoidMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).hippocampalOrganoidMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    windows: Array.isArray(s.windows) ? (s.windows as HippocampalPlasticityWindow[]) : [],
    activeWindowCount: typeof s.activeWindowCount === "number" ? s.activeWindowCount : 0,
    temporalQuorum: typeof s.temporalQuorum === "number" ? s.temporalQuorum : 0,
    hippocampalSynced: s.hippocampalSynced === true,
    boostedSynapses: Array.isArray(s.boostedSynapses) ? (s.boostedSynapses as WetwareSynapse[]) : [],
  };
}

function buildWindowsFromCortical(
  previousRaw: unknown,
): HippocampalPlasticityWindow[] {
  const cort = readCorticalOrganoidMesh(previousRaw);
  if (!cort?.meshSynced) return [];

  const now = Date.now();
  const ttl = hippocampalWindowTtlMs();
  return cort.edges.slice(0, 200).map((edge, i) => ({
    windowId: `hippo-${edge.fromStore}-${edge.toStore}-${edge.armId}-${i}`,
    startAt: new Date(now - ttl / 2).toISOString(),
    endAt: new Date(now + ttl / 2).toISOString(),
    armId: edge.armId,
    fromStore: edge.fromStore,
    plasticityBoost: edge.sharedPlasticity * 0.15,
    decayFactor: 0.95,
  }));
}

function applyWindowsToSynapses(
  synapses: WetwareSynapse[],
  windows: HippocampalPlasticityWindow[],
): WetwareSynapse[] {
  const now = Date.now();
  const active = windows.filter(
    (w) => new Date(w.startAt).getTime() <= now && new Date(w.endAt).getTime() >= now,
  );
  const boostByArm = new Map<string, number>();
  for (const w of active) {
    boostByArm.set(w.armId, (boostByArm.get(w.armId) ?? 0) + w.plasticityBoost);
  }

  return synapses.map((s) => {
    const boost = boostByArm.get(s.armId) ?? 0;
    if (boost <= 0) return s;
    return {
      ...s,
      plasticity: Math.min(2, Math.round((s.plasticity + boost) * 100) / 100),
      weight: Math.round(s.weight * (1 + boost * 0.05)),
    };
  });
}

export function mergeHippocampalOrganoidMesh(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: HippocampalOrganoidMeshSnapshot } {
  const cort = readCorticalOrganoidMesh(previousRaw);
  const cal = readWetwareCalibration(previousRaw);
  const windows = buildWindowsFromCortical(previousRaw);
  const now = Date.now();
  const active = windows.filter(
    (w) => new Date(w.startAt).getTime() <= now && new Date(w.endAt).getTime() >= now,
  );
  const boostedSynapses = applyWindowsToSynapses(
    cort?.mergedSynapses ?? cal?.synapses ?? [],
    windows,
  );
  const hippocampalSynced =
    (cort?.meshSynced ?? false) && active.length >= hippocampalMinActiveWindows();

  const snap: HippocampalOrganoidMeshSnapshot = {
    at: new Date().toISOString(),
    windows: windows.slice(-300),
    activeWindowCount: active.length,
    temporalQuorum: new Set(active.map((w) => w.fromStore)).size,
    hippocampalSynced,
    boostedSynapses,
  };

  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.hippocampalOrganoidMesh = snap;
  return { json: base, snap };
}

export function applyHippocampalMeshToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const hippo = readHippocampalOrganoidMesh(previousRaw);
  const cal = readWetwareCalibration(previousRaw);
  if (!hippo?.hippocampalSynced || !cal || hippo.boostedSynapses.length === 0) {
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
    synapses: hippo.boostedSynapses,
    at: new Date().toISOString(),
  };
  return base;
}

export function evaluateHippocampalOrganoidMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHippocampalOrganoidMeshEnabled()) {
    return { passed: true, headline: "Hippocampal organoid mesh off", detail: "" };
  }
  if (!isCorticalOrganoidMeshEnabled()) {
    return {
      passed: false,
      headline: "Cortical organoid mesh required",
      detail: "Enable THEME_EXPERIMENT_CORTICAL_ORGANOID_MESH=1 (Z2).",
    };
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
      headline: "Hippocampal mesh standby",
      detail: "Activates with cortical organoid path.",
    };
  }
  const hippo = readHippocampalOrganoidMesh(raw);
  if (!hippo || !hippo.hippocampalSynced) {
    return {
      passed: false,
      headline: "Temporal plasticity windows not synced",
      detail: `Need ${hippocampalMinActiveWindows()} active windows over cortical graph.`,
    };
  }
  return {
    passed: true,
    headline: `Hippocampal mesh OK (${hippo.activeWindowCount} windows)`,
    detail: `${hippo.temporalQuorum} stores · ${hippo.boostedSynapses.length} boosted synapses`,
  };
}
