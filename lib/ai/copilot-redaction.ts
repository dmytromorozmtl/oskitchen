import type { CopilotRedactionLevel } from "@prisma/client";

const EMAIL_RE = /([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/g;
const ADDRESS_HINT_RE = /\b\d{1,5}\s+[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,4}(?:\s(?:St|Ave|Rd|Blvd|Dr|Ln|Ct|Way|Pl)\b)?/g;
const CREDIT_CARD_RE = /\b(?:\d[ -]*?){13,16}\b/g;
const TOKEN_HINT_RE = /\b(sk-[A-Za-z0-9-_]{16,}|Bearer\s+[A-Za-z0-9._-]{16,}|[A-Za-z0-9]{32,})\b/g;
const SECRET_KEY_RE = /(api[_-]?key|secret|password|token)\s*[:=]\s*["']?[^"'\s]+/gi;

/**
 * Masks an email like "ada@example.com" → "ada***@example.com".
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const visible = user.slice(0, Math.min(3, user.length));
  return `${visible}${user.length > 3 ? "***" : ""}@${domain}`;
}

/**
 * Masks a phone like "+1 415-555-0123" → "+1 415-***-0123".
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  const last = digits.slice(-4);
  return `***${last}`;
}

export function maskAddress(address: string | null | undefined): string {
  if (!address) return "";
  return address.replace(/\d+/g, "###").slice(0, 60);
}

/**
 * Apply a redaction pass over arbitrary free-text content. Always
 * strips obvious secrets (API keys, bearer tokens, credit-card-like
 * runs) regardless of level. Levels above NONE additionally mask
 * emails / phones / addresses.
 */
export function redactText(text: string, level: CopilotRedactionLevel): string {
  if (!text) return "";
  let out = text;

  // Always strip secrets / tokens / cards.
  out = out.replace(SECRET_KEY_RE, (m) => `${m.split(/[:=]/)[0]}=***`);
  out = out.replace(TOKEN_HINT_RE, "***token***");
  out = out.replace(CREDIT_CARD_RE, "****-****-****-****");

  if (level === "NONE") return out;
  if (level === "FULL_INTERNAL_ALLOWED") return out;

  // OPERATIONAL_SUMMARY and PII_REDACTED both mask PII.
  out = out.replace(EMAIL_RE, (_m, u: string, d: string) => `${u.slice(0, Math.min(3, u.length))}***@${d}`);
  out = out.replace(PHONE_RE, (m) => {
    const digits = m.replace(/\D/g, "");
    if (digits.length < 4) return "***";
    return `***${digits.slice(-4)}`;
  });
  out = out.replace(ADDRESS_HINT_RE, (m) => m.replace(/\d+/g, "###"));

  if (level === "OPERATIONAL_SUMMARY") {
    out = out.replace(/(notes?:\s*).*/gi, "$1[summary redacted]");
  }
  return out;
}

/**
 * Returns a numeric ranking so callers can pick the *stricter* of two
 * levels.
 */
export function redactionStrictness(level: CopilotRedactionLevel): number {
  switch (level) {
    case "FULL_INTERNAL_ALLOWED":
      return 0;
    case "NONE":
      return 1;
    case "OPERATIONAL_SUMMARY":
      return 2;
    case "PII_REDACTED":
      return 3;
    default:
      return 3;
  }
}

export function stricterRedaction(
  a: CopilotRedactionLevel,
  b: CopilotRedactionLevel,
): CopilotRedactionLevel {
  return redactionStrictness(a) >= redactionStrictness(b) ? a : b;
}

/**
 * Detect whether a redacted prompt still contains likely secrets or
 * PII. Used as a final safety gate before any network call.
 */
export function detectLeakRisks(text: string): {
  hasSecret: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasCard: boolean;
} {
  return {
    hasSecret: SECRET_KEY_RE.test(text) || TOKEN_HINT_RE.test(text),
    hasEmail: EMAIL_RE.test(text),
    hasPhone: PHONE_RE.test(text),
    hasCard: CREDIT_CARD_RE.test(text),
  };
}
