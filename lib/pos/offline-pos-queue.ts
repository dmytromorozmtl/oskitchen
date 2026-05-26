/**
 * Client-side offline POS checkout queue (IndexedDB).
 * Queued sales replay via `posCheckoutAction` when connectivity returns.
 */

const DB_NAME = "kitchenos-offline-pos";
const STORE = "checkout_queue";
const DB_VERSION = 1;

export type OfflinePosCheckoutPayload = {
  id: string;
  createdAt: string;
  payload: Record<string, unknown>;
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
    payload,
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

export function registerOfflinePosBackgroundSync(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.ready
    .then((reg) => reg.active?.postMessage({ type: "REGISTER_OFFLINE_POS_SYNC" }))
    .catch(() => undefined);
}
