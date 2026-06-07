"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  OfflineModeQueueBadge,
  OfflineModeSyncPulse,
} from "@/components/dashboard/offline-mode-ui-indicator";
import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";
import {
  buildOfflineModeUiState,
  offlineModeStatusBarToneClass,
} from "@/lib/pos/offline-mode-ui-indicator-data";
import { offlineSyncStatusLabel } from "@/lib/pos/offline-sync";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "kos-offline-indicator-dismissed";

export function OfflineIndicator() {
  const pathname = usePathname() ?? "";
  const dashboardContext =
    pathname.startsWith("/dashboard") || pathname.startsWith("/platform");
  const { online, queuedCount, conflictCount, syncState } = useOfflineSyncStatus();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!dashboardContext) return null;

  const label = offlineSyncStatusLabel({ online, queuedCount, conflictCount, syncState });
  const ui = buildOfflineModeUiState(
    { online, queuedCount, conflictCount, syncState },
    { statusLabel: label },
  );

  if (!ui.visible || dismissed) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-4 left-4 z-floating flex max-w-sm flex-col gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg",
        offlineModeStatusBarToneClass(ui.severity),
      )}
      data-testid="global-offline-indicator"
    >
      <div className="flex items-start gap-2">
        {ui.showSyncAnimation ? (
          <OfflineModeSyncPulse severity={ui.severity} className="mt-0.5" />
        ) : (
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        )}
        <span className="flex-1">{ui.statusLabel}</span>
        <OfflineModeQueueBadge compact className="shrink-0" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Dismiss offline notice"
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {conflictCount > 0 ? (
        <Link href="/dashboard/pos/terminal" className="text-xs underline underline-offset-2">
          Resolve conflicts in POS
        </Link>
      ) : null}
    </div>
  );
}
