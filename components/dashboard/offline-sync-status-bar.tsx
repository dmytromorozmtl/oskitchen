"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { OfflineModeSyncPulse } from "@/components/dashboard/offline-mode-ui-indicator";
import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";
import {
  buildOfflineModeUiState,
  formatOfflineModeQueueBadgeCount,
  offlineModeQueueBadgeToneClass,
  offlineModeStatusBarToneClass,
} from "@/lib/pos/offline-mode-ui-indicator-data";
import {
  OFFLINE_MODE_UI_POS_ROUTE,
  OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID,
  OFFLINE_MODE_UI_STATUS_BAR_TEST_ID,
} from "@/lib/pos/offline-mode-ui-indicator-policy";
import { offlineSyncStatusLabel } from "@/lib/pos/offline-sync";
import { cn } from "@/lib/utils";

type OfflineSyncStatusBarProps = {
  className?: string;
  showWhenIdle?: boolean;
  posHref?: string;
};

export function OfflineSyncStatusBar({
  className,
  showWhenIdle = false,
  posHref = OFFLINE_MODE_UI_POS_ROUTE,
}: OfflineSyncStatusBarProps) {
  const { online, queuedCount, conflictCount, syncState } = useOfflineSyncStatus();
  const label = offlineSyncStatusLabel({ online, queuedCount, conflictCount, syncState });
  const ui = buildOfflineModeUiState(
    { online, queuedCount, conflictCount, syncState },
    { showWhenIdle, statusLabel: label },
  );

  if (!ui.visible) return null;

  const badgeLabel = formatOfflineModeQueueBadgeCount(ui.queueBadgeCount);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
        offlineModeStatusBarToneClass(ui.severity),
        className,
      )}
      data-testid={OFFLINE_MODE_UI_STATUS_BAR_TEST_ID}
    >
      {ui.showSyncAnimation ? (
        <OfflineModeSyncPulse severity={ui.severity} />
      ) : conflictCount > 0 ? (
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      )}
      <span className="font-medium">{ui.statusLabel}</span>
      {ui.showQueueBadge ? (
        <Link
          href={posHref}
          className={cn(
            "inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-xs font-semibold",
            offlineModeQueueBadgeToneClass(ui.severity),
          )}
          aria-label={ui.queueBadgeAriaLabel}
          data-testid={OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID}
        >
          {badgeLabel === "·" ? "Offline" : `${badgeLabel} queued`}
        </Link>
      ) : null}
      {conflictCount > 0 || queuedCount > 0 ? (
        <Link href={posHref} className="text-xs underline underline-offset-2">
          Review in POS
        </Link>
      ) : null}
    </div>
  );
}
