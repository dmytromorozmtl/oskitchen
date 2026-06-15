/**
 * Auto-sync coordinator — replays IndexedDB queues when connectivity returns.
 */

export const OFFLINE_POS_AUTO_SYNC_INTERVAL_MS = 60_000 as const;

export type OfflinePosAutoSyncResult = {
  checkoutSynced: number;
  checkoutFailed: number;
  cardCaptured: number;
  cardFailed: number;
};

export type OfflinePosAutoSyncHandlers = {
  flushCheckoutQueue: () => Promise<Pick<OfflinePosAutoSyncResult, "checkoutSynced" | "checkoutFailed">>;
  flushCardQueue: () => Promise<Pick<OfflinePosAutoSyncResult, "cardCaptured" | "cardFailed">>;
};

let autoSyncRunning = false;

export async function runOfflinePosAutoSync(
  handlers: OfflinePosAutoSyncHandlers,
  options?: { force?: boolean },
): Promise<OfflinePosAutoSyncResult | null> {
  if (!options?.force && typeof navigator !== "undefined" && !navigator.onLine) return null;
  if (autoSyncRunning) return null;

  autoSyncRunning = true;
  try {
    const checkout = await handlers.flushCheckoutQueue();
    const card = await handlers.flushCardQueue();
    return {
      checkoutSynced: checkout.checkoutSynced,
      checkoutFailed: checkout.checkoutFailed,
      cardCaptured: card.cardCaptured,
      cardFailed: card.cardFailed,
    };
  } finally {
    autoSyncRunning = false;
  }
}

export function registerOfflinePosAutoSync(handlers: OfflinePosAutoSyncHandlers): () => void {
  if (typeof window === "undefined") return () => undefined;

  const run = () => {
    void runOfflinePosAutoSync(handlers);
  };

  window.addEventListener("online", run);
  const interval = window.setInterval(run, OFFLINE_POS_AUTO_SYNC_INTERVAL_MS);
  run();

  return () => {
    window.removeEventListener("online", run);
    window.clearInterval(interval);
  };
}
