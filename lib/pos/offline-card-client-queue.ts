/**
 * Browser queue for PCI-safe offline card metadata (pairs with `lib/pos/offline-pos-queue.ts`).
 */

const DB_NAME = "kitchenos-offline-card";
const STORE = "card_capture_queue";
const DB_VERSION = 1;

export type OfflineCardClientEntry = {
  id: string;
  offlineSaleId: string;
  createdAt: string;
  registerId: string;
  amountCents: number;
  cardBrand: string;
  last4: string;
  paymentIntentId?: string;
  syncStatus: "queued" | "synced" | "failed";
  syncError?: string;
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

export async function enqueueOfflineCardClientCapture(input: {
  offlineSaleId: string;
  registerId: string;
  amountCents: number;
  cardBrand: string;
  last4: string;
  paymentIntentId?: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  const entry: OfflineCardClientEntry = {
    id,
    offlineSaleId: input.offlineSaleId,
    createdAt: new Date().toISOString(),
    registerId: input.registerId,
    amountCents: Math.round(input.amountCents),
    cardBrand: input.cardBrand.trim().slice(0, 32),
    last4: input.last4.replace(/\D/g, "").slice(-4),
    paymentIntentId: input.paymentIntentId,
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

export async function listOfflineCardClientCaptures(): Promise<OfflineCardClientEntry[]> {
  const db = await openDb();
  const rows = await new Promise<OfflineCardClientEntry[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as OfflineCardClientEntry[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeOfflineCardClientCapture(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
