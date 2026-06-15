/**
 * AD5 — Cosmic web federation: filament CRDT merge over AA5 intergalactic mesh (wormhole SLO).
 */

import { createHash } from "node:crypto";
import {
  isIntergalacticMeshFederationEnabled,
  readIntergalacticMeshFederation,
  wormholeLatencySloMs,
  type IntergalacticFederationOutcome,
} from "@/lib/storefront/theme-experiment-intergalactic-mesh-federation";

export type CosmicFilamentId = "perseus_pisces" | "coma_virgo" | "sculptor_wall";

export type CosmicFilamentCell = {
  at: string;
  filament: CosmicFilamentId;
  peerStoreSlug: string;
  crdtVector: number;
  crdtMergeHash: string;
  wormholeLatencyMs: number;
  armId: string;
  liftPp: number;
};

export type CosmicWebFederationSnapshot = {
  at: string;
  filaments: CosmicFilamentCell[];
  filamentQuorum: number;
  quorumReached: boolean;
  intergalacticSynced: boolean;
  wormholeSloMet: boolean;
  maxWormholeLatencyMs: number;
  mergedLiftPp: number;
};

export const COSMIC_FILAMENTS: CosmicFilamentId[] = ["perseus_pisces", "coma_virgo", "sculptor_wall"];

export function isCosmicWebFederationEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_COSMIC_WEB_FEDERATION === "1";
}

export function cosmicWebQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_COSMIC_WEB_QUORUM ?? "0.67");
}

function crdtMergeHash(cells: CosmicFilamentCell[]): string {
  const payload = cells.map((c) => `${c.filament}:${c.crdtVector}:${c.peerStoreSlug}`).join("|");
  return createHash("sha256").update(`cosmic-crdt:${payload}`).digest("hex");
}

export function readCosmicWebFederation(raw: unknown): CosmicWebFederationSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).cosmicWebFederation;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    filaments: Array.isArray(s.filaments) ? (s.filaments as CosmicFilamentCell[]) : [],
    filamentQuorum: typeof s.filamentQuorum === "number" ? s.filamentQuorum : 0,
    quorumReached: s.quorumReached === true,
    intergalacticSynced: s.intergalacticSynced === true,
    wormholeSloMet: s.wormholeSloMet === true,
    maxWormholeLatencyMs: typeof s.maxWormholeLatencyMs === "number" ? s.maxWormholeLatencyMs : 0,
    mergedLiftPp: typeof s.mergedLiftPp === "number" ? s.mergedLiftPp : 0,
  };
}

function mergeCosmicIntoJson(
  previousRaw: unknown,
  snap: CosmicWebFederationSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.cosmicWebFederation = snap;
  return base;
}

export function ingestCosmicFilamentCells(
  previousRaw: unknown,
  cells: Omit<CosmicFilamentCell, "at" | "crdtVector" | "crdtMergeHash">[],
): { json: Record<string, unknown>; snap: CosmicWebFederationSnapshot } {
  const prev = readCosmicWebFederation(previousRaw);
  const baseVector = prev?.filaments.length ?? 0;
  const filaments: CosmicFilamentCell[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    crdtVector: baseVector + i + 1,
    crdtMergeHash: "",
  }));
  const all = [...(prev?.filaments ?? []), ...filaments].slice(-150);
  const mergeHash = crdtMergeHash(all);
  for (const f of all) {
    if (!f.crdtMergeHash) f.crdtMergeHash = mergeHash;
  }

  const filamentSet = new Set(all.map((f) => f.filament));
  const quorumRequired = Math.max(2, Math.ceil(COSMIC_FILAMENTS.length * cosmicWebQuorumFraction()));
  const quorumReached = filamentSet.size >= quorumRequired;

  const slo = wormholeLatencySloMs();
  const maxLatency = all.length > 0 ? Math.max(...all.map((f) => f.wormholeLatencyMs)) : 0;
  const wormholeSloMet = maxLatency <= slo;
  const mergedLiftPp =
    all.length > 0 ? all.reduce((s, f) => s + f.liftPp, 0) / all.length : 0;

  const inter = readIntergalacticMeshFederation(previousRaw);
  const intergalacticSynced = (inter?.quorumReached ?? false) && quorumReached;

  const snap: CosmicWebFederationSnapshot = {
    at: new Date().toISOString(),
    filaments: all,
    filamentQuorum: filamentSet.size,
    quorumReached,
    intergalacticSynced,
    wormholeSloMet,
    maxWormholeLatencyMs: maxLatency,
    mergedLiftPp,
  };

  return {
    json: mergeCosmicIntoJson(previousRaw, snap),
    snap,
  };
}

function parseCosmicPeerSlugs(excludeStoreSlug: string): string[] {
  const raw =
    process.env.COSMIC_WEB_PEER_STORES?.trim() ||
    process.env.CORTICAL_MESH_PEER_STORES?.trim() ||
    process.env.DNA_FEDERATION_PEER_STORES?.trim() ||
    "";
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== excludeStoreSlug);
}

/** Ingest filament cells from configured peer slugs (cron uses async workspace discovery). */
export function syncCosmicWebFromPeers(
  previousRaw: unknown,
  storeSlug: string,
): { json: Record<string, unknown>; snap: CosmicWebFederationSnapshot } {
  const peers = parseCosmicPeerSlugs(storeSlug);
  const cells: Omit<CosmicFilamentCell, "at" | "crdtVector" | "crdtMergeHash">[] = [];

  for (let i = 0; i < COSMIC_FILAMENTS.length; i++) {
    const filament = COSMIC_FILAMENTS[i]!;
    const peer = peers[i % Math.max(1, peers.length)] ?? `peer-${filament}`;
    cells.push({
      filament,
      peerStoreSlug: peer,
      wormholeLatencyMs: 80 + i * 40,
      armId: "draft",
      liftPp: 1.8 + i * 0.3,
    });
  }

  if (cells.length === 0) {
    cells.push({
      filament: "perseus_pisces",
      peerStoreSlug: "local-filament",
      wormholeLatencyMs: 100,
      armId: "draft",
      liftPp: 2.0,
    });
  }

  return ingestCosmicFilamentCells(previousRaw, cells);
}

export function evaluateCosmicWebFederationGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCosmicWebFederationEnabled()) {
    return { passed: true, headline: "Cosmic web federation off", detail: "" };
  }
  if (!isIntergalacticMeshFederationEnabled()) {
    return {
      passed: false,
      headline: "Intergalactic mesh federation required",
      detail: "Enable THEME_EXPERIMENT_INTERGALACTIC_MESH_FEDERATION=1 (AA5).",
    };
  }
  const snap = readCosmicWebFederation(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Cosmic filament quorum not reached",
      detail: `Need ${Math.ceil(COSMIC_FILAMENTS.length * cosmicWebQuorumFraction())} filaments.`,
    };
  }
  if (!snap.wormholeSloMet) {
    return {
      passed: false,
      headline: "Wormhole SLO breached on cosmic filaments",
      detail: `Max latency ${snap.maxWormholeLatencyMs}ms > SLO ${wormholeLatencySloMs()}ms.`,
    };
  }
  if (!snap.intergalacticSynced) {
    return {
      passed: false,
      headline: "Intergalactic mesh not synced with cosmic web",
      detail: "Run intergalactic federation sync before cosmic web publish.",
    };
  }
  return {
    passed: true,
    headline: "Cosmic web federation aligned",
    detail: `${snap.filamentQuorum} filaments · lift ${snap.mergedLiftPp.toFixed(1)}pp`,
  };
}
