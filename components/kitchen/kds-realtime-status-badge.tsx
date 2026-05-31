"use client";

import { getKdsRealtimeStatusMeta } from "@/lib/kitchen/kds-realtime-ui";
import type { KdsRealtimeTransport } from "@/services/kds-websocket";
import { cn } from "@/lib/utils";

type KdsRealtimeStatusBadgeProps = {
  isLive: boolean;
  transport: KdsRealtimeTransport;
  reconnectAttempt?: number;
  size?: "sm" | "md";
  className?: string;
};

export function KdsRealtimeStatusBadge({
  isLive,
  transport,
  reconnectAttempt = 0,
  size = "md",
  className,
}: KdsRealtimeStatusBadgeProps) {
  const meta = getKdsRealtimeStatusMeta({ isLive, transport, reconnectAttempt });

  return (
    <span
      data-testid="kds-realtime-status-badge"
      data-mode={meta.mode}
      title={meta.detail}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        meta.badgeClass,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={`KDS transport ${meta.label}. ${meta.detail}`}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block rounded-full",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          meta.dotClass,
          meta.pulse && "motion-safe:animate-pulse",
        )}
      />
      {meta.label}
    </span>
  );
}
