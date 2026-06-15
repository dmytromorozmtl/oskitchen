/**
 * AO1 — Kuiper belt / scattered-disk DTN aphelion relay over AN1 Pluto Charon barycenter + AE heliopause.
 */

import { createHash } from "node:crypto";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import {
  isPlutoCharonBinaryDtnBarycenterEnabled,
  readPlutoCharonBinaryDtnBarycenter,
} from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";

export type KuiperAphelionNodeId = "scattered_disk_90377" | "detached_sedna_aphelion" | "extended_scattered_haumea";

export type KuiperScatteredDiskDtnBundle = {
  at: string;
  bundleId: string;
  nodeId: KuiperAphelionNodeId;
  latencyMs: number;
  aphelionAu: number;
  plutoBarycenterToken: string | null;
  armId: string;
  delivered: boolean;
};

export type KuiperScatteredDiskDtnAphelionSnapshot = {
  at: string;
  bundles: KuiperScatteredDiskDtnBundle[];
  aphelionQuorum: number;
  quorumReached: boolean;
  plutoBarycenterSynced: boolean;
  heliopauseReachable: boolean;
  maxAphelionLatencyMs: number;
  aphelionSloMet: boolean;
};

export const KUIPER_APHELION_NODES: KuiperAphelionNodeId[] = [
  "scattered_disk_90377",
  "detached_sedna_aphelion",
  "extended_scattered_haumea",
];

export function isKuiperScatteredDiskDtnAphelionEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_KUIPER_SCATTERED_DISK_DTN_APHELION === "1";
}

export function kuiperAphelionLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_KUIPER_APHELION_SLO_MS ?? "12600");
}

export function kuiperAphelionQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_KUIPER_APHELION_QUORUM ?? "0.67");
}

export function readKuiperScatteredDiskDtnAphelion(raw: unknown): KuiperScatteredDiskDtnAphelionSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).kuiperScatteredDiskDtnAphelion;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as KuiperScatteredDiskDtnBundle[]) : [],
    aphelionQuorum: typeof s.aphelionQuorum === "number" ? s.aphelionQuorum : 0,
    quorumReached: s.quorumReached === true,
    plutoBarycenterSynced: s.plutoBarycenterSynced === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxAphelionLatencyMs: typeof s.maxAphelionLatencyMs === "number" ? s.maxAphelionLatencyMs : 0,
    aphelionSloMet: s.aphelionSloMet === true,
  };
}

function mergeAphelionIntoJson(
  previousRaw: unknown,
  snap: KuiperScatteredDiskDtnAphelionSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.kuiperScatteredDiskDtnAphelion = snap;
  return base;
}

export function ingestKuiperAphelionBundles(
  previousRaw: unknown,
  cells: Omit<KuiperScatteredDiskDtnBundle, "at" | "bundleId" | "plutoBarycenterToken">[],
): { json: Record<string, unknown>; snap: KuiperScatteredDiskDtnAphelionSnapshot } {
  const pluto = readPlutoCharonBinaryDtnBarycenter(previousRaw);
  const token = pluto
    ? createHash("sha256")
        .update(`${pluto.barycenterQuorum}:${pluto.maxBarycenterLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const bundles: KuiperScatteredDiskDtnBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `kuiper-aphelion-${c.nodeId}-${Date.now()}-${i}`,
    plutoBarycenterToken: token,
  }));

  const prev = readKuiperScatteredDiskDtnAphelion(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const nodeSet = new Set(all.map((b) => b.nodeId));
  const quorumRequired = Math.max(2, Math.ceil(KUIPER_APHELION_NODES.length * kuiperAphelionQuorumFraction()));
  const quorumReached = nodeSet.size >= quorumRequired;

  const slo = kuiperAphelionLatencySloMs();
  const maxAphelionLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const helio = readHeliopauseDtn(previousRaw);

  const snap: KuiperScatteredDiskDtnAphelionSnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    aphelionQuorum: nodeSet.size,
    quorumReached,
    plutoBarycenterSynced: pluto?.quorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxAphelionLatencyMs,
    aphelionSloMet: maxAphelionLatencyMs <= slo,
  };

  return { json: mergeAphelionIntoJson(previousRaw, snap), snap };
}

export function syncKuiperAphelionFromScatteredDisk(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: KuiperScatteredDiskDtnAphelionSnapshot } {
  const cells = KUIPER_APHELION_NODES.map((nodeId, i) => ({
    nodeId,
    latencyMs: 6200 + i * 600,
    aphelionAu: 48 + i * 12,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestKuiperAphelionBundles(previousRaw, cells);
}

export function evaluateKuiperScatteredDiskDtnAphelionGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isKuiperScatteredDiskDtnAphelionEnabled()) {
    return { passed: true, headline: "Kuiper scattered-disk DTN aphelion off", detail: "" };
  }
  if (!isPlutoCharonBinaryDtnBarycenterEnabled()) {
    return {
      passed: false,
      headline: "Pluto Charon barycenter required",
      detail: "Enable THEME_EXPERIMENT_PLUTO_CHARON_BINARY_DTN_BARYCENTER=1 (AN1).",
    };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (AE heliopause).",
    };
  }
  const snap = readKuiperScatteredDiskDtnAphelion(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Kuiper aphelion quorum missing",
      detail: `Need ${Math.ceil(KUIPER_APHELION_NODES.length * kuiperAphelionQuorumFraction())} aphelion nodes.`,
    };
  }
  if (!snap.plutoBarycenterSynced) {
    return {
      passed: false,
      headline: "Pluto Charon barycenter not synced",
      detail: "Run Pluto Charon barycenter sync before Kuiper aphelion relay.",
    };
  }
  if (!snap.aphelionSloMet) {
    return {
      passed: false,
      headline: "Kuiper aphelion latency SLO breached",
      detail: `Max ${snap.maxAphelionLatencyMs}ms > SLO ${kuiperAphelionLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Kuiper scattered-disk aphelion aligned",
    detail: `${snap.aphelionQuorum} nodes · heliopause ${snap.heliopauseReachable ? "reachable" : "pending"}`,
  };
}
