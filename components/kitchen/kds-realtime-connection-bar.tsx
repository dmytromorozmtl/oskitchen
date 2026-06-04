"use client";

import { KdsRealtimeStatusBadge } from "@/components/kitchen/kds-realtime-status-badge";
import {
  buildKdsConnectionBarSnapshot,
  KDS_CONNECTION_BAR_TOUCH_CLASS,
  KDS_REALTIME_CONNECTION_BAR_TEST_ID,
  kdsConnectionBarSoundToggleClass,
  kdsConnectionBarSurfaceClass,
} from "@/lib/kitchen/kds-realtime-connection-bar-policy";
import type { KdsRealtimeSloSnapshot } from "@/lib/kitchen/kds-realtime-slo-metrics";
import { cn } from "@/lib/utils";
import type { KdsRealtimeTransport } from "@/services/kds-websocket";

export type KdsRealtimeConnectionBarProps = {
  isLive: boolean;
  transport: KdsRealtimeTransport;
  connectionLabel: string;
  reconnectAttempt?: number;
  /** Rolling refresh-handler latency from `useKdsRealtime`. */
  slo?: KdsRealtimeSloSnapshot;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  /** Sticky top bar (kitchen page) vs inline strip (daily service). */
  variant?: "sticky" | "inline";
  testId?: string;
  className?: string;
};

/**
 * DES-15 — operator-visible KDS Realtime connection bar.
 * Shows LIVE/POLLING transport, poll interval, reconnect attempts, and optional SLO.
 */
export function KdsRealtimeConnectionBar({
  isLive,
  transport,
  connectionLabel,
  reconnectAttempt = 0,
  slo,
  soundEnabled,
  onToggleSound,
  variant = "sticky",
  testId = KDS_REALTIME_CONNECTION_BAR_TEST_ID,
  className,
}: KdsRealtimeConnectionBarProps) {
  const snapshot = buildKdsConnectionBarSnapshot({
    isLive,
    transport,
    connectionLabel,
    reconnectAttempt,
    slo,
  });

  const pollSeconds = Math.round(snapshot.pollIntervalMs / 1000);

  return (
    <div
      data-testid={testId}
      data-variant={variant}
      data-mode={isLive ? "live" : "polling"}
      className={cn(
        "rounded-xl border px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80",
        kdsConnectionBarSurfaceClass(isLive),
        variant === "sticky" &&
          "sticky top-0 z-sticky-header -mx-4 mb-4 border-b border-border/80 bg-background/95 md:-mx-6 md:px-6",
        variant === "inline" && "mb-0",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <KdsRealtimeStatusBadge
          isLive={isLive}
          transport={transport}
          reconnectAttempt={reconnectAttempt}
        />
        <span className="text-xs font-medium text-foreground">{connectionLabel}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {isLive ? `${pollSeconds}s safety net` : `${pollSeconds}s poll`}
        </span>
        {snapshot.reconnectDetail ? (
          <span className="text-xs font-medium text-amber-800 dark:text-amber-200 tabular-nums">
            {snapshot.reconnectDetail}
          </span>
        ) : null}
        {snapshot.sloLine ? (
          <span
            className="text-xs text-muted-foreground tabular-nums"
            data-testid="kds-connection-bar-slo"
            title="Rolling refresh-handler latency — not rush-hour certified"
          >
            {snapshot.sloLine}
          </span>
        ) : null}
        {onToggleSound != null && soundEnabled != null ? (
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Disable kitchen sound alerts" : "Enable kitchen sound alerts"}
            data-testid="kds-connection-bar-sound-toggle"
            className={cn(
              "ml-auto rounded-full border px-3 text-xs font-medium transition-colors",
              KDS_CONNECTION_BAR_TOUCH_CLASS,
              kdsConnectionBarSoundToggleClass(soundEnabled),
            )}
          >
            {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
