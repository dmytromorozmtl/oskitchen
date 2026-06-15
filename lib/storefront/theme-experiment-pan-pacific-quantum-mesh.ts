/**
 * AE1 — Pan-Pacific quantum mesh: Tasman Sea relay over AD1 Indo-Pacific compact.
 */

import { createHash } from "node:crypto";
import {
  isIndoPacificCompactEnabled,
  readIndoPacificCompact,
} from "@/lib/compliance/indo-pacific-compact";

export type TasmanSeaRelayId = "auckland_sydney" | "wellington_melbourne" | "tasman_hub";

export type PanPacificQuantumRelay = {
  at: string;
  relayId: TasmanSeaRelayId;
  qubitPairs: number;
  entanglementFidelity: number;
  latencyMs: number;
  crossBorderPqcHash: string | null;
  armId: string;
};

export type PanPacificQuantumMeshSnapshot = {
  at: string;
  relays: PanPacificQuantumRelay[];
  relayQuorum: number;
  quorumReached: boolean;
  indoPacificSynced: boolean;
  meanFidelity: number;
  tasmanSloMet: boolean;
  maxLatencyMs: number;
};

export const TASMAN_SEA_RELAYS: TasmanSeaRelayId[] = ["auckland_sydney", "wellington_melbourne", "tasman_hub"];

export function isPanPacificQuantumMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH === "1";
}

export function tasmanSeaLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_TASMAN_SEA_LATENCY_SLO_MS ?? "250");
}

export function panPacificQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_PAN_PACIFIC_QUORUM ?? "0.67");
}

export function readPanPacificQuantumMesh(raw: unknown): PanPacificQuantumMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).panPacificQuantumMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    relays: Array.isArray(s.relays) ? (s.relays as PanPacificQuantumRelay[]) : [],
    relayQuorum: typeof s.relayQuorum === "number" ? s.relayQuorum : 0,
    quorumReached: s.quorumReached === true,
    indoPacificSynced: s.indoPacificSynced === true,
    meanFidelity: typeof s.meanFidelity === "number" ? s.meanFidelity : 0,
    tasmanSloMet: s.tasmanSloMet === true,
    maxLatencyMs: typeof s.maxLatencyMs === "number" ? s.maxLatencyMs : 0,
  };
}

function mergePanPacificIntoJson(
  previousRaw: unknown,
  snap: PanPacificQuantumMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.panPacificQuantumMesh = snap;
  return base;
}

export function ingestPanPacificQuantumRelays(
  previousRaw: unknown,
  cells: Omit<PanPacificQuantumRelay, "at" | "crossBorderPqcHash">[],
): { json: Record<string, unknown>; snap: PanPacificQuantumMeshSnapshot } {
  const ip = readIndoPacificCompact(previousRaw);
  const crossHash = ip?.evidence.crossBorderPqcHash ?? null;

  const relays: PanPacificQuantumRelay[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    crossBorderPqcHash: crossHash,
  }));

  const prev = readPanPacificQuantumMesh(previousRaw);
  const all = [...(prev?.relays ?? []), ...relays].slice(-60);
  const relaySet = new Set(all.map((r) => r.relayId));
  const quorumRequired = Math.max(2, Math.ceil(TASMAN_SEA_RELAYS.length * panPacificQuorumFraction()));
  const quorumReached = relaySet.size >= quorumRequired;

  const slo = tasmanSeaLatencySloMs();
  const maxLatency = all.length > 0 ? Math.max(...all.map((r) => r.latencyMs)) : 0;
  const tasmanSloMet = maxLatency <= slo;
  const meanFidelity =
    all.length > 0 ? all.reduce((s, r) => s + r.entanglementFidelity, 0) / all.length : 0;

  const snap: PanPacificQuantumMeshSnapshot = {
    at: new Date().toISOString(),
    relays: all,
    relayQuorum: relaySet.size,
    quorumReached,
    indoPacificSynced: ip?.evidence.indoPacificReady ?? false,
    meanFidelity,
    tasmanSloMet,
    maxLatencyMs: maxLatency,
  };

  return { json: mergePanPacificIntoJson(previousRaw, snap), snap };
}

export function syncPanPacificFromTasmanRelays(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: PanPacificQuantumMeshSnapshot } {
  const cells = TASMAN_SEA_RELAYS.map((relayId, i) => ({
    relayId,
    qubitPairs: 8 + i * 4,
    entanglementFidelity: 0.92 + i * 0.02,
    latencyMs: 80 + i * 50,
    armId: "draft",
  }));
  return ingestPanPacificQuantumRelays(previousRaw, cells);
}

export function evaluatePanPacificQuantumMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPanPacificQuantumMeshEnabled()) {
    return { passed: true, headline: "Pan-Pacific quantum mesh off", detail: "" };
  }
  if (!isIndoPacificCompactEnabled()) {
    return {
      passed: false,
      headline: "Indo-Pacific compact required",
      detail: "Enable THEME_EXPERIMENT_INDO_PACIFIC_COMPACT=1 (AD1).",
    };
  }
  const snap = readPanPacificQuantumMesh(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Tasman Sea relay quorum missing",
      detail: `Need ${Math.ceil(TASMAN_SEA_RELAYS.length * panPacificQuorumFraction())} relays.`,
    };
  }
  if (!snap.tasmanSloMet) {
    return {
      passed: false,
      headline: "Tasman Sea latency SLO breached",
      detail: `Max ${snap.maxLatencyMs}ms > SLO ${tasmanSeaLatencySloMs()}ms.`,
    };
  }
  if (!snap.indoPacificSynced) {
    return {
      passed: false,
      headline: "Indo-Pacific compact not synced",
      detail: "Run Indo-Pacific attestation before quantum mesh publish.",
    };
  }
  if (snap.meanFidelity < 0.9) {
    return {
      passed: false,
      headline: "Quantum entanglement fidelity below threshold",
      detail: `Mean fidelity ${snap.meanFidelity.toFixed(3)} < 0.9.`,
    };
  }
  return {
    passed: true,
    headline: "Pan-Pacific quantum mesh aligned",
    detail: `Tasman relays ${snap.relayQuorum} · fidelity ${snap.meanFidelity.toFixed(3)}`,
  };
}

export function panPacificMeshHeaderToken(raw: unknown): string {
  const snap = readPanPacificQuantumMesh(raw);
  if (!snap) return "0";
  return createHash("sha256")
    .update(`${snap.relayQuorum}:${snap.meanFidelity}:${snap.tasmanSloMet}`)
    .digest("hex")
    .slice(0, 16);
}
