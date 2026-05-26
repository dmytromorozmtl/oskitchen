import type { StorefrontDomainVerificationStatus } from "@/services/storefront/storefront-domain-verification-service";

const CRON_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function domainStatusDisplayLabel(status: string | null | undefined): string {
  switch (status) {
    case "ACTIVE":
      return "VERIFIED";
    case "DNS_VERIFIED":
      return "VERIFIED (routing pending)";
    case "DNS_MISSING":
    case "ERROR":
      return "FAILED";
    case "PENDING":
    case "SSL_PENDING":
      return "PENDING";
    case "NOT_CONFIGURED":
      return "NOT CONFIGURED";
    default:
      return status?.trim() || "—";
  }
}

export function estimateNextDomainRecheckAt(lastCheckedAt: Date | null): Date | null {
  if (!lastCheckedAt) return null;
  return new Date(lastCheckedAt.getTime() + CRON_INTERVAL_MS);
}

export function formatDomainRecheckHint(lastCheckedAt: Date | null): string | null {
  const next = estimateNextDomainRecheckAt(lastCheckedAt);
  if (!next) return "Automatic recheck runs daily when a custom domain is configured.";
  return `Next automatic recheck (~24h): ${next.toLocaleString()}`;
}

export type { StorefrontDomainVerificationStatus };
