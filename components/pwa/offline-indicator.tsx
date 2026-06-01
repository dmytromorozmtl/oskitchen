"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";
import { offlineSyncStatusLabel } from "@/lib/pos/offline-sync";
import { Button } from "@/components/ui/button";

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

  const needsAttention = !online || queuedCount > 0 || conflictCount > 0 || syncState === "syncing";
  if (!needsAttention || dismissed) return null;

  const label = offlineSyncStatusLabel({ online, queuedCount, conflictCount, syncState });

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex max-w-sm flex-col gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-950 shadow-lg dark:bg-amber-950 dark:text-amber-100"
      data-testid="global-offline-indicator"
    >
      <div className="flex items-start gap-2">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full text-amber-950 hover:bg-amber-200/80 dark:text-amber-100 dark:hover:bg-amber-900"
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
