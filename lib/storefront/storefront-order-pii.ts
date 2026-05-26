import type { Prisma } from "@prisma/client";

import { encryptDeterministicSecret, isEncryptionConfigured } from "@/lib/crypto";
import {
  decryptPiiField,
  encryptPiiField,
  PII_ENCRYPTED_PREFIX,
} from "@/lib/security/pii-field";

const STOREFRONT_ORDER_EMAIL_ENCRYPTED_PREFIX = "enc:storefront-order-email:v1:";
const STOREFRONT_ORDER_EMAIL_ENCRYPTION_SCOPE = "storefront-order-customer-email";

export type StorefrontOrderPiiFields = {
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

function normalizeStorefrontOrderEmail(
  email: string | null | undefined,
): string | null {
  if (email == null) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}

export function encryptStorefrontOrderCustomerEmail(
  email: string | null | undefined,
): string | null {
  const normalized = normalizeStorefrontOrderEmail(email);
  if (!normalized) return null;
  if (!isEncryptionConfigured()) return normalized;
  return `${STOREFRONT_ORDER_EMAIL_ENCRYPTED_PREFIX}${encryptDeterministicSecret(
    normalized,
    STOREFRONT_ORDER_EMAIL_ENCRYPTION_SCOPE,
  )}`;
}

export function decryptStorefrontOrderCustomerEmail(
  email: string | null | undefined,
): string | null {
  if (!email) return null;
  if (email.startsWith(STOREFRONT_ORDER_EMAIL_ENCRYPTED_PREFIX)) {
    const payload = email.slice(STOREFRONT_ORDER_EMAIL_ENCRYPTED_PREFIX.length);
    return decryptPiiField(`${PII_ENCRYPTED_PREFIX}${payload}`);
  }
  return decryptPiiField(email);
}

export function encryptStorefrontOrderPiiFields<T extends StorefrontOrderPiiFields>(
  fields: T,
): T {
  return {
    ...fields,
    customerName: encryptPiiField(fields.customerName),
    customerEmail: encryptStorefrontOrderCustomerEmail(fields.customerEmail),
    customerPhone: encryptPiiField(fields.customerPhone),
  };
}

export function decryptStorefrontOrderPiiFields<T extends StorefrontOrderPiiFields>(
  fields: T,
): T {
  return {
    ...fields,
    customerName: decryptPiiField(fields.customerName),
    customerEmail: decryptStorefrontOrderCustomerEmail(fields.customerEmail),
    customerPhone: decryptPiiField(fields.customerPhone),
  };
}

function buildPlaintextEmailMatch(email: string): Prisma.StorefrontOrderWhereInput {
  return {
    customerEmail: {
      equals: email,
      mode: "insensitive",
    },
  };
}

export function buildStorefrontOrderCustomerEmailEqualsWhere(
  email: string | null | undefined,
): Prisma.StorefrontOrderWhereInput {
  const normalized = normalizeStorefrontOrderEmail(email);
  if (!normalized) return { OR: [] };
  if (!isEncryptionConfigured()) return buildPlaintextEmailMatch(normalized);

  const encrypted = encryptStorefrontOrderCustomerEmail(normalized);
  return {
    OR: [
      ...(encrypted ? [{ customerEmail: encrypted }] : []),
      buildPlaintextEmailMatch(normalized),
    ],
  };
}
