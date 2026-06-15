import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 16;
const TAG_LEN = 16;
const KEY_LEN = 32;
const KDF_SALT = "kitchenos:credential:v1";

export class EncryptionKeyMissingError extends Error {
  constructor() {
    super(
      "ENCRYPTION_KEY is not set. Add a 32-byte key as base64 or 64-char hex to .env.local (see .env.example).",
    );
    this.name = "EncryptionKeyMissingError";
  }
}

function parseEncryptionKey(raw: string): Buffer {
  const trimmed = raw.trim();
  if (!trimmed) throw new EncryptionKeyMissingError();

  try {
    const b64 = Buffer.from(trimmed, "base64");
    if (b64.length === KEY_LEN) return b64;
  } catch {
    /* fall through */
  }

  const hex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (/^[0-9a-fA-F]{64}$/.test(hex)) {
    return Buffer.from(hex, "hex");
  }

  return scryptSync(trimmed, KDF_SALT, KEY_LEN);
}

export function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new EncryptionKeyMissingError();
  return parseEncryptionKey(raw);
}

export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.ENCRYPTION_KEY?.trim());
}

/** Encrypt UTF-8 text; returns base64(iv || tag || ciphertext). */
export function encryptSecret(plain: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/**
 * Deterministic variant for lookup-heavy fields where we need stable equality
 * matching without introducing a parallel hash column yet.
 */
export function encryptDeterministicSecret(plain: string, scope: string): string {
  const key = getEncryptionKey();
  const iv = createHash("sha256")
    .update(scope)
    .update("\0")
    .update(plain)
    .update(key)
    .digest()
    .subarray(0, IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(payloadB64: string): string {
  const key = getEncryptionKey();
  const buf = Buffer.from(payloadB64, "base64");
  if (buf.length < IV_LEN + TAG_LEN + 1) {
    throw new Error("Invalid encrypted payload");
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const data = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function encryptOptional(plain: string | undefined | null): string | null {
  if (plain == null) return null;
  const t = plain.trim();
  if (!t) return null;
  return encryptSecret(t);
}

export function decryptOptional(enc: string | null | undefined): string | null {
  if (enc == null || enc === "") return null;
  return decryptSecret(enc);
}
