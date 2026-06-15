/**
 * AN1 — Pluto Charon binary DTN barycenter over AM1 Neptune Triton halo + AE heliopause.
 */

import { createHash } from "node:crypto";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import {
  isNeptuneTritonRetrogradeDtnHaloEnabled,
  readNeptuneTritonRetrogradeDtnHalo,
} from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";

export type PlutoCharonBarycenterId = "pluto_nix_orbit" | "charon_pluto_lock" | "barycenter_l4_point";

export type PlutoCharonBinaryDtnBundle = {
  at: string;
  bundleId: string;
  barycenterId: PlutoCharonBarycenterId;
  latencyMs: number;
  binarySeparationKm: number;
  neptuneToken: string | null;
  armId: string;
  delivered: boolean;
};

export type PlutoCharonBinaryDtnBarycenterSnapshot = {
  at: string;
  bundles: PlutoCharonBinaryDtnBundle[];
  barycenterQuorum: number;
  quorumReached: boolean;
  neptuneHaloSynced: boolean;
  heliopauseReachable: boolean;
  maxBarycenterLatencyMs: number;
  barycenterSloMet: boolean;
};

export const PLUTO_CHARON_BARYCENTERS: PlutoCharonBarycenterId[] = [
  "pluto_nix_orbit",
  "charon_pluto_lock",
  "barycenter_l4_point",
];

export function isPlutoCharonBinaryDtnBarycenterEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PLUTO_CHARON_BINARY_DTN_BARYCENTER === "1";
}

export function plutoCharonBarycenterLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_PLUTO_CHARON_SLO_MS ?? "10800");
}

export function plutoCharonBarycenterQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_PLUTO_CHARON_QUORUM ?? "0.67");
}

export function readPlutoCharonBinaryDtnBarycenter(raw: unknown): PlutoCharonBinaryDtnBarycenterSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).plutoCharonBinaryDtnBarycenter;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as PlutoCharonBinaryDtnBundle[]) : [],
    barycenterQuorum: typeof s.barycenterQuorum === "number" ? s.barycenterQuorum : 0,
    quorumReached: s.quorumReached === true,
    neptuneHaloSynced: s.neptuneHaloSynced === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxBarycenterLatencyMs: typeof s.maxBarycenterLatencyMs === "number" ? s.maxBarycenterLatencyMs : 0,
    barycenterSloMet: s.barycenterSloMet === true,
  };
}

function mergeBarycenterIntoJson(
  previousRaw: unknown,
  snap: PlutoCharonBinaryDtnBarycenterSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.plutoCharonBinaryDtnBarycenter = snap;
  return base;
}

export function ingestPlutoCharonBarycenterBundles(
  previousRaw: unknown,
  cells: Omit<PlutoCharonBinaryDtnBundle, "at" | "bundleId" | "neptuneToken">[],
): { json: Record<string, unknown>; snap: PlutoCharonBinaryDtnBarycenterSnapshot } {
  const neptune = readNeptuneTritonRetrogradeDtnHalo(previousRaw);
  const token = neptune
    ? createHash("sha256")
        .update(`${neptune.haloQuorum}:${neptune.maxHaloLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const bundles: PlutoCharonBinaryDtnBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `pluto-charon-${c.barycenterId}-${Date.now()}-${i}`,
    neptuneToken: token,
  }));

  const prev = readPlutoCharonBinaryDtnBarycenter(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const barycenterSet = new Set(all.map((b) => b.barycenterId));
  const quorumRequired = Math.max(2, Math.ceil(PLUTO_CHARON_BARYCENTERS.length * plutoCharonBarycenterQuorumFraction()));
  const quorumReached = barycenterSet.size >= quorumRequired;

  const slo = plutoCharonBarycenterLatencySloMs();
  const maxBarycenterLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const helio = readHeliopauseDtn(previousRaw);

  const snap: PlutoCharonBinaryDtnBarycenterSnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    barycenterQuorum: barycenterSet.size,
    quorumReached,
    neptuneHaloSynced: neptune?.quorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxBarycenterLatencyMs,
    barycenterSloMet: maxBarycenterLatencyMs <= slo,
  };

  return { json: mergeBarycenterIntoJson(previousRaw, snap), snap };
}

export function syncPlutoCharonFromBinaryBarycenter(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: PlutoCharonBinaryDtnBarycenterSnapshot } {
  const cells = PLUTO_CHARON_BARYCENTERS.map((barycenterId, i) => ({
    barycenterId,
    latencyMs: 5000 + i * 550,
    binarySeparationKm: 19640 - i * 100,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestPlutoCharonBarycenterBundles(previousRaw, cells);
}

export function evaluatePlutoCharonBinaryDtnBarycenterGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPlutoCharonBinaryDtnBarycenterEnabled()) {
    return { passed: true, headline: "Pluto Charon binary DTN barycenter off", detail: "" };
  }
  if (!isNeptuneTritonRetrogradeDtnHaloEnabled()) {
    return {
      passed: false,
      headline: "Neptune Triton halo required",
      detail: "Enable THEME_EXPERIMENT_NEPTUNE_TRITON_RETROGRADE_DTN_HALO=1 (AM1).",
    };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (AE heliopause).",
    };
  }
  const snap = readPlutoCharonBinaryDtnBarycenter(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Pluto Charon barycenter quorum missing",
      detail: `Need ${Math.ceil(PLUTO_CHARON_BARYCENTERS.length * plutoCharonBarycenterQuorumFraction())} barycenter nodes.`,
    };
  }
  if (!snap.neptuneHaloSynced) {
    return {
      passed: false,
      headline: "Neptune Triton halo not synced",
      detail: "Run Neptune halo sync before Pluto Charon barycenter.",
    };
  }
  if (!snap.barycenterSloMet) {
    return {
      passed: false,
      headline: "Pluto Charon barycenter latency SLO breached",
      detail: `Max ${snap.maxBarycenterLatencyMs}ms > SLO ${plutoCharonBarycenterLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Pluto Charon binary barycenter aligned",
    detail: `${snap.barycenterQuorum} nodes · heliopause ${snap.heliopauseReachable ? "reachable" : "pending"}`,
  };
}
