"use client";

import { KdsRealtimeConnectionBar } from "@/components/kitchen/kds-realtime-connection-bar";
import { KdsRealtimeStatusBadge } from "@/components/kitchen/kds-realtime-status-badge";
import { cn } from "@/lib/utils";
import {
  formatKdsElapsedClock,
  type KdsQueueSummary,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import type { KdsRealtimeSloSnapshot } from "@/lib/kitchen/kds-realtime-slo-metrics";
import type { KdsRealtimeTransport } from "@/services/kds-websocket";

type KdsQueueStatusStripProps = {
  summary: KdsQueueSummary;
  realtimeConnected: boolean;
  connectionLabel: string;
  transport?: KdsRealtimeTransport;
  reconnectAttempt?: number;
  slo?: KdsRealtimeSloSnapshot;
  /** When false, parent renders sticky connection bar (kitchen daily shell). */
  showConnectionBar?: boolean;
};

export function KdsQueueStatusStrip({
  summary,
  realtimeConnected,
  connectionLabel,
  transport = "polling",
  reconnectAttempt = 0,
  slo,
  showConnectionBar = true,
}: KdsQueueStatusStripProps) {
  return (
    <div className="space-y-2" data-testid="kds-queue-status-strip">
      {showConnectionBar ? (
        <KdsRealtimeConnectionBar
          variant="inline"
          isLive={realtimeConnected}
          transport={transport}
          connectionLabel={connectionLabel}
          reconnectAttempt={reconnectAttempt}
          slo={slo}
          className="shadow-none"
        />
      ) : null}
      <div
        className="rounded-xl border border-border/80 bg-card/80 p-3 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {!showConnectionBar ? (
            <KdsRealtimeStatusBadge
              isLive={realtimeConnected}
              transport={transport}
              reconnectAttempt={reconnectAttempt}
              size="sm"
            />
          ) : null}
        <StatPill label="Active" value={summary.total} tone="neutral" />
        <StatPill label="Prep" value={summary.preparing} tone="prep" />
        <StatPill label="Ready" value={summary.ready} tone="ready" />
        {summary.overdue > 0 ? (
          <StatPill label="Overdue" value={summary.overdue} tone="overdue" />
        ) : null}
        {summary.oldestPrepSeconds !== null ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            Oldest prep {formatKdsElapsedClock(summary.oldestPrepSeconds)}
          </span>
        ) : null}
        {!showConnectionBar ? (
          <span
            className={cn(
              "ml-auto text-xs",
              realtimeConnected ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground",
            )}
          >
            {connectionLabel}
          </span>
        ) : null}
      </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "prep" | "ready" | "overdue";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        tone === "neutral" && "bg-muted text-foreground",
        tone === "prep" && "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
        tone === "ready" && "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
        tone === "overdue" && "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
      )}
    >
      {label}
      <span>{value}</span>
    </span>
  );
}
