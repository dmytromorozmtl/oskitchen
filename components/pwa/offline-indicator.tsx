"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";

import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";
import { offlineSyncStatusLabel } from "@/lib/pos/offline-sync";

export function OfflineIndicator() {
  const { online, queuedCount, conflictCount, syncState } = useOfflineSyncStatus();

  if (online && queuedCount === 0 && conflictCount === 0 && syncState === "idle") {
    return null;
  }

  const label = offlineSyncStatusLabel({ online, queuedCount, conflictCount, syncState });

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex max-w-sm flex-col gap-1 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-950 shadow-lg dark:bg-amber-950 dark:text-amber-100"
      data-testid="global-offline-indicator"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
        <span>{label}</span>
      </div>
      {conflictCount > 0 ? (
        <Link href="/dashboard/pos/terminal" className="text-xs underline underline-offset-2">
          Resolve conflicts in POS
        </Link>
      ) : null}
    </div>
  );
}
