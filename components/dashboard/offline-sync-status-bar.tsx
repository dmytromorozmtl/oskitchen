"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";
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
  posHref = "/dashboard/pos/terminal",
}: OfflineSyncStatusBarProps) {
  const { online, queuedCount, conflictCount, syncState } = useOfflineSyncStatus();
  const label = offlineSyncStatusLabel({ online, queuedCount, conflictCount, syncState });
  const visible =
    showWhenIdle ||
    !online ||
    queuedCount > 0 ||
    conflictCount > 0 ||
    syncState === "syncing";

  if (!visible) return null;

  const tone =
    conflictCount > 0 || syncState === "error"
      ? "border-rose-300/70 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
      : !online || queuedCount > 0
        ? "border-amber-300/70 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
        : "border-emerald-300/70 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
        tone,
        className,
      )}
      data-testid="offline-sync-status"
    >
      {syncState === "syncing" ? (
        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
      ) : conflictCount > 0 ? (
        <AlertTriangle className="h-4 w-4" aria-hidden />
      ) : (
        <WifiOff className="h-4 w-4" aria-hidden />
      )}
      <span className="font-medium">{label}</span>
      {conflictCount > 0 || queuedCount > 0 ? (
        <Link href={posHref} className="text-xs underline underline-offset-2">
          Review in POS
        </Link>
      ) : null}
    </div>
  );
}
