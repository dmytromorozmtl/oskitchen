/**
 * AL1 — Uranus obliquity DTN polar relay over AK1 Saturn ring shepherd + AE heliopause.
 */

import { createHash } from "node:crypto";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import {
  isSaturnRingDtnShepherdEnabled,
  readSaturnRingDtnShepherd,
} from "@/lib/storefront/theme-experiment-saturn-ring-dtn-shepherd";

export type UranusPolarRelayId = "polar_north_miranda" | "polar_south_ariel" | "obliquity_tilt_relay";

export type UranusObliquityDtnBundle = {
  at: string;
  bundleId: string;
  relayId: UranusPolarRelayId;
  latencyMs: number;
  obliquityDeg: number;
  saturnToken: string | null;
  armId: string;
  delivered: boolean;
};

export type UranusObliquityDtnPolarRelaySnapshot = {
  at: string;
  bundles: UranusObliquityDtnBundle[];
  polarQuorum: number;
  quorumReached: boolean;
  saturnRingSynced: boolean;
  heliopauseReachable: boolean;
  maxPolarLatencyMs: number;
  polarSloMet: boolean;
};

export const URANUS_POLAR_RELAYS: UranusPolarRelayId[] = [
  "polar_north_miranda",
  "polar_south_ariel",
  "obliquity_tilt_relay",
];

export function isUranusObliquityDtnPolarRelayEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_URANUS_OBLIQUITY_DTN_POLAR_RELAY === "1";
}

export function uranusPolarLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_URANUS_POLAR_SLO_MS ?? "8400");
}

export function uranusPolarQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_URANUS_POLAR_QUORUM ?? "0.67");
}

export function readUranusObliquityDtnPolarRelay(raw: unknown): UranusObliquityDtnPolarRelaySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).uranusObliquityDtnPolarRelay;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as UranusObliquityDtnBundle[]) : [],
    polarQuorum: typeof s.polarQuorum === "number" ? s.polarQuorum : 0,
    quorumReached: s.quorumReached === true,
    saturnRingSynced: s.saturnRingSynced === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxPolarLatencyMs: typeof s.maxPolarLatencyMs === "number" ? s.maxPolarLatencyMs : 0,
    polarSloMet: s.polarSloMet === true,
  };
}

function mergePolarRelayIntoJson(
  previousRaw: unknown,
  snap: UranusObliquityDtnPolarRelaySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.uranusObliquityDtnPolarRelay = snap;
  return base;
}

export function ingestUranusPolarBundles(
  previousRaw: unknown,
  cells: Omit<UranusObliquityDtnBundle, "at" | "bundleId" | "saturnToken">[],
): { json: Record<string, unknown>; snap: UranusObliquityDtnPolarRelaySnapshot } {
  const saturn = readSaturnRingDtnShepherd(previousRaw);
  const token = saturn
    ? createHash("sha256")
        .update(`${saturn.segmentQuorum}:${saturn.maxRingLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const bundles: UranusObliquityDtnBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `uranus-${c.relayId}-${Date.now()}-${i}`,
    saturnToken: token,
  }));

  const prev = readUranusObliquityDtnPolarRelay(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const relaySet = new Set(all.map((b) => b.relayId));
  const quorumRequired = Math.max(2, Math.ceil(URANUS_POLAR_RELAYS.length * uranusPolarQuorumFraction()));
  const quorumReached = relaySet.size >= quorumRequired;

  const slo = uranusPolarLatencySloMs();
  const maxPolarLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const helio = readHeliopauseDtn(previousRaw);

  const snap: UranusObliquityDtnPolarRelaySnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    polarQuorum: relaySet.size,
    quorumReached,
    saturnRingSynced: saturn?.quorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxPolarLatencyMs,
    polarSloMet: maxPolarLatencyMs <= slo,
  };

  return { json: mergePolarRelayIntoJson(previousRaw, snap), snap };
}

export function syncUranusPolarFromObliquityTilt(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: UranusObliquityDtnPolarRelaySnapshot } {
  const cells = URANUS_POLAR_RELAYS.map((relayId, i) => ({
    relayId,
    latencyMs: 3800 + i * 450,
    obliquityDeg: 97.77 - i * 0.1,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestUranusPolarBundles(previousRaw, cells);
}

export function evaluateUranusObliquityDtnPolarRelayGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isUranusObliquityDtnPolarRelayEnabled()) {
    return { passed: true, headline: "Uranus obliquity DTN polar relay off", detail: "" };
  }
  if (!isSaturnRingDtnShepherdEnabled()) {
    return {
      passed: false,
      headline: "Saturn ring DTN shepherd required",
      detail: "Enable THEME_EXPERIMENT_SATURN_RING_DTN_SHEPHERD=1 (AK1).",
    };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (AE heliopause).",
    };
  }
  const snap = readUranusObliquityDtnPolarRelay(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Uranus polar relay quorum missing",
      detail: `Need ${Math.ceil(URANUS_POLAR_RELAYS.length * uranusPolarQuorumFraction())} polar relays.`,
    };
  }
  if (!snap.saturnRingSynced) {
    return {
      passed: false,
      headline: "Saturn ring shepherd not synced",
      detail: "Run Saturn ring DTN shepherd sync before Uranus polar relay.",
    };
  }
  if (!snap.polarSloMet) {
    return {
      passed: false,
      headline: "Uranus polar latency SLO breached",
      detail: `Max ${snap.maxPolarLatencyMs}ms > SLO ${uranusPolarLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Uranus obliquity polar relay aligned",
    detail: `${snap.polarQuorum} relays · heliopause ${snap.heliopauseReachable ? "reachable" : "pending"}`,
  };
}
