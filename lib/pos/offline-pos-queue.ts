/**
 * Client-side offline POS checkout queue (IndexedDB).
 * Queued sales replay via `posCheckoutAction` when connectivity returns.
 */

import { registerOfflinePosAutoSync } from "@/lib/pos/offline-pos-auto-sync";

export const OFFLINE_POS_INDEXED_DB_NAME = "kitchenos-offline-pos" as const;
export const OFFLINE_POS_INDEXED_DB_STORE = "checkout_queue" as const;

const DB_NAME = OFFLINE_POS_INDEXED_DB_NAME;
const STORE = OFFLINE_POS_INDEXED_DB_STORE;
const DB_VERSION = 2;

export type OfflinePosSyncStatus = "queued" | "syncing" | "conflict" | "failed";

export type OfflinePosCheckoutPayload = {
  id: string;
  createdAt: string;
  payload: Record<string, unknown>;
  syncStatus?: OfflinePosSyncStatus;
  syncError?: string;
  conflictReason?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

export async function enqueueOfflinePosCheckout(payload: Record<string, unknown>): Promise<string> {
  const id = crypto.randomUUID();
  const entry: OfflinePosCheckoutPayload = {
    id,
    createdAt: new Date().toISOString(),
    payload: { ...payload, offlineSaleId: id },
    syncStatus: "queued",
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return id;
}

export async function listOfflinePosCheckouts(): Promise<OfflinePosCheckoutPayload[]> {
  const db = await openDb();
  const rows = await new Promise<OfflinePosCheckoutPayload[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as OfflinePosCheckoutPayload[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeOfflinePosCheckout(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function offlinePosQueueSize(): Promise<number> {
  const rows = await listOfflinePosCheckouts();
  return rows.length;
}

export async function countOfflinePosConflicts(): Promise<number> {
  const rows = await listOfflinePosCheckouts();
  return rows.filter((row) => row.syncStatus === "conflict").length;
}

export async function updateOfflinePosCheckout(
  id: string,
  patch: Partial<Pick<OfflinePosCheckoutPayload, "syncStatus" | "syncError" | "conflictReason">>,
): Promise<void> {
  const db = await openDb();
  const existing = await new Promise<OfflinePosCheckoutPayload | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as OfflinePosCheckoutPayload | undefined);
    req.onerror = () => reject(req.error);
  });
  if (!existing) {
    db.close();
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...existing, ...patch });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function registerOfflinePosBackgroundSync(
  autoSyncHandlers?: Parameters<typeof registerOfflinePosAutoSync>[0],
): () => void {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    void navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage({ type: "REGISTER_OFFLINE_POS_SYNC" }))
      .catch(() => undefined);
  }

  if (!autoSyncHandlers) {
    return () => undefined;
  }

  return registerOfflinePosAutoSync(autoSyncHandlers);
}
