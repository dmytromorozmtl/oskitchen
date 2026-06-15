import {
  getKdsPollIntervalMs,
  KDS_POLL_FALLBACK_MS,
  KDS_REALTIME_SMOKE_POLICY_ID,
} from "@/lib/kitchen/kds-realtime-smoke-policy";
import type { KdsRealtimeSloSnapshot } from "@/lib/kitchen/kds-realtime-slo-metrics";
import { posTouchCompactClass } from "@/lib/pos/touch-targets";
import type { KdsRealtimeTransport } from "@/services/kds-websocket";

/**
 * DES-15 — KDS realtime connection bar policy.
 *
 * Operator-visible transport honesty: LIVE vs polling, reconnect attempts,
 * optional rolling refresh-handler SLO (p50/p95/p99).
 *
 * @see components/kitchen/kds-realtime-connection-bar.tsx
 */

export const KDS_REALTIME_CONNECTION_BAR_POLICY_ID = "kds-realtime-connection-bar-des15-v1" as const;

export const KDS_REALTIME_CONNECTION_BAR_TEST_ID = "kds-realtime-connection-bar" as const;

export const KDS_REALTIME_CONNECTION_BAR_MODULE =
  "components/kitchen/kds-realtime-connection-bar.tsx" as const;

export const KDS_REALTIME_CONNECTION_BAR_CONSUMERS = [
  "app/dashboard/kitchen/kds-kitchen-daily-client.tsx",
  "components/kitchen/kds-daily-service.tsx",
] as const;

/** Minimum refresh samples before showing rolling SLO in the bar. */
export const KDS_CONNECTION_BAR_MIN_SLO_SAMPLES = 3 as const;

export function formatKdsPollIntervalLabel(realtimeSubscribed: boolean): string {
  const ms = getKdsPollIntervalMs(realtimeSubscribed);
  return `${Math.round(ms / 1000)}s poll`;
}

export function formatKdsReconnectDetail(reconnectAttempt: number, maxAttempts = 5): string | null {
  if (reconnectAttempt <= 0) return null;
  return `Reconnect ${reconnectAttempt}/${maxAttempts}`;
}

export function formatKdsRealtimeSloInline(slo: KdsRealtimeSloSnapshot): string | null {
  if (slo.sampleCount < KDS_CONNECTION_BAR_MIN_SLO_SAMPLES) return null;
  const parts: string[] = [];
  if (slo.p50Ms != null) {
    parts.push(`p50 ${slo.p50Ms}ms${slo.withinSlo?.p50 === false ? " ⚠" : ""}`);
  }
  if (slo.p95Ms != null) {
    parts.push(`p95 ${slo.p95Ms}ms${slo.withinSlo?.p95 === false ? " ⚠" : ""}`);
  }
  if (slo.p99Ms != null) {
    parts.push(`p99 ${slo.p99Ms}ms${slo.withinSlo?.p99 === false ? " ⚠" : ""}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

export function kdsConnectionBarSurfaceClass(isLive: boolean): string {
  return isLive
    ? "border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/30"
    : "border-amber-300/80 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/30";
}

export function kdsConnectionBarSoundToggleClass(soundEnabled: boolean): string {
  return soundEnabled
    ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "border-border bg-muted text-muted-foreground";
}

export const KDS_CONNECTION_BAR_TOUCH_CLASS = posTouchCompactClass;

export type KdsConnectionBarSnapshot = {
  isLive: boolean;
  transport: KdsRealtimeTransport;
  connectionLabel: string;
  reconnectAttempt: number;
  pollIntervalMs: number;
  sloLine: string | null;
  reconnectDetail: string | null;
};

export function buildKdsConnectionBarSnapshot(input: {
  isLive: boolean;
  transport: KdsRealtimeTransport;
  connectionLabel: string;
  reconnectAttempt?: number;
  slo?: KdsRealtimeSloSnapshot;
}): KdsConnectionBarSnapshot {
  return {
    isLive: input.isLive,
    transport: input.transport,
    connectionLabel: input.connectionLabel,
    reconnectAttempt: input.reconnectAttempt ?? 0,
    pollIntervalMs: getKdsPollIntervalMs(input.isLive),
    sloLine: input.slo ? formatKdsRealtimeSloInline(input.slo) : null,
    reconnectDetail: formatKdsReconnectDetail(input.reconnectAttempt ?? 0),
  };
}

export const KDS_CONNECTION_BAR_EXTENDS_POLICY = KDS_REALTIME_SMOKE_POLICY_ID;

export const KDS_CONNECTION_BAR_POLL_FALLBACK_MS = KDS_POLL_FALLBACK_MS;
