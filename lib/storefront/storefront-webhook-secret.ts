import {
  decryptOptional,
  encryptOptional,
  isEncryptionConfigured,
} from "@/lib/crypto";

const STOREFRONT_WEBHOOK_SECRET_PREFIX = "enc:storefront-webhook:v1:";

export function encryptStorefrontWebhookSecret(
  secret: string | null | undefined,
): string | null {
  if (secret == null) return null;
  const trimmed = secret.trim();
  if (!trimmed) return null;
  if (!isEncryptionConfigured()) return trimmed;
  const encrypted = encryptOptional(trimmed);
  return encrypted
    ? `${STOREFRONT_WEBHOOK_SECRET_PREFIX}${encrypted}`
    : trimmed;
}

export function decryptStorefrontWebhookSecret(
  stored: string | null | undefined,
): string | null {
  if (stored == null || stored === "") return null;
  if (!stored.startsWith(STOREFRONT_WEBHOOK_SECRET_PREFIX)) {
    return stored;
  }
  if (!isEncryptionConfigured()) return null;
  return decryptOptional(stored.slice(STOREFRONT_WEBHOOK_SECRET_PREFIX.length));
}

export function isEncryptedStorefrontWebhookSecret(
  stored: string | null | undefined,
): boolean {
  return Boolean(
    stored && stored.startsWith(STOREFRONT_WEBHOOK_SECRET_PREFIX),
  );
}
