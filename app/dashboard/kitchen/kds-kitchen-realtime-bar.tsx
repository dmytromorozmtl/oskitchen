"use client";

import { KdsRealtimeStatusBadge } from "@/components/kitchen/kds-realtime-status-badge";
import { cn } from "@/lib/utils";
import type { KdsRealtimeTransport } from "@/services/kds-websocket";

type KdsKitchenRealtimeBarProps = {
  isLive: boolean;
  transport: KdsRealtimeTransport;
  connectionLabel: string;
  reconnectAttempt?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  className?: string;
};

/**
 * Sticky realtime transport bar for `/dashboard/kitchen` — LIVE/POLLING badge,
 * connection detail, and sound toggle.
 */
export function KdsKitchenRealtimeBar({
  isLive,
  transport,
  connectionLabel,
  reconnectAttempt = 0,
  soundEnabled,
  onToggleSound,
  className,
}: KdsKitchenRealtimeBarProps) {
  return (
    <div
      data-testid="kds-kitchen-realtime-bar"
      className={cn(
        "sticky top-0 z-20 -mx-4 mb-4 border-b border-border/80 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <KdsRealtimeStatusBadge
          isLive={isLive}
          transport={transport}
          reconnectAttempt={reconnectAttempt}
        />
        <span className="text-xs text-muted-foreground">{connectionLabel}</span>
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? "Disable kitchen sound alerts" : "Enable kitchen sound alerts"}
          className={cn(
            "ml-auto min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            soundEnabled
              ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
        </button>
      </div>
    </div>
  );
}
