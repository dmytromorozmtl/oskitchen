/**
 * AH1 — Lunar far-side DTN mesh: Shackleton–Malapert relay over AG1 subglacial + AE DTN stack.
 */

import { createHash } from "node:crypto";
import {
  isAntarcticSubglacialMeshEnabled,
  readAntarcticSubglacialMesh,
} from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";
import { isDtnMeshEnabled, readDtnMesh } from "@/lib/storefront/theme-experiment-dtn-mesh";
import { isHeliopauseDtnEnabled, readHeliopauseDtn } from "@/lib/storefront/theme-experiment-heliopause-dtn";

export type LunarFarsideNodeId = "shackleton_crater" | "malapert_relay" | "far_side_silent_zone";

export type LunarFarsideBundle = {
  at: string;
  bundleId: string;
  nodeId: LunarFarsideNodeId;
  latencyMs: number;
  ttlMs: number;
  subglacialToken: string | null;
  armId: string;
  delivered: boolean;
};

export type LunarFarsideDtnMeshSnapshot = {
  at: string;
  bundles: LunarFarsideBundle[];
  nodeQuorum: number;
  quorumReached: boolean;
  subglacialSynced: boolean;
  dtnMeshReady: boolean;
  heliopauseReachable: boolean;
  maxFarsideLatencyMs: number;
  farsideSloMet: boolean;
};

export const LUNAR_FARSIDE_NODES: LunarFarsideNodeId[] = [
  "shackleton_crater",
  "malapert_relay",
  "far_side_silent_zone",
];

export function isLunarFarsideDtnMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_LUNAR_FARSIDE_DTN_MESH === "1";
}

export function lunarFarsideLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_LUNAR_FARSIDE_SLO_MS ?? "1200");
}

export function lunarFarsideQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_LUNAR_FARSIDE_QUORUM ?? "0.67");
}

export function lunarFarsideBundleTtlMs(): number {
  return Number(process.env.THEME_EXPERIMENT_LUNAR_FARSIDE_TTL_MS ?? String(28 * 24 * 3600 * 1000));
}

export function readLunarFarsideDtnMesh(raw: unknown): LunarFarsideDtnMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).lunarFarsideDtnMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as LunarFarsideBundle[]) : [],
    nodeQuorum: typeof s.nodeQuorum === "number" ? s.nodeQuorum : 0,
    quorumReached: s.quorumReached === true,
    subglacialSynced: s.subglacialSynced === true,
    dtnMeshReady: s.dtnMeshReady === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxFarsideLatencyMs: typeof s.maxFarsideLatencyMs === "number" ? s.maxFarsideLatencyMs : 0,
    farsideSloMet: s.farsideSloMet === true,
  };
}

function mergeLunarFarsideIntoJson(
  previousRaw: unknown,
  snap: LunarFarsideDtnMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.lunarFarsideDtnMesh = snap;
  return base;
}

export function ingestLunarFarsideBundles(
  previousRaw: unknown,
  cells: Omit<LunarFarsideBundle, "at" | "bundleId" | "subglacialToken" | "ttlMs">[],
): { json: Record<string, unknown>; snap: LunarFarsideDtnMeshSnapshot } {
  const sub = readAntarcticSubglacialMesh(previousRaw);
  const token = sub
    ? createHash("sha256")
        .update(`${sub.relayQuorum}:${sub.maxSubglacialLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const ttl = lunarFarsideBundleTtlMs();
  const bundles: LunarFarsideBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `lunar-${c.nodeId}-${Date.now()}-${i}`,
    ttlMs: ttl,
    subglacialToken: token,
  }));

  const prev = readLunarFarsideDtnMesh(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const nodeSet = new Set(all.map((b) => b.nodeId));
  const quorumRequired = Math.max(2, Math.ceil(LUNAR_FARSIDE_NODES.length * lunarFarsideQuorumFraction()));
  const quorumReached = nodeSet.size >= quorumRequired;

  const slo = lunarFarsideLatencySloMs();
  const maxFarsideLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const farsideSloMet = maxFarsideLatencyMs <= slo;

  const dtn = readDtnMesh(previousRaw);
  const helio = readHeliopauseDtn(previousRaw);

  const snap: LunarFarsideDtnMeshSnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    nodeQuorum: nodeSet.size,
    quorumReached,
    subglacialSynced: sub?.quorumReached ?? false,
    dtnMeshReady: dtn?.meshQuorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxFarsideLatencyMs,
    farsideSloMet,
  };

  return { json: mergeLunarFarsideIntoJson(previousRaw, snap), snap };
}

export function syncLunarFarsideFromShackletonMalapert(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: LunarFarsideDtnMeshSnapshot } {
  const cells = LUNAR_FARSIDE_NODES.map((nodeId, i) => ({
    nodeId,
    latencyMs: 400 + i * 180,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestLunarFarsideBundles(previousRaw, cells);
}

export function evaluateLunarFarsideDtnMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isLunarFarsideDtnMeshEnabled()) {
    return { passed: true, headline: "Lunar far-side DTN mesh off", detail: "" };
  }
  if (!isAntarcticSubglacialMeshEnabled()) {
    return {
      passed: false,
      headline: "Antarctic subglacial mesh required",
      detail: "Enable THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH=1 (AG1).",
    };
  }
  if (!isDtnMeshEnabled()) {
    return {
      passed: false,
      headline: "DTN mesh required",
      detail: "Enable THEME_EXPERIMENT_DTN_MESH=1 (AE DTN stack).",
    };
  }
  const snap = readLunarFarsideDtnMesh(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Lunar far-side node quorum missing",
      detail: `Need ${Math.ceil(LUNAR_FARSIDE_NODES.length * lunarFarsideQuorumFraction())} far-side nodes.`,
    };
  }
  if (!snap.subglacialSynced) {
    return {
      passed: false,
      headline: "Subglacial mesh not synced",
      detail: "Run antarctic subglacial sync before lunar far-side DTN.",
    };
  }
  if (!snap.farsideSloMet) {
    return {
      passed: false,
      headline: "Lunar far-side latency SLO breached",
      detail: `Max ${snap.maxFarsideLatencyMs}ms > SLO ${lunarFarsideLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Lunar far-side DTN mesh aligned",
    detail: `${snap.nodeQuorum} nodes · DTN ${snap.dtnMeshReady ? "ready" : "pending"}`,
  };
}
