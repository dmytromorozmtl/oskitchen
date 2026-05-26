import type { Prisma } from "@prisma/client";

import { encryptDeterministicSecret, isEncryptionConfigured } from "@/lib/crypto";
import {
  decryptPiiField,
  encryptPiiField,
  PII_ENCRYPTED_PREFIX,
} from "@/lib/security/pii-field";

const ORDER_EMAIL_ENCRYPTED_PREFIX = "enc:order-email:v1:";
const ORDER_EMAIL_ENCRYPTION_SCOPE = "order-customer-email";

export type OrderPiiFields = {
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

export type OrderPiiAudience = "workspace_full" | "support_masked";

function normalizeOrderEmail(email: string | null | undefined): string | null {
  if (email == null) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}

export function encryptOrderCustomerEmail(email: string | null | undefined): string | null {
  const normalized = normalizeOrderEmail(email);
  if (!normalized) return null;
  if (!isEncryptionConfigured()) return normalized;
  return `${ORDER_EMAIL_ENCRYPTED_PREFIX}${encryptDeterministicSecret(
    normalized,
    ORDER_EMAIL_ENCRYPTION_SCOPE,
  )}`;
}

export function decryptOrderCustomerEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  if (email.startsWith(ORDER_EMAIL_ENCRYPTED_PREFIX)) {
    const payload = email.slice(ORDER_EMAIL_ENCRYPTED_PREFIX.length);
    return decryptPiiField(`${PII_ENCRYPTED_PREFIX}${payload}`);
  }
  return decryptPiiField(email);
}

function buildPlaintextEmailMatch(email: string): Prisma.OrderWhereInput {
  return {
    customerEmail: {
      equals: email,
      mode: "insensitive",
    },
  };
}

function buildEncryptedEmailMatch(email: string): Prisma.OrderWhereInput {
  const encrypted = encryptOrderCustomerEmail(email);
  return {
    ...(encrypted ? { customerEmail: encrypted } : { OR: [] }),
  };
}

function buildOrderCustomerEmailEqualsWhere(email: string): Prisma.OrderWhereInput {
  const normalized = normalizeOrderEmail(email);
  if (!normalized) return { OR: [] };
  if (!isEncryptionConfigured()) return buildPlaintextEmailMatch(normalized);
  return {
    OR: [
      buildEncryptedEmailMatch(normalized),
      buildPlaintextEmailMatch(normalized),
    ],
  };
}

function buildOrderCustomerEmailInWhere(emails: string[]): Prisma.OrderWhereInput {
  const normalized = Array.from(
    new Set(emails.map((value) => normalizeOrderEmail(value)).filter(Boolean)),
  ) as string[];
  if (normalized.length === 0) return { OR: [] };
  if (!isEncryptionConfigured()) {
    return {
      OR: normalized.map((email) => buildPlaintextEmailMatch(email)),
    };
  }
  return {
    OR: [
      {
        customerEmail: {
          in: normalized
            .map((email) => encryptOrderCustomerEmail(email))
            .filter((value): value is string => Boolean(value)),
        },
      },
      ...normalized.map((email) => buildPlaintextEmailMatch(email)),
    ],
  };
}

function rewriteSingleOrderEmailFilter(
  filter: Prisma.StringFilter<"Order"> | string | null | undefined,
): Prisma.OrderWhereInput | null {
  if (typeof filter === "string") {
    return buildOrderCustomerEmailEqualsWhere(filter);
  }
  if (filter == null) return null;
  if (typeof filter.equals === "string") {
    return buildOrderCustomerEmailEqualsWhere(filter.equals);
  }
  if (Array.isArray(filter.in)) {
    return buildOrderCustomerEmailInWhere(filter.in.filter((value): value is string => typeof value === "string"));
  }
  return null;
}

export function rewriteOrderEmailFilters(
  where: Prisma.OrderWhereInput,
): Prisma.OrderWhereInput {
  const next: Prisma.OrderWhereInput = { ...where };

  if (Array.isArray(where.AND)) {
    next.AND = where.AND.map((part) => rewriteOrderEmailFilters(part));
  }
  if (Array.isArray(where.OR)) {
    next.OR = where.OR.map((part) => rewriteOrderEmailFilters(part));
  }
  if (Array.isArray(where.NOT)) {
    next.NOT = where.NOT.map((part) => rewriteOrderEmailFilters(part));
  } else if (where.NOT && typeof where.NOT === "object") {
    next.NOT = rewriteOrderEmailFilters(where.NOT);
  }

  const rewrittenEmail = rewriteSingleOrderEmailFilter(
    where.customerEmail as Prisma.StringFilter<"Order"> | string | null | undefined,
  );
  if (!rewrittenEmail) {
    return next;
  }

  delete next.customerEmail;
  if (Object.keys(next).length === 0) {
    return rewrittenEmail;
  }
  return {
    AND: [next, rewrittenEmail],
  };
}

/** Encrypt order PII before persisting. Legacy plaintext rows remain readable via decrypt. */
export function encryptOrderPiiFields<T extends OrderPiiFields>(fields: T): T {
  return {
    ...fields,
    customerName: encryptPiiField(fields.customerName),
    customerEmail: encryptOrderCustomerEmail(fields.customerEmail),
    customerPhone: encryptPiiField(fields.customerPhone),
  };
}

/** Decrypt order PII after loading from DB. */
export function decryptOrderPiiFields<T extends OrderPiiFields>(fields: T): T {
  return {
    ...fields,
    customerName: decryptPiiField(fields.customerName),
    customerEmail: decryptOrderCustomerEmail(fields.customerEmail),
    customerPhone: decryptPiiField(fields.customerPhone),
  };
}

function maskName(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length <= 1) return "*";
  return `${trimmed[0]}${"*".repeat(Math.max(1, trimmed.length - 1))}`;
}

function maskPhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return "*".repeat(Math.max(1, digits.length));
  return `${"*".repeat(Math.max(1, digits.length - 4))}${digits.slice(-4)}`;
}

function maskEmail(value: string | null | undefined): string | null {
  if (!value) return null;
  const [local, domain] = value.split("@");
  if (!domain) return "[redacted]";
  const visible = local.slice(0, Math.min(2, local.length));
  const hidden = "*".repeat(Math.max(1, local.length - visible.length));
  return `${visible}${hidden}@${domain}`;
}

export function presentOrderPiiFields<T extends OrderPiiFields>(
  fields: T,
  audience: OrderPiiAudience,
): T {
  const decrypted = decryptOrderPiiFields(fields);
  if (audience === "workspace_full") return decrypted;
  return {
    ...decrypted,
    customerName: maskName(decrypted.customerName),
    customerEmail: maskEmail(decrypted.customerEmail),
    customerPhone: maskPhone(decrypted.customerPhone),
  };
}
