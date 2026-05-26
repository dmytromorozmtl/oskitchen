import { decryptOptional, encryptOptional, isEncryptionConfigured } from "@/lib/crypto";

/** Prefix for values stored encrypted at rest in plain text columns. */
export const PII_ENCRYPTED_PREFIX = "enc:v1:";

export function isPiiEncryptionEnabled(): boolean {
  return isEncryptionConfigured();
}

/** Encrypt PII for at-rest storage; returns plaintext when ENCRYPTION_KEY is unset (dev). */
export function encryptPiiField(plain: string | null | undefined): string | null {
  if (plain == null) return null;
  const trimmed = plain.trim();
  if (!trimmed) return null;
  if (!isEncryptionConfigured()) return trimmed;
  const enc = encryptOptional(trimmed);
  return enc ? `${PII_ENCRYPTED_PREFIX}${enc}` : trimmed;
}

/** Decrypt PII from storage; passes through legacy plaintext values. */
export function decryptPiiField(stored: string | null | undefined): string | null {
  if (stored == null || stored === "") return null;
  if (!stored.startsWith(PII_ENCRYPTED_PREFIX)) return stored;
  if (!isEncryptionConfigured()) return null;
  const payload = stored.slice(PII_ENCRYPTED_PREFIX.length);
  return decryptOptional(payload);
}

/** Mask email for logs — never log full PII in production. */
export function maskEmailForLog(email: string | null | undefined): string {
  if (!email) return "[none]";
  const [local, domain] = email.split("@");
  if (!domain) return "[redacted]";
  const head = local.length <= 2 ? "*" : `${local.slice(0, 2)}***`;
  return `${head}@${domain}`;
}
