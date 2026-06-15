/**
 * AM1 — Neptune Triton retrograde DTN halo over AL1 Uranus polar relay + AE heliopause.
 */

import { createHash } from "node:crypto";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import {
  isUranusObliquityDtnPolarRelayEnabled,
  readUranusObliquityDtnPolarRelay,
} from "@/lib/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay";

export type NeptuneHaloSegmentId = "triton_retrograde" | "proteus_halo" | "neso_lagrange_halo";

export type NeptuneTritonRetrogradeDtnBundle = {
  at: string;
  bundleId: string;
  segmentId: NeptuneHaloSegmentId;
  latencyMs: number;
  retrogradeArcDeg: number;
  uranusToken: string | null;
  armId: string;
  delivered: boolean;
};

export type NeptuneTritonRetrogradeDtnHaloSnapshot = {
  at: string;
  bundles: NeptuneTritonRetrogradeDtnBundle[];
  haloQuorum: number;
  quorumReached: boolean;
  uranusPolarSynced: boolean;
  heliopauseReachable: boolean;
  maxHaloLatencyMs: number;
  haloSloMet: boolean;
};

export const NEPTUNE_HALO_SEGMENTS: NeptuneHaloSegmentId[] = [
  "triton_retrograde",
  "proteus_halo",
  "neso_lagrange_halo",
];

export function isNeptuneTritonRetrogradeDtnHaloEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_NEPTUNE_TRITON_RETROGRADE_DTN_HALO === "1";
}

export function neptuneHaloLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_NEPTUNE_HALO_SLO_MS ?? "9600");
}

export function neptuneHaloQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_NEPTUNE_HALO_QUORUM ?? "0.67");
}

export function readNeptuneTritonRetrogradeDtnHalo(raw: unknown): NeptuneTritonRetrogradeDtnHaloSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).neptuneTritonRetrogradeDtnHalo;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as NeptuneTritonRetrogradeDtnBundle[]) : [],
    haloQuorum: typeof s.haloQuorum === "number" ? s.haloQuorum : 0,
    quorumReached: s.quorumReached === true,
    uranusPolarSynced: s.uranusPolarSynced === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxHaloLatencyMs: typeof s.maxHaloLatencyMs === "number" ? s.maxHaloLatencyMs : 0,
    haloSloMet: s.haloSloMet === true,
  };
}

function mergeHaloIntoJson(
  previousRaw: unknown,
  snap: NeptuneTritonRetrogradeDtnHaloSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.neptuneTritonRetrogradeDtnHalo = snap;
  return base;
}

export function ingestNeptuneHaloBundles(
  previousRaw: unknown,
  cells: Omit<NeptuneTritonRetrogradeDtnBundle, "at" | "bundleId" | "uranusToken">[],
): { json: Record<string, unknown>; snap: NeptuneTritonRetrogradeDtnHaloSnapshot } {
  const uranus = readUranusObliquityDtnPolarRelay(previousRaw);
  const token = uranus
    ? createHash("sha256")
        .update(`${uranus.polarQuorum}:${uranus.maxPolarLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const bundles: NeptuneTritonRetrogradeDtnBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `neptune-${c.segmentId}-${Date.now()}-${i}`,
    uranusToken: token,
  }));

  const prev = readNeptuneTritonRetrogradeDtnHalo(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const segmentSet = new Set(all.map((b) => b.segmentId));
  const quorumRequired = Math.max(2, Math.ceil(NEPTUNE_HALO_SEGMENTS.length * neptuneHaloQuorumFraction()));
  const quorumReached = segmentSet.size >= quorumRequired;

  const slo = neptuneHaloLatencySloMs();
  const maxHaloLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const helio = readHeliopauseDtn(previousRaw);

  const snap: NeptuneTritonRetrogradeDtnHaloSnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    haloQuorum: segmentSet.size,
    quorumReached,
    uranusPolarSynced: uranus?.quorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxHaloLatencyMs,
    haloSloMet: maxHaloLatencyMs <= slo,
  };

  return { json: mergeHaloIntoJson(previousRaw, snap), snap };
}

export function syncNeptuneHaloFromTritonRetrograde(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: NeptuneTritonRetrogradeDtnHaloSnapshot } {
  const cells = NEPTUNE_HALO_SEGMENTS.map((segmentId, i) => ({
    segmentId,
    latencyMs: 4400 + i * 500,
    retrogradeArcDeg: 156.9 - i * 0.2,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestNeptuneHaloBundles(previousRaw, cells);
}

export function evaluateNeptuneTritonRetrogradeDtnHaloGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isNeptuneTritonRetrogradeDtnHaloEnabled()) {
    return { passed: true, headline: "Neptune Triton retrograde DTN halo off", detail: "" };
  }
  if (!isUranusObliquityDtnPolarRelayEnabled()) {
    return {
      passed: false,
      headline: "Uranus polar relay required",
      detail: "Enable THEME_EXPERIMENT_URANUS_OBLIQUITY_DTN_POLAR_RELAY=1 (AL1).",
    };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (AE heliopause).",
    };
  }
  const snap = readNeptuneTritonRetrogradeDtnHalo(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Neptune halo segment quorum missing",
      detail: `Need ${Math.ceil(NEPTUNE_HALO_SEGMENTS.length * neptuneHaloQuorumFraction())} halo segments.`,
    };
  }
  if (!snap.uranusPolarSynced) {
    return {
      passed: false,
      headline: "Uranus polar relay not synced",
      detail: "Run Uranus obliquity polar relay sync before Neptune halo.",
    };
  }
  if (!snap.haloSloMet) {
    return {
      passed: false,
      headline: "Neptune halo latency SLO breached",
      detail: `Max ${snap.maxHaloLatencyMs}ms > SLO ${neptuneHaloLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Neptune Triton retrograde halo aligned",
    detail: `${snap.haloQuorum} segments · heliopause ${snap.heliopauseReachable ? "reachable" : "pending"}`,
  };
}
