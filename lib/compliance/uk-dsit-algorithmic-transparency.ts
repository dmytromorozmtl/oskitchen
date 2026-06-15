/**
 * AE2 — UK DSIT algorithmic transparency live feed (UK AI safety + AD2 streaming pattern).
 */

import { createHash } from "node:crypto";
import {
  isEuAiActLiveRegistryEnabled,
  readEuAiActLiveRegistry,
} from "@/lib/compliance/eu-ai-act-live-registry";
import { isUkAiSafetyEnabled, readUkAiSafetyPack } from "@/lib/compliance/uk-ai-safety";

export type UkDsitTransparencyEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  transparencyRecordId: string;
  algorithmicSystemId: string;
  disclosureLevel: "standard" | "enhanced" | "frontier";
  payloadHash: string;
  publishedToDsit: boolean;
};

export type UkDsitAlgorithmicTransparencySnapshot = {
  at: string;
  events: UkDsitTransparencyEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  dsitFeedReady: boolean;
  kafkaRelayed: boolean;
  ukSafetyAligned: boolean;
};

export function isUkDsitAlgorithmicTransparencyEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_UK_DSIT_ALGORITHMIC_TRANSPARENCY === "1";
}

export function ukDsitStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_UK_DSIT_STREAM_MAX_LAG_MS ?? "3600000");
}

function hashDsitEvent(input: {
  transparencyRecordId: string;
  algorithmicSystemId: string;
  disclosureLevel: string;
}): string {
  return createHash("sha256")
    .update(`uk-dsit:${input.transparencyRecordId}:${input.algorithmicSystemId}:${input.disclosureLevel}`)
    .digest("hex");
}

export function readUkDsitAlgorithmicTransparency(
  raw: unknown,
): UkDsitAlgorithmicTransparencySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).ukDsitAlgorithmicTransparency;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as UkDsitTransparencyEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    dsitFeedReady: s.dsitFeedReady === true,
    kafkaRelayed: s.kafkaRelayed === true,
    ukSafetyAligned: s.ukSafetyAligned === true,
  };
}

export function mergeUkDsitAlgorithmicTransparency(
  previousRaw: unknown,
  snap: UkDsitAlgorithmicTransparencySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.ukDsitAlgorithmicTransparency = snap;
  return base;
}

export function ingestUkDsitTransparencyEvent(
  previousRaw: unknown,
  event: Omit<UkDsitTransparencyEvent, "at" | "payloadHash" | "eventId"> & {
    at?: string;
    eventId?: string;
  },
): { json: Record<string, unknown>; snap: UkDsitAlgorithmicTransparencySnapshot } {
  const at = event.at ?? new Date().toISOString();
  const entry: UkDsitTransparencyEvent = {
    eventId: event.eventId ?? `uk-dsit-${Date.now()}`,
    at,
    source: event.source,
    transparencyRecordId: event.transparencyRecordId,
    algorithmicSystemId: event.algorithmicSystemId,
    disclosureLevel: event.disclosureLevel,
    payloadHash: hashDsitEvent(event),
    publishedToDsit: event.publishedToDsit,
  };

  const prev = readUkDsitAlgorithmicTransparency(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-200);
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;

  const uk = readUkAiSafetyPack(previousRaw);
  const ukSafetyAligned =
    (uk?.capabilityEvals.every((e) => e.passed) ?? true) &&
    (uk?.frontierDisclosure?.alignmentReview ?? false);

  const dsitFeedReady =
    last !== null &&
    streamLagMs <= ukDsitStreamMaxLagMs() &&
    last.publishedToDsit &&
    ukSafetyAligned;

  const snap: UkDsitAlgorithmicTransparencySnapshot = {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    dsitFeedReady,
    kafkaRelayed: prev?.kafkaRelayed ?? false,
    ukSafetyAligned,
  };

  return { json: mergeUkDsitAlgorithmicTransparency(previousRaw, snap), snap };
}

export function pollUkDsitTransparencyFeed(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: UkDsitAlgorithmicTransparencySnapshot;
} {
  const seq = (readUkDsitAlgorithmicTransparency(previousRaw)?.events.length ?? 0) + 1;
  return ingestUkDsitTransparencyEvent(previousRaw, {
    source: "poll",
    transparencyRecordId: `uk-tr-${seq}`,
    algorithmicSystemId: process.env.UK_DSIT_ALGORITHMIC_SYSTEM_ID ?? "kos-experiment-assign",
    disclosureLevel: seq % 4 === 0 ? "frontier" : "enhanced",
    publishedToDsit: true,
  });
}

export function evaluateUkDsitAlgorithmicTransparencyGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isUkDsitAlgorithmicTransparencyEnabled()) {
    return { passed: true, headline: "UK DSIT transparency off", detail: "" };
  }
  if (!isUkAiSafetyEnabled()) {
    return {
      passed: false,
      headline: "UK AI safety pack required",
      detail: "Enable THEME_EXPERIMENT_UK_AI_SAFETY=1 (T4).",
    };
  }
  if (isEuAiActLiveRegistryEnabled() && !readEuAiActLiveRegistry(raw)?.liveRegistryReady) {
    return {
      passed: false,
      headline: "EU live registry alignment required",
      detail: "Enable AD2 stream or disable cross-check.",
    };
  }
  const snap = readUkDsitAlgorithmicTransparency(raw);
  if (!snap?.dsitFeedReady) {
    return {
      passed: false,
      headline: "UK DSIT feed not fresh",
      detail: "Await transparency event within stream lag window.",
    };
  }
  return {
    passed: true,
    headline: "UK DSIT algorithmic transparency OK",
    detail: `Last ${snap.lastEventAt ?? "—"} · UK safety aligned`,
  };
}
