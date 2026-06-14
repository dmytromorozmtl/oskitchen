/**
 * P1-31 — local menu cache for offline POS full mode (Toast parity).
 * Persists POS-visible products in IndexedDB when online for refresh-while-offline.
 */

import { OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID } from "@/lib/pos/offline-pos-full-mode-p1-31-policy";

export const POS_OFFLINE_MENU_CACHE_DB = "kitchenos-offline-pos-menu" as const;
export const POS_OFFLINE_MENU_CACHE_STORE = "menu_cache" as const;
export const POS_OFFLINE_MENU_CACHE_POLICY_ID = OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID;

export type PosOfflineMenuCacheProduct = {
  id: string;
  title: string;
  price: number;
  category: string | null;
  barcode?: string | null;
  image?: string | null;
};

export type PosOfflineMenuCacheSnapshot = {
  registerId: string;
  products: PosOfflineMenuCacheProduct[];
  cachedAt: string;
};

function storageAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(POS_OFFLINE_MENU_CACHE_DB, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(POS_OFFLINE_MENU_CACHE_STORE)) {
        db.createObjectStore(POS_OFFLINE_MENU_CACHE_STORE, { keyPath: "registerId" });
      }
    };
  });
}

export async function savePosOfflineMenuCache(
  registerId: string,
  products: PosOfflineMenuCacheProduct[],
): Promise<void> {
  if (!storageAvailable() || !registerId || products.length === 0) return;

  const snapshot: PosOfflineMenuCacheSnapshot = {
    registerId,
    products,
    cachedAt: new Date().toISOString(),
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(POS_OFFLINE_MENU_CACHE_STORE, "readwrite");
    tx.objectStore(POS_OFFLINE_MENU_CACHE_STORE).put(snapshot);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPosOfflineMenuCache(
  registerId: string,
): Promise<PosOfflineMenuCacheSnapshot | null> {
  if (!storageAvailable() || !registerId) return null;

  const db = await openDb();
  const snapshot = await new Promise<PosOfflineMenuCacheSnapshot | undefined>((resolve, reject) => {
    const tx = db.transaction(POS_OFFLINE_MENU_CACHE_STORE, "readonly");
    const req = tx.objectStore(POS_OFFLINE_MENU_CACHE_STORE).get(registerId);
    req.onsuccess = () => resolve(req.result as PosOfflineMenuCacheSnapshot | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();

  if (!snapshot || snapshot.registerId !== registerId || !Array.isArray(snapshot.products)) {
    return null;
  }
  return snapshot;
}

export async function clearPosOfflineMenuCache(registerId: string): Promise<void> {
  if (!storageAvailable() || !registerId) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(POS_OFFLINE_MENU_CACHE_STORE, "readwrite");
    tx.objectStore(POS_OFFLINE_MENU_CACHE_STORE).delete(registerId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
