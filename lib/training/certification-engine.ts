import type { TrainingCertificationType } from "@prisma/client";

export type CertificationCandidate = {
  certificationType?: TrainingCertificationType;
  recipientProfileId?: string | null;
  recipientStaffId?: string | null;
  issuedAt?: Date;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
};

export function isCertificationActive(input: CertificationCandidate, now: Date = new Date()): boolean {
  if (input.revokedAt) return false;
  if (input.expiresAt && input.expiresAt.getTime() < now.getTime()) return false;
  return true;
}

export function isCertificationExpiringSoon(
  input: CertificationCandidate,
  windowDays = 30,
  now: Date = new Date(),
): boolean {
  if (!input.expiresAt) return false;
  if (input.revokedAt) return false;
  const ms = input.expiresAt.getTime() - now.getTime();
  return ms > 0 && ms <= windowDays * 24 * 60 * 60 * 1000;
}

/** Default certification window (in days) per certification type. Null = never expires. */
export const DEFAULT_VALIDITY_DAYS: Record<TrainingCertificationType, number | null> = {
  KITCHEN_CERTIFIED: 365,
  PACKING_CERTIFIED: 365,
  ROUTE_CERTIFIED: 365,
  MANAGER_CERTIFIED: 730,
  SAFETY_CERTIFIED: 365,
  CATERING_CERTIFIED: 365,
  CUSTOMER_SERVICE_CERTIFIED: 365,
  ALLERGEN_CERTIFIED: 365,
  CUSTOM: null,
};

export function defaultExpiry(
  certificationType: TrainingCertificationType,
  issuedAt: Date = new Date(),
): Date | null {
  const days = DEFAULT_VALIDITY_DAYS[certificationType];
  if (!days) return null;
  const d = new Date(issuedAt);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
