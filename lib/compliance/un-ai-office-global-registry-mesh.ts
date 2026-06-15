/**
 * AJ2 — UN AI Office global registry mesh over AI2 OECD + AG2 EU Art. 71 PMM.
 */

import { createHash } from "node:crypto";
import {
  isEuAiActArt71PmmLiveEnabled,
  readEuAiActArt71PmmLive,
} from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import {
  isOecdStateAgAiTransparencyMeshEnabled,
  readOecdStateAgAiTransparencyMesh,
} from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";

export type UnAiOfficeRegionId = "un_hq_ny" | "unog_geneva" | "unesco_paris" | "itu_geneva";

export type UnAiOfficeRegistryEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  regionId: UnAiOfficeRegionId;
  globalRecordId: string;
  modelDeploymentId: string;
  oecdAligned: boolean;
  pmmAligned: boolean;
  payloadHash: string;
  syncedToGlobalRegistry: boolean;
};

export type UnAiOfficeGlobalRegistryMeshSnapshot = {
  at: string;
  events: UnAiOfficeRegistryEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  globalRegistryReady: boolean;
  regionQuorum: number;
  publishBlockedByUnRegistry: boolean;
  kafkaRelayed: boolean;
  oecdPmmAligned: boolean;
};

export const UN_AI_OFFICE_REGIONS: UnAiOfficeRegionId[] = [
  "un_hq_ny",
  "unog_geneva",
  "unesco_paris",
  "itu_geneva",
];

export function isUnAiOfficeGlobalRegistryMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_UN_AI_OFFICE_GLOBAL_REGISTRY_MESH === "1";
}

export function unRegistryStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_UN_REGISTRY_MAX_LAG_MS ?? "3600000");
}

export function unRegionQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_UN_REGION_QUORUM ?? "0.5");
}

function hashUnRegistryEvent(input: {
  regionId: string;
  globalRecordId: string;
  modelDeploymentId: string;
}): string {
  return createHash("sha256")
    .update(`un-ai-office:${input.regionId}:${input.globalRecordId}:${input.modelDeploymentId}`)
    .digest("hex");
}

export function readUnAiOfficeGlobalRegistryMesh(raw: unknown): UnAiOfficeGlobalRegistryMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).unAiOfficeGlobalRegistryMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as UnAiOfficeRegistryEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    globalRegistryReady: s.globalRegistryReady === true,
    regionQuorum: typeof s.regionQuorum === "number" ? s.regionQuorum : 0,
    publishBlockedByUnRegistry: s.publishBlockedByUnRegistry === true,
    kafkaRelayed: s.kafkaRelayed === true,
    oecdPmmAligned: s.oecdPmmAligned === true,
  };
}

export function mergeUnAiOfficeGlobalRegistryMesh(
  previousRaw: unknown,
  snap: UnAiOfficeGlobalRegistryMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.unAiOfficeGlobalRegistryMesh = snap;
  return base;
}

function buildUnRegistrySnapshot(
  events: UnAiOfficeRegistryEvent[],
  kafkaRelayed: boolean,
): UnAiOfficeGlobalRegistryMeshSnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const regionSet = new Set(events.map((e) => e.regionId));
  const quorumRequired = Math.max(2, Math.ceil(UN_AI_OFFICE_REGIONS.length * unRegionQuorumFraction()));
  const regionQuorum = regionSet.size;
  const misaligned = events.filter((e) => !e.oecdAligned || !e.pmmAligned).length;
  const publishBlockedByUnRegistry = misaligned > 0;
  const globalRegistryReady =
    last !== null &&
    streamLagMs <= unRegistryStreamMaxLagMs() &&
    last.syncedToGlobalRegistry &&
    regionQuorum >= quorumRequired &&
    !publishBlockedByUnRegistry;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    globalRegistryReady,
    regionQuorum,
    publishBlockedByUnRegistry,
    kafkaRelayed,
    oecdPmmAligned: true,
  };
}

export function ingestUnAiOfficeRegistryEvent(
  previousRaw: unknown,
  event: Omit<UnAiOfficeRegistryEvent, "at" | "payloadHash" | "eventId" | "oecdAligned" | "pmmAligned"> & {
    at?: string;
    eventId?: string;
    oecdAligned?: boolean;
    pmmAligned?: boolean;
  },
): { json: Record<string, unknown>; snap: UnAiOfficeGlobalRegistryMeshSnapshot } {
  const oecdOk =
    !isOecdStateAgAiTransparencyMeshEnabled() ||
    (readOecdStateAgAiTransparencyMesh(previousRaw)?.meshFeedReady ?? false);
  const pmmOk =
    !isEuAiActArt71PmmLiveEnabled() ||
    !readEuAiActArt71PmmLive(previousRaw)?.publishBlockedByPmm;

  const entry: UnAiOfficeRegistryEvent = {
    eventId: event.eventId ?? `un-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    regionId: event.regionId,
    globalRecordId: event.globalRecordId,
    modelDeploymentId: event.modelDeploymentId,
    oecdAligned: event.oecdAligned ?? oecdOk,
    pmmAligned: event.pmmAligned ?? pmmOk,
    payloadHash: hashUnRegistryEvent(event),
    syncedToGlobalRegistry: event.syncedToGlobalRegistry,
  };

  const prev = readUnAiOfficeGlobalRegistryMesh(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-240);
  const snap = buildUnRegistrySnapshot(events, prev?.kafkaRelayed ?? false);
  snap.oecdPmmAligned = Boolean(oecdOk && pmmOk);
  if (!snap.oecdPmmAligned) {
    snap.globalRegistryReady = false;
  }
  return { json: mergeUnAiOfficeGlobalRegistryMesh(previousRaw, snap), snap };
}

export function pollUnAiOfficeGlobalRegistryMesh(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: UnAiOfficeGlobalRegistryMeshSnapshot;
} {
  const seq = (readUnAiOfficeGlobalRegistryMesh(previousRaw)?.events.length ?? 0) + 1;
  const regionId = UN_AI_OFFICE_REGIONS[seq % UN_AI_OFFICE_REGIONS.length]!;
  return ingestUnAiOfficeRegistryEvent(previousRaw, {
    source: "poll",
    regionId,
    globalRecordId: `un-rec-${seq}`,
    modelDeploymentId: `deploy-un-${seq}`,
    syncedToGlobalRegistry: true,
  });
}

export function evaluateUnAiOfficeGlobalRegistryMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isUnAiOfficeGlobalRegistryMeshEnabled()) {
    return { passed: true, headline: "UN AI Office global registry mesh off", detail: "" };
  }
  if (isOecdStateAgAiTransparencyMeshEnabled() && !readOecdStateAgAiTransparencyMesh(raw)?.meshFeedReady) {
    return {
      passed: false,
      headline: "OECD mesh must be fresh for UN registry",
      detail: "Complete AI2 OECD/state-AG transparency mesh before UN global registry.",
    };
  }
  if (isEuAiActArt71PmmLiveEnabled() && readEuAiActArt71PmmLive(raw)?.publishBlockedByPmm) {
    return {
      passed: false,
      headline: "EU Art. 71 PMM blocks UN global registry",
      detail: "Resolve serious PMM incidents before UN AI Office registry publish.",
    };
  }
  const snap = readUnAiOfficeGlobalRegistryMesh(raw);
  if (snap?.publishBlockedByUnRegistry) {
    return {
      passed: false,
      headline: "UN registry OECD/PMM alignment gap",
      detail: "One or more UN registry records lack OECD/PMM cross-alignment.",
    };
  }
  if (!snap?.globalRegistryReady || !snap.oecdPmmAligned) {
    return {
      passed: false,
      headline: "UN AI Office global registry not fresh",
      detail: "Await UN registry events with OECD/PMM alignment and region quorum.",
    };
  }
  return {
    passed: true,
    headline: "UN AI Office global registry mesh OK",
    detail: `${snap.regionQuorum} regions · last ${snap.lastEventAt ?? "—"}`,
  };
}
