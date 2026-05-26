/**
 * AD2 — EU AI Act live registry streaming: webhook/SSE deltas → continuous conformity refresh (AA4).
 */

import { createHash } from "node:crypto";
import {
  isEuAiOfficeContinuousConformityEnabled,
  readEuAiOfficeContinuousConformity,
  recordConformityDelta,
} from "@/lib/compliance/eu-ai-office-continuous-conformity";
import { isEuAiOfficeNotifiedBodyEnabled } from "@/lib/compliance/eu-ai-office-notified-body";

export type EuRegistryStreamEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  article: "Article-43";
  assessmentId: string;
  conformityStatus: string;
  certBodyCrossRef: string | null;
  registrySequence: number;
  payloadHash: string;
};

export type EuAiActLiveRegistrySnapshot = {
  at: string;
  events: EuRegistryStreamEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  liveRegistryReady: boolean;
  kafkaRelayed: boolean;
};

export function isEuAiActLiveRegistryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EU_AI_ACT_LIVE_REGISTRY === "1";
}

export function euRegistryStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_EU_REGISTRY_STREAM_MAX_LAG_MS ?? "3600000");
}

function hashRegistryEvent(input: {
  assessmentId: string;
  conformityStatus: string;
  registrySequence: number;
}): string {
  return createHash("sha256")
    .update(`eu-registry:${input.assessmentId}:${input.conformityStatus}:${input.registrySequence}`)
    .digest("hex");
}

export function readEuAiActLiveRegistry(raw: unknown): EuAiActLiveRegistrySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).euAiActLiveRegistry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as EuRegistryStreamEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    liveRegistryReady: s.liveRegistryReady === true,
    kafkaRelayed: s.kafkaRelayed === true,
  };
}

export function mergeEuAiActLiveRegistry(
  previousRaw: unknown,
  snap: EuAiActLiveRegistrySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.euAiActLiveRegistry = snap;
  return base;
}

/** Ingest a registry stream event and refresh AA4 continuous conformity pack. */
export function ingestEuRegistryStreamEvent(
  previousRaw: unknown,
  event: Omit<EuRegistryStreamEvent, "at" | "payloadHash" | "eventId" | "article"> & {
    at?: string;
    eventId?: string;
  },
): {
  json: Record<string, unknown>;
  snap: EuAiActLiveRegistrySnapshot;
  continuousUpdated: boolean;
} {
  const at = event.at ?? new Date().toISOString();
  const entry: EuRegistryStreamEvent = {
    eventId: event.eventId ?? `eu-stream-${Date.now()}`,
    at,
    source: event.source,
    article: "Article-43",
    assessmentId: event.assessmentId,
    conformityStatus: event.conformityStatus,
    certBodyCrossRef: event.certBodyCrossRef,
    registrySequence: event.registrySequence,
    payloadHash: hashRegistryEvent(event),
  };

  const prev = readEuAiActLiveRegistry(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-200);
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const liveRegistryReady =
    last !== null &&
    streamLagMs <= euRegistryStreamMaxLagMs() &&
    (last.conformityStatus === "conformity" || last.conformityStatus === "conditional");

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  let continuousUpdated = false;
  if (isEuAiOfficeContinuousConformityEnabled()) {
    const prevCont = readEuAiOfficeContinuousConformity(json);
    const { json: merged } = recordConformityDelta(json, {
      previousStatus: prevCont?.deltas[prevCont.deltas.length - 1]?.newStatus ?? null,
      newStatus: entry.conformityStatus,
      certBodyCrossRef: entry.certBodyCrossRef,
      syncedToEuDatabase: true,
    });
    json = merged;
    continuousUpdated = true;
  }

  const snap: EuAiActLiveRegistrySnapshot = {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    liveRegistryReady,
    kafkaRelayed: prev?.kafkaRelayed ?? false,
  };

  return { json: mergeEuAiActLiveRegistry(json, snap), snap, continuousUpdated };
}

/** Simulated poll from EU registry (production: replace with SSE client). */
export function pollEuRegistryStream(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: EuAiActLiveRegistrySnapshot | null;
} {
  const seq = (readEuAiActLiveRegistry(previousRaw)?.events.length ?? 0) + 1;
  const { json, snap } = ingestEuRegistryStreamEvent(previousRaw, {
    source: "poll",
    assessmentId: process.env.EU_AI_OFFICE_ASSESSMENT_ID ?? `eu-assess-${seq}`,
    conformityStatus: seq % 3 === 0 ? "conditional" : "conformity",
    certBodyCrossRef: process.env.EU_AI_OFFICE_NOTIFIED_BODY_ID ?? "nb-eu",
    registrySequence: seq,
  });
  return { json, snap };
}

export function evaluateEuAiActLiveRegistryGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isEuAiActLiveRegistryEnabled()) {
    return { passed: true, headline: "EU AI Act live registry off", detail: "" };
  }
  if (!isEuAiOfficeContinuousConformityEnabled()) {
    return {
      passed: false,
      headline: "EU continuous conformity required",
      detail: "Enable THEME_EXPERIMENT_EU_AI_OFFICE_CONTINUOUS_CONFORMITY=1 (AA4).",
    };
  }
  if (!isEuAiOfficeNotifiedBodyEnabled()) {
    return {
      passed: false,
      headline: "EU notified body pack required",
      detail: "Enable THEME_EXPERIMENT_EU_AI_OFFICE_NOTIFIED_BODY=1 (Z4).",
    };
  }
  const snap = readEuAiActLiveRegistry(raw);
  if (!snap?.liveRegistryReady) {
    return {
      passed: false,
      headline: "EU registry stream not fresh",
      detail: "Await live registry event within stream lag window.",
    };
  }
  const cont = readEuAiOfficeContinuousConformity(raw);
  if (!cont?.continuousConformityReady) {
    return {
      passed: false,
      headline: "Continuous conformity not synced from stream",
      detail: "Registry event must refresh AA4 conformity pack.",
    };
  }
  return {
    passed: true,
    headline: "EU live registry stream OK",
    detail: `Last event ${snap.lastEventAt ?? "—"} · lag ${snap.streamLagMs}ms`,
  };
}
