"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";
import {
  buildOfflineModeUiState,
  formatOfflineModeQueueBadgeCount,
  offlineModeQueueBadgeToneClass,
  offlineModeSyncAnimationClass,
} from "@/lib/pos/offline-mode-ui-indicator-data";
import {
  OFFLINE_MODE_UI_POS_ROUTE,
  OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID,
  OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID,
} from "@/lib/pos/offline-mode-ui-indicator-policy";
import { cn } from "@/lib/utils";

type OfflineModeQueueBadgeProps = {
  className?: string;
  posHref?: string;
  compact?: boolean;
};

export function OfflineModeQueueBadge({
  className,
  posHref = OFFLINE_MODE_UI_POS_ROUTE,
  compact = false,
}: OfflineModeQueueBadgeProps) {
  const { online, queuedCount, conflictCount, syncState } = useOfflineSyncStatus();
  const ui = buildOfflineModeUiState({ online, queuedCount, conflictCount, syncState });

  if (!ui.showQueueBadge && ui.severity === "idle") return null;

  const badgeLabel = formatOfflineModeQueueBadgeCount(ui.queueBadgeCount);
  const tone = offlineModeQueueBadgeToneClass(ui.severity);

  return (
    <Link
      href={posHref}
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-opacity hover:opacity-90",
        tone,
        compact ? "min-h-9 min-w-9 justify-center px-2" : "",
        className,
      )}
      aria-label={ui.queueBadgeAriaLabel}
      data-testid={OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID}
    >
      {ui.showSyncAnimation ? (
        <RefreshCw
          className={offlineModeSyncAnimationClass(ui.severity)}
          aria-hidden
          data-testid={OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID}
        />
      ) : conflictCount > 0 ? (
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <WifiOff className="h-3.5 w-3.5" aria-hidden />
      )}
      {!compact ? (
        <span>{badgeLabel === "·" ? "Offline" : badgeLabel}</span>
      ) : badgeLabel !== "·" ? (
        <span className="sr-only">{ui.queueBadgeAriaLabel}</span>
      ) : null}
      {compact && badgeLabel !== "·" ? (
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-background px-1 text-[10px] font-bold text-foreground shadow"
          aria-hidden
        >
          {badgeLabel}
        </span>
      ) : null}
    </Link>
  );
}

export function OfflineModeSyncPulse({
  className,
  severity,
}: {
  className?: string;
  severity: ReturnType<typeof buildOfflineModeUiState>["severity"];
}) {
  return (
    <span
      className={cn("relative inline-flex", className)}
      data-testid={OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID}
      aria-hidden
    >
      <RefreshCw className={offlineModeSyncAnimationClass(severity)} />
      <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-sky-400/30 dark:bg-sky-300/20" />
    </span>
  );
}
