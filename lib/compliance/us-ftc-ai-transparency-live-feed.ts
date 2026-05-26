/**
 * AH2 — US FTC AI transparency live feed (AF2 NIST RMF + AG2 EU Art. 71 PMM alignment).
 */

import { createHash } from "node:crypto";
import {
  isNistAiRmfLiveControlFeedEnabled,
  readNistAiRmfLiveControlFeed,
} from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import {
  isEuAiActArt71PmmLiveEnabled,
  readEuAiActArt71PmmLive,
} from "@/lib/compliance/eu-ai-act-art71-pmm-live";

export type FtcTransparencyDisclosureLevel = "baseline" | "enhanced" | "frontier";

export type UsFtcAiTransparencyEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  transparencyRecordId: string;
  algorithmicSystemId: string;
  disclosureLevel: FtcTransparencyDisclosureLevel;
  consumerHarmRisk: "low" | "medium" | "high";
  payloadHash: string;
  syncedToFtcFeed: boolean;
};

export type UsFtcAiTransparencyLiveSnapshot = {
  at: string;
  events: UsFtcAiTransparencyEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  ftcFeedReady: boolean;
  highHarmOpen: number;
  publishBlockedByFtc: boolean;
  kafkaRelayed: boolean;
  nistPmmAligned: boolean;
};

export function isUsFtcAiTransparencyLiveEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_US_FTC_AI_TRANSPARENCY_LIVE === "1";
}

export function ftcStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_FTC_STREAM_MAX_LAG_MS ?? "3600000");
}

function hashFtcEvent(input: {
  transparencyRecordId: string;
  disclosureLevel: string;
  consumerHarmRisk: string;
}): string {
  return createHash("sha256")
    .update(`ftc-ai:${input.transparencyRecordId}:${input.disclosureLevel}:${input.consumerHarmRisk}`)
    .digest("hex");
}

export function readUsFtcAiTransparencyLive(raw: unknown): UsFtcAiTransparencyLiveSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).usFtcAiTransparencyLive;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as UsFtcAiTransparencyEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    ftcFeedReady: s.ftcFeedReady === true,
    highHarmOpen: typeof s.highHarmOpen === "number" ? s.highHarmOpen : 0,
    publishBlockedByFtc: s.publishBlockedByFtc === true,
    kafkaRelayed: s.kafkaRelayed === true,
    nistPmmAligned: s.nistPmmAligned === true,
  };
}

export function mergeUsFtcAiTransparencyLive(
  previousRaw: unknown,
  snap: UsFtcAiTransparencyLiveSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.usFtcAiTransparencyLive = snap;
  return base;
}

function buildFtcSnapshot(
  events: UsFtcAiTransparencyEvent[],
  kafkaRelayed: boolean,
): UsFtcAiTransparencyLiveSnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const highHarmOpen = events.filter(
    (e) => e.consumerHarmRisk === "high" && e.disclosureLevel !== "frontier",
  ).length;
  const publishBlockedByFtc = highHarmOpen > 0;
  const ftcFeedReady =
    last !== null &&
    streamLagMs <= ftcStreamMaxLagMs() &&
    last.syncedToFtcFeed &&
    !publishBlockedByFtc;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    ftcFeedReady,
    highHarmOpen,
    publishBlockedByFtc,
    kafkaRelayed,
    nistPmmAligned: true,
  };
}

export function ingestUsFtcTransparencyEvent(
  previousRaw: unknown,
  event: Omit<UsFtcAiTransparencyEvent, "at" | "payloadHash" | "eventId"> & {
    at?: string;
    eventId?: string;
  },
): { json: Record<string, unknown>; snap: UsFtcAiTransparencyLiveSnapshot } {
  const entry: UsFtcAiTransparencyEvent = {
    eventId: event.eventId ?? `ftc-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    transparencyRecordId: event.transparencyRecordId,
    algorithmicSystemId: event.algorithmicSystemId,
    disclosureLevel: event.disclosureLevel,
    consumerHarmRisk: event.consumerHarmRisk,
    payloadHash: hashFtcEvent(event),
    syncedToFtcFeed: event.syncedToFtcFeed,
  };

  const prev = readUsFtcAiTransparencyLive(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-200);
  const nistOk = !isNistAiRmfLiveControlFeedEnabled() || readNistAiRmfLiveControlFeed(previousRaw)?.liveControlFeedReady;
  const pmmOk =
    !isEuAiActArt71PmmLiveEnabled() || !readEuAiActArt71PmmLive(previousRaw)?.publishBlockedByPmm;
  const snap = buildFtcSnapshot(events, prev?.kafkaRelayed ?? false);
  snap.nistPmmAligned = Boolean(nistOk && pmmOk);
  if (!snap.nistPmmAligned) {
    snap.ftcFeedReady = false;
  }
  return { json: mergeUsFtcAiTransparencyLive(previousRaw, snap), snap };
}

export function pollUsFtcTransparencyFeed(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: UsFtcAiTransparencyLiveSnapshot;
} {
  const seq = (readUsFtcAiTransparencyLive(previousRaw)?.events.length ?? 0) + 1;
  return ingestUsFtcTransparencyEvent(previousRaw, {
    source: "poll",
    transparencyRecordId: `ftc-rec-${seq}`,
    algorithmicSystemId: `algo-${seq}`,
    disclosureLevel: "enhanced",
    consumerHarmRisk: "low",
    syncedToFtcFeed: true,
  });
}

export function evaluateUsFtcAiTransparencyLiveGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isUsFtcAiTransparencyLiveEnabled()) {
    return { passed: true, headline: "US FTC AI transparency live off", detail: "" };
  }
  if (isNistAiRmfLiveControlFeedEnabled() && !readNistAiRmfLiveControlFeed(raw)?.liveControlFeedReady) {
    return {
      passed: false,
      headline: "NIST RMF live feed alignment required",
      detail: "Enable AF2 NIST stream freshness before FTC transparency.",
    };
  }
  if (isEuAiActArt71PmmLiveEnabled() && readEuAiActArt71PmmLive(raw)?.publishBlockedByPmm) {
    return {
      passed: false,
      headline: "EU Art. 71 PMM blocks FTC cross-border feed",
      detail: "Resolve serious PMM incidents before FTC transparency publish.",
    };
  }
  const snap = readUsFtcAiTransparencyLive(raw);
  if (snap?.publishBlockedByFtc) {
    return {
      passed: false,
      headline: "FTC high consumer-harm disclosure gap",
      detail: `${snap.highHarmOpen} high-harm record(s) need frontier disclosure.`,
    };
  }
  if (!snap?.ftcFeedReady || !snap.nistPmmAligned) {
    return {
      passed: false,
      headline: "FTC transparency feed not fresh",
      detail: "Await FTC stream event within lag window with NIST/PMM alignment.",
    };
  }
  return {
    passed: true,
    headline: "US FTC AI transparency live OK",
    detail: `Last ${snap.lastEventAt ?? "—"} · NIST/PMM aligned`,
  };
}
