/**
 * AL2 — WTO / UPU cross-border AI trade registry over AK2 ICAO/IMO + AJ2 UN Office.
 */

import { createHash } from "node:crypto";
import {
  isIcaoImoAiAviationRegistryEnabled,
  readIcaoImoAiAviationRegistry,
} from "@/lib/compliance/icao-imo-ai-aviation-registry";
import {
  isUnAiOfficeGlobalRegistryMeshEnabled,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";

export type TradeRegistryBodyId = "wto_geneva" | "upu_bern" | "unctad_geneva" | "itu_trade";

export type WtoUpuTradeRegistryEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  bodyId: TradeRegistryBodyId;
  tradeRecordId: string;
  crossBorderShipmentId: string;
  aviationAligned: boolean;
  unRegistryAligned: boolean;
  payloadHash: string;
  syncedToTradeRegistry: boolean;
};

export type WtoUpuCrossBorderAiTradeRegistrySnapshot = {
  at: string;
  events: WtoUpuTradeRegistryEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  tradeRegistryReady: boolean;
  bodyQuorum: number;
  publishBlockedByTrade: boolean;
  kafkaRelayed: boolean;
  aviationUnAligned: boolean;
};

export const TRADE_REGISTRY_BODIES: TradeRegistryBodyId[] = [
  "wto_geneva",
  "upu_bern",
  "unctad_geneva",
  "itu_trade",
];

export function isWtoUpuCrossBorderAiTradeRegistryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_WTO_UPU_CROSS_BORDER_AI_TRADE_REGISTRY === "1";
}

export function tradeRegistryStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_TRADE_REGISTRY_MAX_LAG_MS ?? "3600000");
}

export function tradeRegistryBodyQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_TRADE_REGISTRY_BODY_QUORUM ?? "0.5");
}

function hashTradeEvent(input: {
  bodyId: string;
  tradeRecordId: string;
  crossBorderShipmentId: string;
}): string {
  return createHash("sha256")
    .update(`wto-upu:${input.bodyId}:${input.tradeRecordId}:${input.crossBorderShipmentId}`)
    .digest("hex");
}

export function readWtoUpuCrossBorderAiTradeRegistry(
  raw: unknown,
): WtoUpuCrossBorderAiTradeRegistrySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).wtoUpuCrossBorderAiTradeRegistry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as WtoUpuTradeRegistryEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    tradeRegistryReady: s.tradeRegistryReady === true,
    bodyQuorum: typeof s.bodyQuorum === "number" ? s.bodyQuorum : 0,
    publishBlockedByTrade: s.publishBlockedByTrade === true,
    kafkaRelayed: s.kafkaRelayed === true,
    aviationUnAligned: s.aviationUnAligned === true,
  };
}

export function mergeWtoUpuCrossBorderAiTradeRegistry(
  previousRaw: unknown,
  snap: WtoUpuCrossBorderAiTradeRegistrySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.wtoUpuCrossBorderAiTradeRegistry = snap;
  return base;
}

function buildTradeSnapshot(
  events: WtoUpuTradeRegistryEvent[],
  kafkaRelayed: boolean,
): WtoUpuCrossBorderAiTradeRegistrySnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const bodySet = new Set(events.map((e) => e.bodyId));
  const quorumRequired = Math.max(2, Math.ceil(TRADE_REGISTRY_BODIES.length * tradeRegistryBodyQuorumFraction()));
  const misaligned = events.filter((e) => !e.aviationAligned || !e.unRegistryAligned).length;
  const publishBlockedByTrade = misaligned > 0;
  const tradeRegistryReady =
    last !== null &&
    streamLagMs <= tradeRegistryStreamMaxLagMs() &&
    last.syncedToTradeRegistry &&
    bodySet.size >= quorumRequired &&
    !publishBlockedByTrade;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    tradeRegistryReady,
    bodyQuorum: bodySet.size,
    publishBlockedByTrade,
    kafkaRelayed,
    aviationUnAligned: true,
  };
}

export function ingestWtoUpuTradeRegistryEvent(
  previousRaw: unknown,
  event: Omit<
    WtoUpuTradeRegistryEvent,
    "at" | "payloadHash" | "eventId" | "aviationAligned" | "unRegistryAligned"
  > & {
    at?: string;
    eventId?: string;
    aviationAligned?: boolean;
    unRegistryAligned?: boolean;
  },
): { json: Record<string, unknown>; snap: WtoUpuCrossBorderAiTradeRegistrySnapshot } {
  const avOk =
    !isIcaoImoAiAviationRegistryEnabled() ||
    (readIcaoImoAiAviationRegistry(previousRaw)?.aviationRegistryReady ?? false);
  const unOk =
    !isUnAiOfficeGlobalRegistryMeshEnabled() ||
    (readUnAiOfficeGlobalRegistryMesh(previousRaw)?.globalRegistryReady ?? false);

  const entry: WtoUpuTradeRegistryEvent = {
    eventId: event.eventId ?? `trade-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    bodyId: event.bodyId,
    tradeRecordId: event.tradeRecordId,
    crossBorderShipmentId: event.crossBorderShipmentId,
    aviationAligned: event.aviationAligned ?? avOk,
    unRegistryAligned: event.unRegistryAligned ?? unOk,
    payloadHash: hashTradeEvent(event),
    syncedToTradeRegistry: event.syncedToTradeRegistry,
  };

  const prev = readWtoUpuCrossBorderAiTradeRegistry(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-240);
  const snap = buildTradeSnapshot(events, prev?.kafkaRelayed ?? false);
  snap.aviationUnAligned = Boolean(avOk && unOk);
  if (!snap.aviationUnAligned) {
    snap.tradeRegistryReady = false;
  }
  return { json: mergeWtoUpuCrossBorderAiTradeRegistry(previousRaw, snap), snap };
}

export function pollWtoUpuCrossBorderAiTradeRegistry(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: WtoUpuCrossBorderAiTradeRegistrySnapshot;
} {
  const seq = (readWtoUpuCrossBorderAiTradeRegistry(previousRaw)?.events.length ?? 0) + 1;
  const bodyId = TRADE_REGISTRY_BODIES[seq % TRADE_REGISTRY_BODIES.length]!;
  return ingestWtoUpuTradeRegistryEvent(previousRaw, {
    source: "poll",
    bodyId,
    tradeRecordId: `trade-rec-${seq}`,
    crossBorderShipmentId: `cb-ship-${seq}`,
    syncedToTradeRegistry: true,
  });
}

export function evaluateWtoUpuCrossBorderAiTradeRegistryGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isWtoUpuCrossBorderAiTradeRegistryEnabled()) {
    return { passed: true, headline: "WTO/UPU trade registry off", detail: "" };
  }
  if (isIcaoImoAiAviationRegistryEnabled() && !readIcaoImoAiAviationRegistry(raw)?.aviationRegistryReady) {
    return {
      passed: false,
      headline: "ICAO/IMO aviation registry must be fresh",
      detail: "Complete AK2 aviation layer before WTO/UPU trade registry.",
    };
  }
  if (isUnAiOfficeGlobalRegistryMeshEnabled() && !readUnAiOfficeGlobalRegistryMesh(raw)?.globalRegistryReady) {
    return {
      passed: false,
      headline: "UN global registry must be fresh",
      detail: "Complete AJ2 UN AI Office registry before trade layer.",
    };
  }
  const snap = readWtoUpuCrossBorderAiTradeRegistry(raw);
  if (snap?.publishBlockedByTrade) {
    return {
      passed: false,
      headline: "Trade aviation/UN alignment gap",
      detail: "One or more trade records lack aviation/UN cross-alignment.",
    };
  }
  if (!snap?.tradeRegistryReady || !snap.aviationUnAligned) {
    return {
      passed: false,
      headline: "WTO/UPU trade registry not fresh",
      detail: "Await trade registry events with aviation/UN alignment and body quorum.",
    };
  }
  return {
    passed: true,
    headline: "WTO/UPU trade registry OK",
    detail: `${snap.bodyQuorum} bodies · last ${snap.lastEventAt ?? "—"}`,
  };
}
