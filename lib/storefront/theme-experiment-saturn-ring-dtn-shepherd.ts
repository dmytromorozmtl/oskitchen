/**
 * AK1 — Saturn ring DTN shepherd over AJ1 Jupiter trojan Lagrange + AE heliopause.
 */

import { createHash } from "node:crypto";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import {
  isJupiterTrojanDtnLagrangeEnabled,
  readJupiterTrojanDtnLagrange,
} from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";

export type SaturnRingSegmentId = "ring_a_titan" | "ring_b_encke" | "shepherd_pan";

export type SaturnRingDtnBundle = {
  at: string;
  bundleId: string;
  segmentId: SaturnRingSegmentId;
  latencyMs: number;
  ringOpacity: number;
  jupiterToken: string | null;
  armId: string;
  delivered: boolean;
};

export type SaturnRingDtnShepherdSnapshot = {
  at: string;
  bundles: SaturnRingDtnBundle[];
  segmentQuorum: number;
  quorumReached: boolean;
  jupiterTrojanSynced: boolean;
  heliopauseReachable: boolean;
  maxRingLatencyMs: number;
  ringSloMet: boolean;
};

export const SATURN_RING_SEGMENTS: SaturnRingSegmentId[] = [
  "ring_a_titan",
  "ring_b_encke",
  "shepherd_pan",
];

export function isSaturnRingDtnShepherdEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_SATURN_RING_DTN_SHEPHERD === "1";
}

export function saturnRingLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_SATURN_RING_SLO_MS ?? "7200");
}

export function saturnRingQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_SATURN_RING_QUORUM ?? "0.67");
}

export function readSaturnRingDtnShepherd(raw: unknown): SaturnRingDtnShepherdSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).saturnRingDtnShepherd;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as SaturnRingDtnBundle[]) : [],
    segmentQuorum: typeof s.segmentQuorum === "number" ? s.segmentQuorum : 0,
    quorumReached: s.quorumReached === true,
    jupiterTrojanSynced: s.jupiterTrojanSynced === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxRingLatencyMs: typeof s.maxRingLatencyMs === "number" ? s.maxRingLatencyMs : 0,
    ringSloMet: s.ringSloMet === true,
  };
}

function mergeSaturnRingIntoJson(
  previousRaw: unknown,
  snap: SaturnRingDtnShepherdSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.saturnRingDtnShepherd = snap;
  return base;
}

export function ingestSaturnRingBundles(
  previousRaw: unknown,
  cells: Omit<SaturnRingDtnBundle, "at" | "bundleId" | "jupiterToken">[],
): { json: Record<string, unknown>; snap: SaturnRingDtnShepherdSnapshot } {
  const jupiter = readJupiterTrojanDtnLagrange(previousRaw);
  const token = jupiter
    ? createHash("sha256")
        .update(`${jupiter.lagrangeQuorum}:${jupiter.maxTrojanLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const bundles: SaturnRingDtnBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `saturn-${c.segmentId}-${Date.now()}-${i}`,
    jupiterToken: token,
  }));

  const prev = readSaturnRingDtnShepherd(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const segmentSet = new Set(all.map((b) => b.segmentId));
  const quorumRequired = Math.max(2, Math.ceil(SATURN_RING_SEGMENTS.length * saturnRingQuorumFraction()));
  const quorumReached = segmentSet.size >= quorumRequired;

  const slo = saturnRingLatencySloMs();
  const maxRingLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const helio = readHeliopauseDtn(previousRaw);

  const snap: SaturnRingDtnShepherdSnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    segmentQuorum: segmentSet.size,
    quorumReached,
    jupiterTrojanSynced: jupiter?.quorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxRingLatencyMs,
    ringSloMet: maxRingLatencyMs <= slo,
  };

  return { json: mergeSaturnRingIntoJson(previousRaw, snap), snap };
}

export function syncSaturnRingFromShepherdPan(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: SaturnRingDtnShepherdSnapshot } {
  const cells = SATURN_RING_SEGMENTS.map((segmentId, i) => ({
    segmentId,
    latencyMs: 3200 + i * 400,
    ringOpacity: 0.88 - i * 0.04,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestSaturnRingBundles(previousRaw, cells);
}

export function evaluateSaturnRingDtnShepherdGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isSaturnRingDtnShepherdEnabled()) {
    return { passed: true, headline: "Saturn ring DTN shepherd off", detail: "" };
  }
  if (!isJupiterTrojanDtnLagrangeEnabled()) {
    return {
      passed: false,
      headline: "Jupiter trojan Lagrange required",
      detail: "Enable THEME_EXPERIMENT_JUPITER_TROJAN_DTN_LAGRANGE=1 (AJ1).",
    };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (AE heliopause).",
    };
  }
  const snap = readSaturnRingDtnShepherd(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Saturn ring segment quorum missing",
      detail: `Need ${Math.ceil(SATURN_RING_SEGMENTS.length * saturnRingQuorumFraction())} ring segments.`,
    };
  }
  if (!snap.jupiterTrojanSynced) {
    return {
      passed: false,
      headline: "Jupiter trojan mesh not synced",
      detail: "Run Jupiter trojan Lagrange sync before Saturn ring shepherd.",
    };
  }
  if (!snap.ringSloMet) {
    return {
      passed: false,
      headline: "Saturn ring latency SLO breached",
      detail: `Max ${snap.maxRingLatencyMs}ms > SLO ${saturnRingLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Saturn ring DTN shepherd aligned",
    detail: `${snap.segmentQuorum} segments · heliopause ${snap.heliopauseReachable ? "reachable" : "pending"}`,
  };
}
