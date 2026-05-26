/**
 * P2 — Durable feature stream log with exactly-once eventId dedupe (24h window).
 * Flink job → webhook; DLQ for poison pills.
 */

import type { FeatureStreamEvent } from "@/lib/storefront/theme-experiment-feature-stream-bus";
export type DurableStreamEntry = FeatureStreamEvent & {
  eventId: string;
  ingestedAt: string;
};

export type FeatureStreamDlqEntry = {
  eventId: string;
  at: string;
  reason: string;
  payload: unknown;
};

export type FeatureStreamSlo = {
  at: string;
  ingestLagMsP99: number;
  eventsLastHour: number;
  dedupeHits: number;
  dlqCount: number;
  targetLagMsP99: number;
  sloMet: boolean;
};

export type FeatureStreamDurableLog = {
  at: string;
  entries: DurableStreamEntry[];
  seenEventIds: Record<string, string>;
  dlq: FeatureStreamDlqEntry[];
  slo: FeatureStreamSlo;
};

const DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 2000;
const MAX_DLQ = 100;

export function isDurableFeatureStreamEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_FEATURE_STREAM_DURABLE === "1";
}

export function featureStreamSloTargetMs(): number {
  return Number(process.env.THEME_EXPERIMENT_FEATURE_STREAM_SLO_MS ?? "2000");
}

export function readFeatureStreamDurableLog(raw: unknown): FeatureStreamDurableLog | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).featureStreamDurableLog;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const log = o as Record<string, unknown>;
  if (!Array.isArray(log.entries)) return null;
  return {
    at: typeof log.at === "string" ? log.at : new Date().toISOString(),
    entries: log.entries as DurableStreamEntry[],
    seenEventIds:
      log.seenEventIds && typeof log.seenEventIds === "object" && !Array.isArray(log.seenEventIds)
        ? (log.seenEventIds as Record<string, string>)
        : {},
    dlq: Array.isArray(log.dlq) ? (log.dlq as FeatureStreamDlqEntry[]) : [],
    slo: (log.slo as FeatureStreamSlo) ?? defaultSlo(),
  };
}

function defaultSlo(): FeatureStreamSlo {
  return {
    at: new Date().toISOString(),
    ingestLagMsP99: 0,
    eventsLastHour: 0,
    dedupeHits: 0,
    dlqCount: 0,
    targetLagMsP99: featureStreamSloTargetMs(),
    sloMet: true,
  };
}

function pruneSeenIds(seen: Record<string, string>): Record<string, string> {
  const cutoff = Date.now() - DEDUPE_TTL_MS;
  const out: Record<string, string> = {};
  for (const [id, at] of Object.entries(seen)) {
    if (new Date(at).getTime() >= cutoff) out[id] = at;
  }
  return out;
}

function computeLagP99(entries: DurableStreamEntry[]): number {
  if (entries.length === 0) return 0;
  const lags = entries
    .slice(-200)
    .map((e) => Math.max(0, new Date(e.ingestedAt).getTime() - new Date(e.at).getTime()))
    .sort((a, b) => a - b);
  const idx = Math.min(lags.length - 1, Math.floor(lags.length * 0.99));
  return lags[idx] ?? 0;
}

export type IngestResult =
  | { ok: true; duplicate: boolean; log: FeatureStreamDurableLog }
  | { ok: false; dlq: true; reason: string; log: FeatureStreamDurableLog };

/** Exactly-once ingest by eventId (24h dedupe window). */
export function ingestDurableFeatureStreamEvent(input: {
  previousRaw: unknown;
  eventId: string;
  event: Omit<FeatureStreamEvent, "at"> & { at?: string };
  sourceTimestamp?: string;
}): IngestResult {
  const now = new Date().toISOString();
  const prev = readFeatureStreamDurableLog(input.previousRaw) ?? {
    at: now,
    entries: [],
    seenEventIds: {},
    dlq: [],
    slo: defaultSlo(),
  };

  if (!input.eventId?.trim()) {
    const dlq = [
      ...prev.dlq,
      { eventId: "unknown", at: now, reason: "missing_event_id", payload: input.event },
    ].slice(-MAX_DLQ);
    const log: FeatureStreamDurableLog = { ...prev, at: now, dlq, slo: { ...prev.slo, dlqCount: dlq.length } };
    return { ok: false, dlq: true, reason: "missing_event_id", log };
  }

  const seen = pruneSeenIds(prev.seenEventIds);
  if (seen[input.eventId]) {
    const log: FeatureStreamDurableLog = {
      ...prev,
      at: now,
      seenEventIds: seen,
      slo: { ...prev.slo, dedupeHits: prev.slo.dedupeHits + 1, at: now },
    };
    return { ok: true, duplicate: true, log };
  }

  const eventAt = input.sourceTimestamp ?? input.event.at ?? now;
  const entry: DurableStreamEntry = {
    eventId: input.eventId,
    ingestedAt: now,
    at: eventAt,
    visitorId: input.event.visitorId,
    sessionId: input.event.sessionId,
    segment: input.event.segment,
    geo: input.event.geo,
    device: input.event.device,
    cartValueCents: input.event.cartValueCents,
  };

  const entries = [...prev.entries, entry].slice(-MAX_ENTRIES);
  seen[input.eventId] = now;

  const hourAgo = Date.now() - 60 * 60 * 1000;
  const eventsLastHour = entries.filter((e) => new Date(e.ingestedAt).getTime() >= hourAgo).length;
  const ingestLagMsP99 = computeLagP99(entries);
  const targetLagMsP99 = featureStreamSloTargetMs();

  const log: FeatureStreamDurableLog = {
    at: now,
    entries,
    seenEventIds: seen,
    dlq: prev.dlq,
    slo: {
      at: now,
      ingestLagMsP99,
      eventsLastHour,
      dedupeHits: prev.slo.dedupeHits,
      dlqCount: prev.dlq.length,
      targetLagMsP99,
      sloMet: ingestLagMsP99 <= targetLagMsP99,
    },
  };

  return { ok: true, duplicate: false, log };
}

export function pushToFeatureStreamDlq(
  log: FeatureStreamDurableLog,
  entry: FeatureStreamDlqEntry,
): FeatureStreamDurableLog {
  const dlq = [...log.dlq, entry].slice(-MAX_DLQ);
  return {
    ...log,
    dlq,
    slo: { ...log.slo, dlqCount: dlq.length, at: new Date().toISOString() },
  };
}

export function writeDurableLogToJson(
  previousRaw: unknown,
  log: FeatureStreamDurableLog,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.featureStreamDurableLog = log;
  return base;
}
