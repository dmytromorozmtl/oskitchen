/**
 * AI1 — Martian orbital DTN relay: Olympus–Valles–Phobos over AH1 lunar + AE heliopause.
 */

import { createHash } from "node:crypto";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import {
  isLunarFarsideDtnMeshEnabled,
  readLunarFarsideDtnMesh,
} from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";

export type MartianOrbitalNodeId = "olympus_mons" | "valles_marineris" | "phobos_relay";

export type MartianOrbitalBundle = {
  at: string;
  bundleId: string;
  nodeId: MartianOrbitalNodeId;
  latencyMs: number;
  orbitalPeriodMin: number;
  lunarToken: string | null;
  armId: string;
  delivered: boolean;
};

export type MartianOrbitalDtnRelaySnapshot = {
  at: string;
  bundles: MartianOrbitalBundle[];
  nodeQuorum: number;
  quorumReached: boolean;
  lunarFarsideSynced: boolean;
  heliopauseReachable: boolean;
  maxOrbitalLatencyMs: number;
  orbitalSloMet: boolean;
};

export const MARTIAN_ORBITAL_NODES: MartianOrbitalNodeId[] = [
  "olympus_mons",
  "valles_marineris",
  "phobos_relay",
];

export function isMartianOrbitalDtnRelayEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MARTIAN_ORBITAL_DTN_RELAY === "1";
}

export function martianOrbitalLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_MARTIAN_ORBITAL_SLO_MS ?? "2400");
}

export function martianOrbitalQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_MARTIAN_ORBITAL_QUORUM ?? "0.67");
}

export function readMartianOrbitalDtnRelay(raw: unknown): MartianOrbitalDtnRelaySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).martianOrbitalDtnRelay;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as MartianOrbitalBundle[]) : [],
    nodeQuorum: typeof s.nodeQuorum === "number" ? s.nodeQuorum : 0,
    quorumReached: s.quorumReached === true,
    lunarFarsideSynced: s.lunarFarsideSynced === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxOrbitalLatencyMs: typeof s.maxOrbitalLatencyMs === "number" ? s.maxOrbitalLatencyMs : 0,
    orbitalSloMet: s.orbitalSloMet === true,
  };
}

function mergeMartianOrbitalIntoJson(
  previousRaw: unknown,
  snap: MartianOrbitalDtnRelaySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.martianOrbitalDtnRelay = snap;
  return base;
}

export function ingestMartianOrbitalBundles(
  previousRaw: unknown,
  cells: Omit<MartianOrbitalBundle, "at" | "bundleId" | "lunarToken">[],
): { json: Record<string, unknown>; snap: MartianOrbitalDtnRelaySnapshot } {
  const lunar = readLunarFarsideDtnMesh(previousRaw);
  const token = lunar
    ? createHash("sha256")
        .update(`${lunar.nodeQuorum}:${lunar.maxFarsideLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const bundles: MartianOrbitalBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `mars-${c.nodeId}-${Date.now()}-${i}`,
    lunarToken: token,
  }));

  const prev = readMartianOrbitalDtnRelay(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const nodeSet = new Set(all.map((b) => b.nodeId));
  const quorumRequired = Math.max(2, Math.ceil(MARTIAN_ORBITAL_NODES.length * martianOrbitalQuorumFraction()));
  const quorumReached = nodeSet.size >= quorumRequired;

  const slo = martianOrbitalLatencySloMs();
  const maxOrbitalLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const helio = readHeliopauseDtn(previousRaw);

  const snap: MartianOrbitalDtnRelaySnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    nodeQuorum: nodeSet.size,
    quorumReached,
    lunarFarsideSynced: lunar?.quorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxOrbitalLatencyMs,
    orbitalSloMet: maxOrbitalLatencyMs <= slo,
  };

  return { json: mergeMartianOrbitalIntoJson(previousRaw, snap), snap };
}

export function syncMartianOrbitalFromOlympusValles(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MartianOrbitalDtnRelaySnapshot } {
  const cells = MARTIAN_ORBITAL_NODES.map((nodeId, i) => ({
    nodeId,
    latencyMs: 900 + i * 220,
    orbitalPeriodMin: 88 + i * 12,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestMartianOrbitalBundles(previousRaw, cells);
}

export function evaluateMartianOrbitalDtnRelayGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMartianOrbitalDtnRelayEnabled()) {
    return { passed: true, headline: "Martian orbital DTN relay off", detail: "" };
  }
  if (!isLunarFarsideDtnMeshEnabled()) {
    return {
      passed: false,
      headline: "Lunar far-side DTN mesh required",
      detail: "Enable THEME_EXPERIMENT_LUNAR_FARSIDE_DTN_MESH=1 (AH1).",
    };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (AE heliopause stack).",
    };
  }
  const snap = readMartianOrbitalDtnRelay(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Martian orbital node quorum missing",
      detail: `Need ${Math.ceil(MARTIAN_ORBITAL_NODES.length * martianOrbitalQuorumFraction())} orbital nodes.`,
    };
  }
  if (!snap.lunarFarsideSynced) {
    return {
      passed: false,
      headline: "Lunar far-side mesh not synced",
      detail: "Run lunar far-side DTN sync before Martian orbital relay.",
    };
  }
  if (!snap.orbitalSloMet) {
    return {
      passed: false,
      headline: "Martian orbital latency SLO breached",
      detail: `Max ${snap.maxOrbitalLatencyMs}ms > SLO ${martianOrbitalLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Martian orbital DTN relay aligned",
    detail: `${snap.nodeQuorum} nodes · heliopause ${snap.heliopauseReachable ? "reachable" : "pending"}`,
  };
}
