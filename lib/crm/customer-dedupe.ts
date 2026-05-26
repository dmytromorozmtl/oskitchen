/**
 * Lightweight dedupe helpers — used by the existing /dedupe page plus future
 * background scans that populate `customer_merge_candidates`.
 */

export type DedupeKey =
  | { kind: "email"; value: string }
  | { kind: "phone"; value: string }
  | { kind: "name"; value: string }
  | { kind: "externalId"; value: string };

export type DedupeCandidate = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  externalCustomerId?: string | null;
};

export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return digits;
}

export function normalizeName(name: string | null | undefined): string {
  return (name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function dedupeKeys(candidate: DedupeCandidate): DedupeKey[] {
  const keys: DedupeKey[] = [];
  const email = normalizeEmail(candidate.email);
  if (email) keys.push({ kind: "email", value: email });
  const phone = normalizePhone(candidate.phone);
  if (phone) keys.push({ kind: "phone", value: phone });
  const name = normalizeName(candidate.name);
  if (name) keys.push({ kind: "name", value: name });
  if (candidate.externalCustomerId) {
    keys.push({ kind: "externalId", value: candidate.externalCustomerId });
  }
  return keys;
}

export type SimilarityScore = {
  score: number;
  reasons: string[];
};

/** Rough similarity used for merge confidence. 0..1. */
export function similarity(a: DedupeCandidate, b: DedupeCandidate): SimilarityScore {
  const reasons: string[] = [];
  let score = 0;
  const emailA = normalizeEmail(a.email);
  const emailB = normalizeEmail(b.email);
  if (emailA && emailA === emailB) {
    score += 0.6;
    reasons.push("matching email");
  }
  const phoneA = normalizePhone(a.phone);
  const phoneB = normalizePhone(b.phone);
  if (phoneA && phoneA === phoneB) {
    score += 0.3;
    reasons.push("matching phone");
  }
  const nameA = normalizeName(a.name);
  const nameB = normalizeName(b.name);
  if (nameA && nameA === nameB) {
    score += 0.1;
    reasons.push("matching name");
  }
  if (a.externalCustomerId && a.externalCustomerId === b.externalCustomerId) {
    score += 0.5;
    reasons.push("matching external id");
  }
  return { score: Math.min(1, score), reasons };
}
