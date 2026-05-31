"use client";

import { useCallback, useEffect, useState } from "react";

import type { OfflineSyncState } from "@/lib/pos/offline-sync";
import {
  countOfflinePosConflicts,
  listOfflinePosCheckouts,
  offlinePosQueueSize,
} from "@/lib/pos/offline-pos-queue";

export type OfflineSyncStatus = {
  online: boolean;
  queuedCount: number;
  conflictCount: number;
  syncState: OfflineSyncState;
  refresh: () => Promise<void>;
};

export function useOfflineSyncStatus(): OfflineSyncStatus {
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [queuedCount, setQueuedCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [syncState, setSyncState] = useState<OfflineSyncState>("idle");

  const refresh = useCallback(async () => {
    const [queued, conflicts] = await Promise.all([
      offlinePosQueueSize(),
      countOfflinePosConflicts(),
    ]);
    setQueuedCount(queued);
    setConflictCount(conflicts);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    void refresh();

    const onOnline = () => {
      setOnline(true);
      void refresh();
    };
    const onOffline = () => setOnline(false);
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ syncState?: OfflineSyncState }>).detail;
      if (detail?.syncState) setSyncState(detail.syncState);
      void refresh();
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("kitchenos:offline-sync", onSync);
    const interval = window.setInterval(() => void refresh(), 8000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("kitchenos:offline-sync", onSync);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return { online, queuedCount, conflictCount, syncState, refresh };
}

export function broadcastOfflineSyncState(syncState: OfflineSyncState): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("kitchenos:offline-sync", { detail: { syncState } }));
}

export async function offlineSyncSummary(): Promise<{
  queuedCount: number;
  conflictCount: number;
  conflicts: Awaited<ReturnType<typeof listOfflinePosCheckouts>>;
}> {
  const rows = await listOfflinePosCheckouts();
  const conflicts = rows.filter((row) => row.syncStatus === "conflict");
  return {
    queuedCount: rows.filter((row) => row.syncStatus !== "synced").length,
    conflictCount: conflicts.length,
    conflicts,
  };
}
