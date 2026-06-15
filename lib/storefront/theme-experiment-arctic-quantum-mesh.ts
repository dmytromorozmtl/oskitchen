/**
 * AF1 — Arctic quantum mesh: Greenland–Iceland relay over AE1 pan-Pacific quantum mesh.
 */

import { createHash } from "node:crypto";
import {
  isPanPacificQuantumMeshEnabled,
  readPanPacificQuantumMesh,
} from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";

export type GreenlandIcelandRelayId = "nuuk_reykjavik" | "ilulissat_akureyri" | "arctic_hub";

export type ArcticQuantumRelay = {
  at: string;
  relayId: GreenlandIcelandRelayId;
  qubitPairs: number;
  entanglementFidelity: number;
  latencyMs: number;
  panPacificToken: string | null;
  armId: string;
};

export type ArcticQuantumMeshSnapshot = {
  at: string;
  relays: ArcticQuantumRelay[];
  relayQuorum: number;
  quorumReached: boolean;
  panPacificSynced: boolean;
  meanFidelity: number;
  arcticSloMet: boolean;
  maxLatencyMs: number;
};

export const GREENLAND_ICELAND_RELAYS: GreenlandIcelandRelayId[] = [
  "nuuk_reykjavik",
  "ilulissat_akureyri",
  "arctic_hub",
];

export function isArcticQuantumMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH === "1";
}

export function arcticLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_ARCTIC_LATENCY_SLO_MS ?? "200");
}

export function arcticQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_ARCTIC_QUORUM ?? "0.67");
}

export function readArcticQuantumMesh(raw: unknown): ArcticQuantumMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).arcticQuantumMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    relays: Array.isArray(s.relays) ? (s.relays as ArcticQuantumRelay[]) : [],
    relayQuorum: typeof s.relayQuorum === "number" ? s.relayQuorum : 0,
    quorumReached: s.quorumReached === true,
    panPacificSynced: s.panPacificSynced === true,
    meanFidelity: typeof s.meanFidelity === "number" ? s.meanFidelity : 0,
    arcticSloMet: s.arcticSloMet === true,
    maxLatencyMs: typeof s.maxLatencyMs === "number" ? s.maxLatencyMs : 0,
  };
}

function mergeArcticIntoJson(previousRaw: unknown, snap: ArcticQuantumMeshSnapshot): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.arcticQuantumMesh = snap;
  return base;
}

export function ingestArcticQuantumRelays(
  previousRaw: unknown,
  cells: Omit<ArcticQuantumRelay, "at" | "panPacificToken">[],
): { json: Record<string, unknown>; snap: ArcticQuantumMeshSnapshot } {
  const pp = readPanPacificQuantumMesh(previousRaw);
  const token = pp
    ? createHash("sha256")
        .update(`${pp.relayQuorum}:${pp.meanFidelity}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const relays: ArcticQuantumRelay[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    panPacificToken: token,
  }));

  const prev = readArcticQuantumMesh(previousRaw);
  const all = [...(prev?.relays ?? []), ...relays].slice(-60);
  const relaySet = new Set(all.map((r) => r.relayId));
  const quorumRequired = Math.max(2, Math.ceil(GREENLAND_ICELAND_RELAYS.length * arcticQuorumFraction()));
  const quorumReached = relaySet.size >= quorumRequired;

  const slo = arcticLatencySloMs();
  const maxLatency = all.length > 0 ? Math.max(...all.map((r) => r.latencyMs)) : 0;
  const arcticSloMet = maxLatency <= slo;
  const meanFidelity =
    all.length > 0 ? all.reduce((s, r) => s + r.entanglementFidelity, 0) / all.length : 0;

  const snap: ArcticQuantumMeshSnapshot = {
    at: new Date().toISOString(),
    relays: all,
    relayQuorum: relaySet.size,
    quorumReached,
    panPacificSynced: pp?.quorumReached ?? false,
    meanFidelity,
    arcticSloMet,
    maxLatencyMs: maxLatency,
  };

  return { json: mergeArcticIntoJson(previousRaw, snap), snap };
}

export function syncArcticFromGreenlandIcelandRelays(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: ArcticQuantumMeshSnapshot } {
  const cells = GREENLAND_ICELAND_RELAYS.map((relayId, i) => ({
    relayId,
    qubitPairs: 12 + i * 4,
    entanglementFidelity: 0.94 + i * 0.015,
    latencyMs: 60 + i * 45,
    armId: "draft",
  }));
  return ingestArcticQuantumRelays(previousRaw, cells);
}

export function evaluateArcticQuantumMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isArcticQuantumMeshEnabled()) {
    return { passed: true, headline: "Arctic quantum mesh off", detail: "" };
  }
  if (!isPanPacificQuantumMeshEnabled()) {
    return {
      passed: false,
      headline: "Pan-Pacific quantum mesh required",
      detail: "Enable THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH=1 (AE1).",
    };
  }
  const snap = readArcticQuantumMesh(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Greenland–Iceland relay quorum missing",
      detail: `Need ${Math.ceil(GREENLAND_ICELAND_RELAYS.length * arcticQuorumFraction())} relays.`,
    };
  }
  if (!snap.arcticSloMet) {
    return {
      passed: false,
      headline: "Arctic latency SLO breached",
      detail: `Max ${snap.maxLatencyMs}ms > SLO ${arcticLatencySloMs()}ms.`,
    };
  }
  if (!snap.panPacificSynced) {
    return {
      passed: false,
      headline: "Pan-Pacific mesh not synced",
      detail: "Run pan-Pacific quantum sync before Arctic mesh publish.",
    };
  }
  return {
    passed: true,
    headline: "Arctic quantum mesh aligned",
    detail: `GI relays ${snap.relayQuorum} · fidelity ${snap.meanFidelity.toFixed(3)}`,
  };
}
