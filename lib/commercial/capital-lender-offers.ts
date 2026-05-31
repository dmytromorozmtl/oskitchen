import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import type { CapitalPartner } from "@/lib/commercial/capital-partners";

export const CAPITAL_ATTESTATION_SHARE_TTL_DAYS = 7;

export function resolveCapitalLenderWebhookSecret(partner: CapitalPartner): string | null {
  const envKey = partner.webhookSecretEnvKey?.trim();
  if (envKey) {
    const value = process.env[envKey]?.trim();
    if (value) return value;
  }
  const fallback = process.env.CAPITAL_LENDER_WEBHOOK_SECRET?.trim();
  if (fallback) return fallback;
  if (process.env.NODE_ENV === "test") {
    return "test-capital-lender-webhook-secret";
  }
  return null;
}

export function generateCapitalAttestationShareToken(): string {
  return randomBytes(24).toString("hex");
}

export function attestationShareExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + CAPITAL_ATTESTATION_SHARE_TTL_DAYS * 86_400_000);
}

export function buildPartnerApplyUrl(
  template: string,
  vars: { referralId: string; shareToken?: string | null },
): string {
  return template
    .replaceAll("{{referralId}}", encodeURIComponent(vars.referralId))
    .replaceAll("{{shareToken}}", encodeURIComponent(vars.shareToken ?? ""));
}

export function signCapitalLenderWebhookBody(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifyCapitalLenderWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader?.trim()) return false;
  const expected = signCapitalLenderWebhookBody(rawBody, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader.trim(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function signCapitalLenderPartnerPull(
  partnerSlug: string,
  shareToken: string,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(`${partnerSlug}:${shareToken}`, "utf8")
    .digest("hex");
}

export function verifyCapitalLenderPartnerPull(
  partnerSlug: string,
  shareToken: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader?.trim()) return false;
  const expected = signCapitalLenderPartnerPull(partnerSlug, shareToken, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader.trim(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const CAPITAL_LENDER_CONSENT_COPY =
  "I authorize OS Kitchen to share my selected signed revenue export with the financing partner listed below. OS Kitchen does not make credit decisions or guarantee approval.";

export const CAPITAL_LENDER_OFFER_DISCLAIMER =
  "Offers are provided by third-party licensed lenders. Terms, rates, and eligibility are determined solely by the lender.";
