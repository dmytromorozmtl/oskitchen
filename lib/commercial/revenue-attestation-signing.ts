import { createHash, createHmac, timingSafeEqual } from "crypto";

export const REVENUE_ATTESTATION_SIGNING_VERSION = "kitchenos-revenue-attestation-v1";
export const REVENUE_ATTESTATION_DEFAULT_TTL_DAYS = 30;

export type RevenueAttestationSignedPayload = {
  version: typeof REVENUE_ATTESTATION_SIGNING_VERSION;
  attestationId: string;
  workspaceId: string;
  businessName: string | null;
  periodStart: string;
  periodEnd: string;
  grossOrderRevenue: number;
  orderCount: number;
  cancelledOrderCount: number;
  currency: string;
  locationsIncluded: string[];
  revenueStatusDefinition: string;
  generatedAt: string;
  expiresAt: string;
  disclaimer: string;
};

function signingMaterialSecret(): string {
  const dedicated = process.env.REVENUE_ATTESTATION_SIGNING_SECRET?.trim();
  if (dedicated) return dedicated;
  const encryptionKey = process.env.ENCRYPTION_KEY?.trim();
  if (encryptionKey) return encryptionKey;
  if (process.env.NODE_ENV === "test") {
    return "test-revenue-attestation-signing-secret";
  }
  throw new Error(
    "REVENUE_ATTESTATION_SIGNING_SECRET or ENCRYPTION_KEY is required for revenue attestations.",
  );
}

export function revenueAttestationSigningKey(): Buffer {
  return createHash("sha256")
    .update(`${REVENUE_ATTESTATION_SIGNING_VERSION}:${signingMaterialSecret()}`)
    .digest();
}

export function canonicalRevenueAttestationPayload(
  payload: Omit<RevenueAttestationSignedPayload, "version"> & {
    version?: typeof REVENUE_ATTESTATION_SIGNING_VERSION;
  },
): string {
  const canonical: RevenueAttestationSignedPayload = {
    version: REVENUE_ATTESTATION_SIGNING_VERSION,
    attestationId: payload.attestationId,
    workspaceId: payload.workspaceId,
    businessName: payload.businessName,
    periodStart: payload.periodStart,
    periodEnd: payload.periodEnd,
    grossOrderRevenue: payload.grossOrderRevenue,
    orderCount: payload.orderCount,
    cancelledOrderCount: payload.cancelledOrderCount,
    currency: payload.currency,
    locationsIncluded: [...payload.locationsIncluded].sort(),
    revenueStatusDefinition: payload.revenueStatusDefinition,
    generatedAt: payload.generatedAt,
    expiresAt: payload.expiresAt,
    disclaimer: payload.disclaimer,
  };
  return JSON.stringify(canonical);
}

export function signRevenueAttestationPayload(
  payload: Omit<RevenueAttestationSignedPayload, "version">,
): string {
  const body = canonicalRevenueAttestationPayload(payload);
  return createHmac("sha256", revenueAttestationSigningKey()).update(body, "utf8").digest("hex");
}

export function verifyRevenueAttestationSignature(input: {
  payload: RevenueAttestationSignedPayload;
  signature: string;
}): boolean {
  const expected = signRevenueAttestationPayload(input.payload);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(input.signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function attestationExpiresAt(from = new Date(), ttlDays = REVENUE_ATTESTATION_DEFAULT_TTL_DAYS): Date {
  return new Date(from.getTime() + ttlDays * 86_400_000);
}

export const REVENUE_ATTESTATION_DISCLAIMER =
  "KitchenOS revenue summary generated from order data in the merchant workspace. Not a credit score, lending decision, bank deposit total, or lender certification.";

export const REVENUE_ATTESTATION_STATUS_DEFINITION =
  "Gross order volume from KitchenOS orders in revenue-eligible statuses (PENDING, CONFIRMED, PREPARING, READY, COMPLETED). Excludes CANCELLED orders.";
