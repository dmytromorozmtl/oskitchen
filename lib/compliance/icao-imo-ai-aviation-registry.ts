/**
 * AK2 — ICAO / IMO AI aviation registry mesh over AJ2 UN Office + AG2 EU Art. 71 PMM.
 */

import { createHash } from "node:crypto";
import {
  isEuAiActArt71PmmLiveEnabled,
  readEuAiActArt71PmmLive,
} from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import {
  isUnAiOfficeGlobalRegistryMeshEnabled,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";

export type AviationAuthorityId = "icao_montreal" | "imo_london" | "easa_cologne" | "faa_washington";

export type IcaoImoAviationRegistryEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  authorityId: AviationAuthorityId;
  aviationRecordId: string;
  aircraftSystemId: string;
  unRegistryAligned: boolean;
  pmmAligned: boolean;
  payloadHash: string;
  syncedToAviationRegistry: boolean;
};

export type IcaoImoAiAviationRegistrySnapshot = {
  at: string;
  events: IcaoImoAviationRegistryEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  aviationRegistryReady: boolean;
  authorityQuorum: number;
  publishBlockedByAviation: boolean;
  kafkaRelayed: boolean;
  unPmmAligned: boolean;
};

export const AVIATION_AUTHORITIES: AviationAuthorityId[] = [
  "icao_montreal",
  "imo_london",
  "easa_cologne",
  "faa_washington",
];

export function isIcaoImoAiAviationRegistryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ICAO_IMO_AI_AVIATION_REGISTRY === "1";
}

export function aviationRegistryStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_AVIATION_REGISTRY_MAX_LAG_MS ?? "3600000");
}

export function aviationAuthorityQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_AVIATION_AUTHORITY_QUORUM ?? "0.5");
}

function hashAviationEvent(input: {
  authorityId: string;
  aviationRecordId: string;
  aircraftSystemId: string;
}): string {
  return createHash("sha256")
    .update(`icao-imo:${input.authorityId}:${input.aviationRecordId}:${input.aircraftSystemId}`)
    .digest("hex");
}

export function readIcaoImoAiAviationRegistry(raw: unknown): IcaoImoAiAviationRegistrySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).icaoImoAiAviationRegistry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as IcaoImoAviationRegistryEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    aviationRegistryReady: s.aviationRegistryReady === true,
    authorityQuorum: typeof s.authorityQuorum === "number" ? s.authorityQuorum : 0,
    publishBlockedByAviation: s.publishBlockedByAviation === true,
    kafkaRelayed: s.kafkaRelayed === true,
    unPmmAligned: s.unPmmAligned === true,
  };
}

export function mergeIcaoImoAiAviationRegistry(
  previousRaw: unknown,
  snap: IcaoImoAiAviationRegistrySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.icaoImoAiAviationRegistry = snap;
  return base;
}

function buildAviationSnapshot(
  events: IcaoImoAviationRegistryEvent[],
  kafkaRelayed: boolean,
): IcaoImoAiAviationRegistrySnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const authoritySet = new Set(events.map((e) => e.authorityId));
  const quorumRequired = Math.max(2, Math.ceil(AVIATION_AUTHORITIES.length * aviationAuthorityQuorumFraction()));
  const misaligned = events.filter((e) => !e.unRegistryAligned || !e.pmmAligned).length;
  const publishBlockedByAviation = misaligned > 0;
  const aviationRegistryReady =
    last !== null &&
    streamLagMs <= aviationRegistryStreamMaxLagMs() &&
    last.syncedToAviationRegistry &&
    authoritySet.size >= quorumRequired &&
    !publishBlockedByAviation;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    aviationRegistryReady,
    authorityQuorum: authoritySet.size,
    publishBlockedByAviation,
    kafkaRelayed,
    unPmmAligned: true,
  };
}

export function ingestIcaoImoAviationRegistryEvent(
  previousRaw: unknown,
  event: Omit<IcaoImoAviationRegistryEvent, "at" | "payloadHash" | "eventId" | "unRegistryAligned" | "pmmAligned"> & {
    at?: string;
    eventId?: string;
    unRegistryAligned?: boolean;
    pmmAligned?: boolean;
  },
): { json: Record<string, unknown>; snap: IcaoImoAiAviationRegistrySnapshot } {
  const unOk =
    !isUnAiOfficeGlobalRegistryMeshEnabled() ||
    (readUnAiOfficeGlobalRegistryMesh(previousRaw)?.globalRegistryReady ?? false);
  const pmmOk =
    !isEuAiActArt71PmmLiveEnabled() || !readEuAiActArt71PmmLive(previousRaw)?.publishBlockedByPmm;

  const entry: IcaoImoAviationRegistryEvent = {
    eventId: event.eventId ?? `aviation-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    authorityId: event.authorityId,
    aviationRecordId: event.aviationRecordId,
    aircraftSystemId: event.aircraftSystemId,
    unRegistryAligned: event.unRegistryAligned ?? unOk,
    pmmAligned: event.pmmAligned ?? pmmOk,
    payloadHash: hashAviationEvent(event),
    syncedToAviationRegistry: event.syncedToAviationRegistry,
  };

  const prev = readIcaoImoAiAviationRegistry(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-240);
  const snap = buildAviationSnapshot(events, prev?.kafkaRelayed ?? false);
  snap.unPmmAligned = Boolean(unOk && pmmOk);
  if (!snap.unPmmAligned) {
    snap.aviationRegistryReady = false;
  }
  return { json: mergeIcaoImoAiAviationRegistry(previousRaw, snap), snap };
}

export function pollIcaoImoAviationRegistry(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: IcaoImoAiAviationRegistrySnapshot;
} {
  const seq = (readIcaoImoAiAviationRegistry(previousRaw)?.events.length ?? 0) + 1;
  const authorityId = AVIATION_AUTHORITIES[seq % AVIATION_AUTHORITIES.length]!;
  return ingestIcaoImoAviationRegistryEvent(previousRaw, {
    source: "poll",
    authorityId,
    aviationRecordId: `av-rec-${seq}`,
    aircraftSystemId: `ac-sys-${seq}`,
    syncedToAviationRegistry: true,
  });
}

export function evaluateIcaoImoAiAviationRegistryGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIcaoImoAiAviationRegistryEnabled()) {
    return { passed: true, headline: "ICAO/IMO aviation registry off", detail: "" };
  }
  if (isUnAiOfficeGlobalRegistryMeshEnabled() && !readUnAiOfficeGlobalRegistryMesh(raw)?.globalRegistryReady) {
    return {
      passed: false,
      headline: "UN global registry must be fresh",
      detail: "Complete AJ2 UN AI Office registry before aviation layer.",
    };
  }
  if (isEuAiActArt71PmmLiveEnabled() && readEuAiActArt71PmmLive(raw)?.publishBlockedByPmm) {
    return {
      passed: false,
      headline: "EU Art. 71 PMM blocks aviation registry",
      detail: "Resolve serious PMM incidents before ICAO/IMO aviation publish.",
    };
  }
  const snap = readIcaoImoAiAviationRegistry(raw);
  if (snap?.publishBlockedByAviation) {
    return {
      passed: false,
      headline: "Aviation UN/PMM alignment gap",
      detail: "One or more aviation records lack UN/PMM cross-alignment.",
    };
  }
  if (!snap?.aviationRegistryReady || !snap.unPmmAligned) {
    return {
      passed: false,
      headline: "ICAO/IMO aviation registry not fresh",
      detail: "Await aviation registry events with UN/PMM alignment and authority quorum.",
    };
  }
  return {
    passed: true,
    headline: "ICAO/IMO aviation registry OK",
    detail: `${snap.authorityQuorum} authorities · last ${snap.lastEventAt ?? "—"}`,
  };
}
