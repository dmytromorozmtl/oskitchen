/**
 * AG1 — Antarctic subglacial mesh: McMurdo–Palmer relay over AF1 Greenland–Iceland quorum.
 */

import { createHash } from "node:crypto";
import {
  isArcticQuantumMeshEnabled,
  readArcticQuantumMesh,
} from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import { isPanPacificQuantumMeshEnabled } from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";

export type McmurdoPalmerRelayId = "mcmurdo_palmer" | "ross_ice_shelf" | "weddell_hub";

export type AntarcticSubglacialRelay = {
  at: string;
  relayId: McmurdoPalmerRelayId;
  iceSheetDepthM: number;
  subglacialLatencyMs: number;
  arcticToken: string | null;
  armId: string;
};

export type AntarcticSubglacialMeshSnapshot = {
  at: string;
  relays: AntarcticSubglacialRelay[];
  relayQuorum: number;
  quorumReached: boolean;
  arcticSynced: boolean;
  panPacificReachable: boolean;
  maxSubglacialLatencyMs: number;
  subglacialSloMet: boolean;
};

export const MCMURDO_PALMER_RELAYS: McmurdoPalmerRelayId[] = [
  "mcmurdo_palmer",
  "ross_ice_shelf",
  "weddell_hub",
];

export function isAntarcticSubglacialMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH === "1";
}

export function subglacialLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_SUBGLACIAL_LATENCY_SLO_MS ?? "350");
}

export function subglacialQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_SUBGLACIAL_QUORUM ?? "0.67");
}

export function readAntarcticSubglacialMesh(raw: unknown): AntarcticSubglacialMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).antarcticSubglacialMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    relays: Array.isArray(s.relays) ? (s.relays as AntarcticSubglacialRelay[]) : [],
    relayQuorum: typeof s.relayQuorum === "number" ? s.relayQuorum : 0,
    quorumReached: s.quorumReached === true,
    arcticSynced: s.arcticSynced === true,
    panPacificReachable: s.panPacificReachable === true,
    maxSubglacialLatencyMs: typeof s.maxSubglacialLatencyMs === "number" ? s.maxSubglacialLatencyMs : 0,
    subglacialSloMet: s.subglacialSloMet === true,
  };
}

function mergeSubglacialIntoJson(
  previousRaw: unknown,
  snap: AntarcticSubglacialMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.antarcticSubglacialMesh = snap;
  return base;
}

export function ingestAntarcticSubglacialRelays(
  previousRaw: unknown,
  cells: Omit<AntarcticSubglacialRelay, "at" | "arcticToken">[],
): { json: Record<string, unknown>; snap: AntarcticSubglacialMeshSnapshot } {
  const arctic = readArcticQuantumMesh(previousRaw);
  const token = arctic
    ? createHash("sha256")
        .update(`${arctic.relayQuorum}:${arctic.meanFidelity}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const relays: AntarcticSubglacialRelay[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    arcticToken: token,
  }));

  const prev = readAntarcticSubglacialMesh(previousRaw);
  const all = [...(prev?.relays ?? []), ...relays].slice(-48);
  const relaySet = new Set(all.map((r) => r.relayId));
  const quorumRequired = Math.max(2, Math.ceil(MCMURDO_PALMER_RELAYS.length * subglacialQuorumFraction()));
  const quorumReached = relaySet.size >= quorumRequired;

  const slo = subglacialLatencySloMs();
  const maxSubglacialLatencyMs = all.length > 0 ? Math.max(...all.map((r) => r.subglacialLatencyMs)) : 0;
  const subglacialSloMet = maxSubglacialLatencyMs <= slo;

  const snap: AntarcticSubglacialMeshSnapshot = {
    at: new Date().toISOString(),
    relays: all,
    relayQuorum: relaySet.size,
    quorumReached,
    arcticSynced: arctic?.quorumReached ?? false,
    panPacificReachable: arctic?.panPacificSynced ?? false,
    maxSubglacialLatencyMs,
    subglacialSloMet,
  };

  return { json: mergeSubglacialIntoJson(previousRaw, snap), snap };
}

export function syncAntarcticSubglacialFromMcmurdoPalmer(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: AntarcticSubglacialMeshSnapshot } {
  const cells = MCMURDO_PALMER_RELAYS.map((relayId, i) => ({
    relayId,
    iceSheetDepthM: 800 + i * 120,
    subglacialLatencyMs: 90 + i * 55,
    armId: "draft",
  }));
  return ingestAntarcticSubglacialRelays(previousRaw, cells);
}

export function evaluateAntarcticSubglacialMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isAntarcticSubglacialMeshEnabled()) {
    return { passed: true, headline: "Antarctic subglacial mesh off", detail: "" };
  }
  if (!isArcticQuantumMeshEnabled()) {
    return {
      passed: false,
      headline: "Arctic quantum mesh required",
      detail: "Enable THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH=1 (AF1).",
    };
  }
  if (!isPanPacificQuantumMeshEnabled()) {
    return {
      passed: false,
      headline: "Pan-Pacific quantum mesh required",
      detail: "Enable THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH=1 (AE1).",
    };
  }
  const snap = readAntarcticSubglacialMesh(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "McMurdo–Palmer relay quorum missing",
      detail: `Need ${Math.ceil(MCMURDO_PALMER_RELAYS.length * subglacialQuorumFraction())} subglacial relays.`,
    };
  }
  if (!snap.arcticSynced) {
    return {
      passed: false,
      headline: "Greenland–Iceland mesh not synced",
      detail: "Run arctic quantum mesh sync before subglacial relay.",
    };
  }
  if (!snap.subglacialSloMet) {
    return {
      passed: false,
      headline: "Subglacial latency SLO breached",
      detail: `Max ${snap.maxSubglacialLatencyMs}ms > SLO ${subglacialLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Antarctic subglacial mesh aligned",
    detail: `MP relays ${snap.relayQuorum} · pan-Pacific reachable`,
  };
}
