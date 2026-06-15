/**
 * O2 — Real-time feature stream (Kafka/PubSub → webhook ingest).
 * LinUCB refresh every 60s; circuit breaker when regret > 3pp.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  assignArmLinUcb,
  buildLinUcbFeatureVector,
  readLinUcbSnapshot,
  type LinUcbFeatureVector,
  type LinUcbSnapshot,
} from "@/lib/storefront/theme-experiment-linucb";
import type { VisitorSegment } from "@/lib/storefront/theme-experiment-contextual-bandit";

export type FeatureStreamEvent = {
  at: string;
  visitorId: string;
  sessionId: string;
  segment: VisitorSegment;
  geo: string;
  device: LinUcbFeatureVector["device"];
  cartValueCents: number;
};

export type FeatureStreamBuffer = {
  at: string;
  events: FeatureStreamEvent[];
  regretPp: number;
  explorationCapped: boolean;
};

export function isFeatureStreamBusEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_FEATURE_STREAM_BUS === "1";
}

export function realtimeRegretCircuitBreakerPp(): number {
  return Number(process.env.THEME_EXPERIMENT_REALTIME_REGRET_PP ?? "3");
}

export function realtimeExplorationCapPercent(): number {
  return Math.min(10, Math.max(1, Number(process.env.THEME_EXPERIMENT_REALTIME_EXPLORATION_CAP ?? "10")));
}

export function readFeatureStreamBuffer(raw: unknown): FeatureStreamBuffer | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).featureStreamBuffer;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const b = o as Record<string, unknown>;
  if (typeof b.at !== "string" || !Array.isArray(b.events)) return null;
  return {
    at: b.at,
    events: b.events as FeatureStreamEvent[],
    regretPp: typeof b.regretPp === "number" ? b.regretPp : 0,
    explorationCapped: b.explorationCapped === true,
  };
}

export function appendFeatureStreamEvent(
  raw: unknown,
  event: FeatureStreamEvent,
  regretPp = 0,
): Record<string, unknown> {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  const prev = readFeatureStreamBuffer(raw);
  const events = [...(prev?.events ?? []), event].slice(-500);
  const explorationCapped = regretPp > realtimeRegretCircuitBreakerPp();
  base.featureStreamBuffer = {
    at: new Date().toISOString(),
    events,
    regretPp,
    explorationCapped,
  };
  return base;
}

/** Apply circuit breaker: cap exploration when regret exceeds threshold. */
export function applyLinUcbCircuitBreaker(snapshot: LinUcbSnapshot, regretPp: number): LinUcbSnapshot {
  if (regretPp <= realtimeRegretCircuitBreakerPp()) return snapshot;
  return {
    ...snapshot,
    explorationPercent: Math.min(snapshot.explorationPercent, realtimeExplorationCapPercent()),
    regretPp,
  };
}

export function previewArmFromStreamBuffer(input: {
  themeExperimentJson: unknown;
  visitorId: string;
  features: Omit<FeatureStreamEvent, "at" | "visitorId" | "sessionId">;
}): string | null {
  const snap = readLinUcbSnapshot(input.themeExperimentJson);
  const buf = readFeatureStreamBuffer(input.themeExperimentJson);
  if (!snap) return null;
  const adjusted = buf?.explorationCapped ? applyLinUcbCircuitBreaker(snap, buf.regretPp) : snap;
  const f = buildLinUcbFeatureVector({
    segment: input.features.segment,
    geo: input.features.geo,
    cartValueCents: input.features.cartValueCents,
  });
  return assignArmLinUcb({
    visitorId: input.visitorId,
    features: f,
    snapshot: adjusted,
    defaultWeights: { published: 50, draft: 50 },
  });
}
