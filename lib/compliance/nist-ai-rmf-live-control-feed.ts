/**
 * AF2 — US NIST AI RMF live control feed (V4 + AE2 streaming pattern).
 */

import { createHash } from "node:crypto";
import {
  isNistAiRmfEnabled,
  readNistAiRmfPack,
  seedNistAiRmfFromCompliancePacks,
  type NistAiRmfFunction,
} from "@/lib/compliance/nist-ai-rmf";
import {
  isUkDsitAlgorithmicTransparencyEnabled,
  readUkDsitAlgorithmicTransparency,
} from "@/lib/compliance/uk-dsit-algorithmic-transparency";

export type NistRmfControlStreamEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  controlId: string;
  rmfFunction: NistAiRmfFunction;
  previousStatus: string | null;
  newStatus: "complete" | "partial" | "pending";
  payloadHash: string;
  syncedToNistFeed: boolean;
};

export type NistAiRmfLiveControlFeedSnapshot = {
  at: string;
  events: NistRmfControlStreamEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  liveControlFeedReady: boolean;
  kafkaRelayed: boolean;
  rmfPackAligned: boolean;
};

export function isNistAiRmfLiveControlFeedEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_NIST_AI_RMF_LIVE_CONTROL_FEED === "1";
}

export function nistRmfStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_NIST_RMF_STREAM_MAX_LAG_MS ?? "3600000");
}

function hashControlEvent(input: {
  controlId: string;
  rmfFunction: string;
  newStatus: string;
}): string {
  return createHash("sha256")
    .update(`nist-rmf:${input.controlId}:${input.rmfFunction}:${input.newStatus}`)
    .digest("hex");
}

export function readNistAiRmfLiveControlFeed(raw: unknown): NistAiRmfLiveControlFeedSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).nistAiRmfLiveControlFeed;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as NistRmfControlStreamEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    liveControlFeedReady: s.liveControlFeedReady === true,
    kafkaRelayed: s.kafkaRelayed === true,
    rmfPackAligned: s.rmfPackAligned === true,
  };
}

export function mergeNistAiRmfLiveControlFeed(
  previousRaw: unknown,
  snap: NistAiRmfLiveControlFeedSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.nistAiRmfLiveControlFeed = snap;
  return base;
}

export function ingestNistRmfControlStreamEvent(
  previousRaw: unknown,
  event: Omit<NistRmfControlStreamEvent, "at" | "payloadHash" | "eventId"> & {
    at?: string;
    eventId?: string;
  },
): { json: Record<string, unknown>; snap: NistAiRmfLiveControlFeedSnapshot } {
  const at = event.at ?? new Date().toISOString();
  const entry: NistRmfControlStreamEvent = {
    eventId: event.eventId ?? `nist-ctrl-${Date.now()}`,
    at,
    source: event.source,
    controlId: event.controlId,
    rmfFunction: event.rmfFunction,
    previousStatus: event.previousStatus,
    newStatus: event.newStatus,
    payloadHash: hashControlEvent(event),
    syncedToNistFeed: event.syncedToNistFeed,
  };

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  const pack = readNistAiRmfPack(json) ?? seedNistAiRmfFromCompliancePacks(json);
  pack.functions[event.rmfFunction] = {
    status: event.newStatus,
    notes: `Live feed ${entry.controlId}`,
  };
  pack.at = new Date().toISOString();
  json = { ...json, nistAiRmfPack: pack };

  const prev = readNistAiRmfLiveControlFeed(json);
  const events = [...(prev?.events ?? []), entry].slice(-200);
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;

  const rmfPackAligned = (Object.keys(pack.functions) as NistAiRmfFunction[]).every(
    (f) => pack.functions[f].status !== "pending",
  );

  const liveControlFeedReady =
    last !== null &&
    streamLagMs <= nistRmfStreamMaxLagMs() &&
    last.syncedToNistFeed &&
    rmfPackAligned;

  const snap: NistAiRmfLiveControlFeedSnapshot = {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    liveControlFeedReady,
    kafkaRelayed: prev?.kafkaRelayed ?? false,
    rmfPackAligned,
  };

  return { json: mergeNistAiRmfLiveControlFeed(json, snap), snap };
}

export function pollNistRmfControlFeed(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: NistAiRmfLiveControlFeedSnapshot;
} {
  const seq = (readNistAiRmfLiveControlFeed(previousRaw)?.events.length ?? 0) + 1;
  const functions: NistAiRmfFunction[] = ["govern", "map", "measure", "manage"];
  const fn = functions[seq % functions.length]!;
  return ingestNistRmfControlStreamEvent(previousRaw, {
    source: "poll",
    controlId: `nist-ctrl-${seq}`,
    rmfFunction: fn,
    previousStatus: "partial",
    newStatus: "complete",
    syncedToNistFeed: true,
  });
}

export function evaluateNistAiRmfLiveControlFeedGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isNistAiRmfLiveControlFeedEnabled()) {
    return { passed: true, headline: "NIST AI RMF live control feed off", detail: "" };
  }
  if (!isNistAiRmfEnabled()) {
    return {
      passed: false,
      headline: "NIST AI RMF pack required",
      detail: "Enable THEME_EXPERIMENT_NIST_AI_RMF=1 (V4).",
    };
  }
  if (isUkDsitAlgorithmicTransparencyEnabled() && !readUkDsitAlgorithmicTransparency(raw)?.dsitFeedReady) {
    return {
      passed: false,
      headline: "UK DSIT feed alignment required",
      detail: "AE2 transparency stream should be fresh for cross-border RMF.",
    };
  }
  const snap = readNistAiRmfLiveControlFeed(raw);
  if (!snap?.liveControlFeedReady) {
    return {
      passed: false,
      headline: "NIST RMF live control feed not fresh",
      detail: "Await control stream event within lag window.",
    };
  }
  return {
    passed: true,
    headline: "NIST AI RMF live control feed OK",
    detail: `Last ${snap.lastEventAt ?? "—"} · all functions aligned`,
  };
}
