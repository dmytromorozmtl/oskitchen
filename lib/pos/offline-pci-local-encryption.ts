/**
 * Device-local AES-GCM sealing for PCI-adjacent offline fields (last4, brand, opaque refs).
 * Never stores PAN/CVV — pairs with `lib/pos/offline-card-pci.ts` validation.
 */

const KEY_DB = "kitchenos-offline-pci-keys";
const KEY_STORE = "device_keys";
const KEY_ID = "offline-pci-v1";

export type OfflinePciSealAlgorithm = "aes-gcm-v1" | "noop-v1";

export type OfflinePciSealedBlob = {
  algorithm: OfflinePciSealAlgorithm;
  sealed: string;
};

/** Thrown when PCI-adjacent fields cannot be sealed (Web Crypto / IndexedDB unavailable). */
export class OfflinePciEncryptionUnavailableError extends Error {
  readonly code = "OFFLINE_PCI_ENCRYPTION_UNAVAILABLE" as const;

  constructor(message = "Offline card capture requires Web Crypto and IndexedDB on this device.") {
    super(message);
    this.name = "OfflinePciEncryptionUnavailableError";
  }
}

export function isOfflinePciWebCryptoAvailable(): boolean {
  return typeof globalThis.crypto?.subtle?.encrypt === "function";
}

export function isOfflinePciStorageAvailable(): boolean {
  return isOfflinePciWebCryptoAvailable() && typeof indexedDB !== "undefined";
}

/** Gate for OFFLINE_CARD_QUEUED — requires device-local AES-GCM (no insecure fallback). */
export function canQueueOfflineCardCapture(): boolean {
  return isOfflinePciStorageAvailable();
}

/** noop-v1 is reserved for empty plaintext only — see offline-pci-noop-v1-review.ts */
export function isNoopV1EmptyBlob(blob: OfflinePciSealedBlob): boolean {
  return blob.algorithm === "noop-v1" && blob.sealed === "";
}

export function assertOfflinePciEncryptionAvailable(): void {
  if (!canQueueOfflineCardCapture()) {
    throw new OfflinePciEncryptionUnavailableError();
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Normalize typed arrays for Web Crypto (TS 5.5+ BufferSource strictness). */
function toBufferSource(bytes: Uint8Array): BufferSource {
  return Uint8Array.from(bytes);
}

async function openKeyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(KEY_DB, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KEY_STORE)) {
        db.createObjectStore(KEY_STORE);
      }
    };
  });
}

async function getOrCreateRawKey(): Promise<Uint8Array> {
  const db = await openKeyDb();
  const existing = await new Promise<Uint8Array | null>((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, "readonly");
    const req = tx.objectStore(KEY_STORE).get(KEY_ID);
    req.onsuccess = () => {
      const value = req.result;
      resolve(value instanceof Uint8Array ? value : null);
    };
    req.onerror = () => reject(req.error);
  });

  if (existing) {
    db.close();
    return existing;
  }

  const raw = crypto.getRandomValues(new Uint8Array(32));
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, "readwrite");
    tx.objectStore(KEY_STORE).put(raw, KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return raw;
}

async function importAesKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", toBufferSource(raw), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function sealOfflinePciField(plaintext: string): Promise<OfflinePciSealedBlob> {
  const trimmed = plaintext.trim();
  if (!trimmed) {
    return { algorithm: "noop-v1", sealed: "" };
  }
  assertOfflinePciEncryptionAvailable();

  const key = await importAesKey(await getOrCreateRawKey());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(trimmed);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toBufferSource(iv) },
    key,
    toBufferSource(encoded),
  );
  return {
    algorithm: "aes-gcm-v1",
    sealed: `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(cipher))}`,
  };
}

export async function unsealOfflinePciField(blob: OfflinePciSealedBlob): Promise<string> {
  if (!blob.sealed) return "";
  if (blob.algorithm === "noop-v1") {
    try {
      return atob(blob.sealed);
    } catch {
      return blob.sealed;
    }
  }
  if (!isOfflinePciStorageAvailable()) {
    throw new OfflinePciEncryptionUnavailableError(
      "Cannot decrypt offline PCI fields — Web Crypto unavailable on this device.",
    );
  }

  const [ivPart, cipherPart] = blob.sealed.split(".");
  if (!ivPart || !cipherPart) return "";

  const key = await importAesKey(await getOrCreateRawKey());
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toBufferSource(base64ToBytes(ivPart)) },
    key,
    toBufferSource(base64ToBytes(cipherPart)),
  );
  return new TextDecoder().decode(plain);
}

export async function sealOfflinePciRecord<T extends Record<string, string | undefined>>(
  fields: T,
): Promise<Record<keyof T, OfflinePciSealedBlob>> {
  const sealed = {} as Record<keyof T, OfflinePciSealedBlob>;
  for (const [key, value] of Object.entries(fields)) {
    sealed[key as keyof T] = await sealOfflinePciField(value ?? "");
  }
  return sealed;
}

export async function unsealOfflinePciRecord<T extends Record<string, OfflinePciSealedBlob | undefined>>(
  fields: T,
): Promise<Record<string, string>> {
  const plain: Record<string, string> = {};
  for (const [key, blob] of Object.entries(fields)) {
    if (!blob) continue;
    plain[key] = await unsealOfflinePciField(blob);
  }
  return plain;
}
