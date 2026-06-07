/**
 * Absolute Final Task 29 — Eight sales-safe competitor claims (8/8).
 *
 * @see artifacts/competitor-feature-tracker.json → salesSafeCompetitorClaims
 * @see docs/sales-safe-claims-registry.md
 */

export const COMPETITOR_SALES_SAFE_CLAIMS_POLICY_ID =
  "competitor-sales-safe-claims-absolute-final-v1" as const;

export const COMPETITOR_SALES_SAFE_CLAIMS_TRACKER_ARTIFACT =
  "artifacts/competitor-feature-tracker.json" as const;

export const COMPETITOR_SALES_SAFE_CLAIMS_TOTAL = 8 as const;

export const COMPETITOR_SALES_SAFE_CLAIMS_IDS = [
  "toast",
  "square",
  "lightspeed",
  "clover",
  "touchbistro",
  "revel",
  "spoton",
  "olo",
] as const;

export type CompetitorSalesSafeClaimId = (typeof COMPETITOR_SALES_SAFE_CLAIMS_IDS)[number];

export const COMPETITOR_SALES_SAFE_CLAIMS_REQUIRED_FIELDS = [
  "displayName",
  "salesClaimVerdict",
  "salesSafeClaim",
  "competitorWinsWeDefer",
  "osKitchenWedge",
  "evidenceRefs",
  "safeTalkTrack",
] as const;

export const COMPETITOR_SALES_SAFE_CLAIMS_FORBIDDEN_PHRASES = [
  "production certified for all tenants",
  "thousands of restaurants",
  "replace Toast",
  "Toast-class",
  "enterprise-ready day one",
  "0 LIVE",
] as const;

export const COMPETITOR_SALES_SAFE_CLAIMS_CI_SCRIPTS = [
  "test:ci:competitor-sales-safe-claims",
] as const;

export type CompetitorSalesSafeClaimRecord = {
  displayName: string;
  salesClaimVerdict: string;
  salesSafeClaim: string;
  competitorWinsWeDefer: string[];
  osKitchenWedge: string;
  evidenceRefs: string[];
  safeTalkTrack: string;
};

export type CompetitorSalesSafeClaimsSection = {
  schemaVersion: string;
  filledCount: number;
  totalCount: number;
  honestyRule: string;
} & Record<string, unknown>;

export type CompetitorSalesSafeClaimsAudit = {
  policyId: typeof COMPETITOR_SALES_SAFE_CLAIMS_POLICY_ID;
  filledCount: number;
  missingIds: string[];
  invalidIds: string[];
  forbiddenPhraseHits: Array<{ id: string; phrase: string }>;
  passed: boolean;
};

function isClaimEntry(key: string, value: unknown): value is CompetitorSalesSafeClaimRecord {
  if (
    key === "schemaVersion" ||
    key === "filledAt" ||
    key === "policyId" ||
    key === "honestyRule" ||
    key === "filledCount" ||
    key === "totalCount"
  ) {
    return false;
  }
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function auditCompetitorSalesSafeClaims(
  section: CompetitorSalesSafeClaimsSection,
): CompetitorSalesSafeClaimsAudit {
  const missingIds: string[] = [];
  const invalidIds: string[] = [];
  const forbiddenPhraseHits: Array<{ id: string; phrase: string }> = [];

  for (const id of COMPETITOR_SALES_SAFE_CLAIMS_IDS) {
    const claim = section[id];
    if (!isClaimEntry(id, claim)) {
      missingIds.push(id);
      continue;
    }
    for (const field of COMPETITOR_SALES_SAFE_CLAIMS_REQUIRED_FIELDS) {
      const value = claim[field as keyof CompetitorSalesSafeClaimRecord];
      if (value === undefined || value === null) {
        invalidIds.push(`${id}.${field}`);
        continue;
      }
      if (Array.isArray(value) && value.length === 0) {
        invalidIds.push(`${id}.${field}`);
        continue;
      }
      if (
        field === "salesSafeClaim" ||
        field === "osKitchenWedge" ||
        field === "safeTalkTrack"
      ) {
        if (typeof value !== "string" || value.trim().length < 20) {
          invalidIds.push(`${id}.${field}`);
        }
      } else if (field === "displayName") {
        if (typeof value !== "string" || value.trim().length < 2) {
          invalidIds.push(`${id}.${field}`);
        }
      } else if (field === "salesClaimVerdict") {
        if (value !== "YES") {
          invalidIds.push(`${id}.${field}`);
        }
      }
    }
    if (claim.salesClaimVerdict !== "YES" && !invalidIds.includes(`${id}.salesClaimVerdict`)) {
      invalidIds.push(`${id}.salesClaimVerdict`);
    }
    const combined = `${claim.salesSafeClaim} ${claim.safeTalkTrack}`.toLowerCase();
    for (const phrase of COMPETITOR_SALES_SAFE_CLAIMS_FORBIDDEN_PHRASES) {
      if (combined.includes(phrase.toLowerCase())) {
        forbiddenPhraseHits.push({ id, phrase });
      }
    }
  }

  const filledCount = COMPETITOR_SALES_SAFE_CLAIMS_IDS.length - missingIds.length;
  const passed =
    missingIds.length === 0 &&
    invalidIds.length === 0 &&
    forbiddenPhraseHits.length === 0 &&
    section.filledCount === COMPETITOR_SALES_SAFE_CLAIMS_TOTAL &&
    section.totalCount === COMPETITOR_SALES_SAFE_CLAIMS_TOTAL;

  return {
    policyId: COMPETITOR_SALES_SAFE_CLAIMS_POLICY_ID,
    filledCount,
    missingIds,
    invalidIds,
    forbiddenPhraseHits,
    passed,
  };
}

export function formatCompetitorSalesSafeClaimsSummary(audit: CompetitorSalesSafeClaimsAudit): string {
  return `${audit.filledCount}/${COMPETITOR_SALES_SAFE_CLAIMS_TOTAL} sales-safe competitor claims`;
}
