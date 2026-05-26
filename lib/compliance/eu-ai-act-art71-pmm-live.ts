/**
 * AG2 — EU AI Act Art. 71 post-market monitoring live feed (AD2 registry + AF2 NIST stream).
 */

import { createHash } from "node:crypto";
import {
  isEuAiActLiveRegistryEnabled,
  readEuAiActLiveRegistry,
} from "@/lib/compliance/eu-ai-act-live-registry";
import {
  isNistAiRmfLiveControlFeedEnabled,
  readNistAiRmfLiveControlFeed,
} from "@/lib/compliance/nist-ai-rmf-live-control-feed";

export type PmmIncidentSeverity = "informational" | "moderate" | "serious";

export type EuAiActArt71PmmEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  incidentId: string;
  severity: PmmIncidentSeverity;
  status: "open" | "investigating" | "resolved";
  article: "Article-71";
  modelDeploymentId: string;
  payloadHash: string;
  syncedToPmmFeed: boolean;
};

export type EuAiActArt71PmmLiveSnapshot = {
  at: string;
  events: EuAiActArt71PmmEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  pmmFeedReady: boolean;
  openSeriousIncidents: number;
  publishBlockedByPmm: boolean;
  kafkaRelayed: boolean;
};

export function isEuAiActArt71PmmLiveEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EU_AI_ACT_ART71_PMM_LIVE === "1";
}

export function euPmmStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_EU_PMM_STREAM_MAX_LAG_MS ?? "3600000");
}

function hashPmmEvent(input: {
  incidentId: string;
  severity: string;
  status: string;
}): string {
  return createHash("sha256")
    .update(`eu-pmm:${input.incidentId}:${input.severity}:${input.status}`)
    .digest("hex");
}

export function readEuAiActArt71PmmLive(raw: unknown): EuAiActArt71PmmLiveSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).euAiActArt71PmmLive;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as EuAiActArt71PmmEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    pmmFeedReady: s.pmmFeedReady === true,
    openSeriousIncidents: typeof s.openSeriousIncidents === "number" ? s.openSeriousIncidents : 0,
    publishBlockedByPmm: s.publishBlockedByPmm === true,
    kafkaRelayed: s.kafkaRelayed === true,
  };
}

export function mergeEuAiActArt71PmmLive(
  previousRaw: unknown,
  snap: EuAiActArt71PmmLiveSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.euAiActArt71PmmLive = snap;
  return base;
}

function buildPmmSnapshot(events: EuAiActArt71PmmEvent[], kafkaRelayed: boolean): EuAiActArt71PmmLiveSnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const openSeriousIncidents = events.filter(
    (e) => e.severity === "serious" && (e.status === "open" || e.status === "investigating"),
  ).length;
  const publishBlockedByPmm = openSeriousIncidents > 0;
  const pmmFeedReady =
    last !== null &&
    streamLagMs <= euPmmStreamMaxLagMs() &&
    last.syncedToPmmFeed &&
    !publishBlockedByPmm;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    pmmFeedReady,
    openSeriousIncidents,
    publishBlockedByPmm,
    kafkaRelayed,
  };
}

export function ingestEuAiActArt71PmmEvent(
  previousRaw: unknown,
  event: Omit<EuAiActArt71PmmEvent, "at" | "payloadHash" | "eventId" | "article"> & {
    at?: string;
    eventId?: string;
  },
): { json: Record<string, unknown>; snap: EuAiActArt71PmmLiveSnapshot } {
  const entry: EuAiActArt71PmmEvent = {
    eventId: event.eventId ?? `pmm-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    incidentId: event.incidentId,
    severity: event.severity,
    status: event.status,
    article: "Article-71",
    modelDeploymentId: event.modelDeploymentId,
    payloadHash: hashPmmEvent(event),
    syncedToPmmFeed: event.syncedToPmmFeed,
  };

  const prev = readEuAiActArt71PmmLive(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-200);
  const snap = buildPmmSnapshot(events, prev?.kafkaRelayed ?? false);
  return { json: mergeEuAiActArt71PmmLive(previousRaw, snap), snap };
}

export function pollEuAiActArt71PmmFeed(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: EuAiActArt71PmmLiveSnapshot;
} {
  const seq = (readEuAiActArt71PmmLive(previousRaw)?.events.length ?? 0) + 1;
  return ingestEuAiActArt71PmmEvent(previousRaw, {
    source: "poll",
    incidentId: `pmm-inc-${seq}`,
    severity: "informational",
    status: "resolved",
    modelDeploymentId: `deploy-${seq}`,
    syncedToPmmFeed: true,
  });
}

export function evaluateEuAiActArt71PmmLiveGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isEuAiActArt71PmmLiveEnabled()) {
    return { passed: true, headline: "EU Art. 71 PMM live off", detail: "" };
  }
  if (!isEuAiActLiveRegistryEnabled()) {
    return {
      passed: false,
      headline: "EU AI Act live registry required",
      detail: "Enable THEME_EXPERIMENT_EU_AI_ACT_LIVE_REGISTRY=1 (AD2).",
    };
  }
  if (isNistAiRmfLiveControlFeedEnabled() && !readNistAiRmfLiveControlFeed(raw)?.liveControlFeedReady) {
    return {
      passed: false,
      headline: "NIST RMF live stream alignment required",
      detail: "AF2 NIST control feed should be fresh for cross-border PMM.",
    };
  }
  const registry = readEuAiActLiveRegistry(raw);
  if (!registry?.liveRegistryReady) {
    return {
      passed: false,
      headline: "EU live registry not ready",
      detail: "Complete AD2 registry stream before Art. 71 PMM.",
    };
  }
  const snap = readEuAiActArt71PmmLive(raw);
  if (snap?.publishBlockedByPmm) {
    return {
      passed: false,
      headline: "Serious PMM incident open",
      detail: `${snap.openSeriousIncidents} serious incident(s) block publish until resolved.`,
    };
  }
  if (!snap?.pmmFeedReady) {
    return {
      passed: false,
      headline: "Art. 71 PMM feed not fresh",
      detail: "Await post-market monitoring event within lag window.",
    };
  }
  return {
    passed: true,
    headline: "EU Art. 71 PMM live feed OK",
    detail: `Last ${snap.lastEventAt ?? "—"} · no serious incidents`,
  };
}
