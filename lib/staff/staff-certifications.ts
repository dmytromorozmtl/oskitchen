import type { StaffCertificationStatus } from "@prisma/client";

export type StaffCertCandidate = {
  status: StaffCertificationStatus;
  expiresAt?: Date | null;
  issuedAt?: Date | null;
};

export function isCertActive(c: StaffCertCandidate, now: Date = new Date()): boolean {
  if (c.status !== "ACTIVE") return false;
  if (c.expiresAt && c.expiresAt.getTime() < now.getTime()) return false;
  return true;
}

export function isCertExpiringSoon(
  c: StaffCertCandidate,
  windowDays = 30,
  now: Date = new Date(),
): boolean {
  if (!c.expiresAt) return false;
  if (c.status !== "ACTIVE") return false;
  const ms = c.expiresAt.getTime() - now.getTime();
  return ms > 0 && ms <= windowDays * 24 * 60 * 60 * 1000;
}

export function deriveStatusFromExpiry(
  status: StaffCertificationStatus,
  expiresAt: Date | null,
  now: Date = new Date(),
): StaffCertificationStatus {
  if (status === "REVOKED") return "REVOKED";
  if (expiresAt && expiresAt.getTime() < now.getTime()) return "EXPIRED";
  if (status === "PENDING") return "PENDING";
  return "ACTIVE";
}
