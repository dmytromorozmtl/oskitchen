/**
 * Client-side offline queue for invoice scanner photos and pending confirmations.
 * Photos captured without connectivity are stored in IndexedDB and synced when online.
 */

import type { ScannedInvoice } from "@/lib/inventory/invoice-scanner-types";

export const INVOICE_SCANNER_OFFLINE_DB = "kitchenos-invoice-scanner-offline";
export const INVOICE_SCANNER_OFFLINE_STORE = "scan_queue";
const DB_VERSION = 1;

export type InvoiceScanQueueKind = "scan" | "confirm";
export type InvoiceScanQueueStatus = "queued" | "syncing" | "failed";

export type InvoiceScanQueueEntry = {
  id: string;
  createdAt: string;
  kind: InvoiceScanQueueKind;
  status: InvoiceScanQueueStatus;
  fileName?: string;
  mimeType?: string;
  imageBase64?: string;
  confirmPayload?: ScannedInvoice;
  syncError?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(INVOICE_SCANNER_OFFLINE_DB, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(INVOICE_SCANNER_OFFLINE_STORE)) {
        db.createObjectStore(INVOICE_SCANNER_OFFLINE_STORE, { keyPath: "id" });
      }
    };
  });
}

export async function listInvoiceScanQueue(): Promise<InvoiceScanQueueEntry[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDb();
  const rows = await new Promise<InvoiceScanQueueEntry[]>((resolve, reject) => {
    const tx = db.transaction(INVOICE_SCANNER_OFFLINE_STORE, "readonly");
    const req = tx.objectStore(INVOICE_SCANNER_OFFLINE_STORE).getAll();
    req.onsuccess = () => resolve(req.result as InvoiceScanQueueEntry[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

async function putEntry(entry: InvoiceScanQueueEntry): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(INVOICE_SCANNER_OFFLINE_STORE, "readwrite");
    tx.objectStore(INVOICE_SCANNER_OFFLINE_STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function enqueueOfflineInvoiceScan(params: {
  imageBase64: string;
  mimeType: string;
  fileName: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  await putEntry({
    id,
    createdAt: new Date().toISOString(),
    kind: "scan",
    status: "queued",
    imageBase64: params.imageBase64,
    mimeType: params.mimeType,
    fileName: params.fileName,
  });
  return id;
}

export async function enqueueOfflineInvoiceConfirm(invoice: ScannedInvoice): Promise<string> {
  const id = crypto.randomUUID();
  await putEntry({
    id,
    createdAt: new Date().toISOString(),
    kind: "confirm",
    status: "queued",
    confirmPayload: invoice,
  });
  return id;
}

export async function updateInvoiceScanQueueEntry(
  id: string,
  patch: Partial<Pick<InvoiceScanQueueEntry, "status" | "syncError">>,
): Promise<void> {
  const db = await openDb();
  const existing = await new Promise<InvoiceScanQueueEntry | undefined>((resolve, reject) => {
    const tx = db.transaction(INVOICE_SCANNER_OFFLINE_STORE, "readonly");
    const req = tx.objectStore(INVOICE_SCANNER_OFFLINE_STORE).get(id);
    req.onsuccess = () => resolve(req.result as InvoiceScanQueueEntry | undefined);
    req.onerror = () => reject(req.error);
  });
  if (!existing) {
    db.close();
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(INVOICE_SCANNER_OFFLINE_STORE, "readwrite");
    tx.objectStore(INVOICE_SCANNER_OFFLINE_STORE).put({ ...existing, ...patch });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function removeInvoiceScanQueueEntry(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(INVOICE_SCANNER_OFFLINE_STORE, "readwrite");
    tx.objectStore(INVOICE_SCANNER_OFFLINE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function invoiceScanQueueSize(): Promise<number> {
  const rows = await listInvoiceScanQueue();
  return rows.filter((r) => r.status === "queued" || r.status === "failed").length;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1]! : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/** Test helper — clears queue in unit tests. */
export async function resetInvoiceScanQueueForTests(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const rows = await listInvoiceScanQueue();
  for (const row of rows) {
    await removeInvoiceScanQueueEntry(row.id);
  }
}
