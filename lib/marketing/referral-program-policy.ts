import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-32 — referral program GTM policy (NPS ≥40 gate).
 *
 * @see docs/referral-program.md
 * @see services/referral/referral-service.ts
 */

export const REFERRAL_PROGRAM_POLICY_ID = "referral-program-mkt32-v1" as const;

export const REFERRAL_PROGRAM_DOC = "docs/referral-program.md" as const;

export const REFERRAL_PROGRAM_NPS_ARTIFACT =
  "artifacts/referral-program-nps-summary.json" as const;

export const REFERRAL_PROGRAM_PRODUCT_STATUS = "BETA" as const;

export const REFERRAL_PROGRAM_GTM_STATUS = "PRE-LAUNCH" as const;

/** Minimum portfolio NPS before public referral GTM. */
export const REFERRAL_PROGRAM_MIN_NPS = 40 as const;

/** Minimum pilots with NPS survey before GTM enable. */
export const REFERRAL_PROGRAM_MIN_PILOTS_WITH_NPS = 3 as const;

export const REFERRAL_FREE_MONTH_DAYS = 30 as const;

export const REFERRAL_PROGRAM_GTM_GATES = [
  "active pilots with nps survey",
  "portfolio nps",
  "referral conversion smoke",
  "forbidden claims lint",
  "icp-only positioning",
] as const;

export const REFERRAL_PROGRAM_GTM_TIERS = ["Starter", "Advocate", "Champion"] as const;

export const REFERRAL_PROGRAM_FORBIDDEN_CLAIMS = [
  "unlimited free months",
  "thousands of operators",
  "guaranteed income",
  "works for any business",
  "production-certified",
  "enterprise-ready",
  "affiliate pyramid",
] as const;

export const REFERRAL_PROGRAM_DOC_REQUIRED_HEADINGS = [
  "GTM enable gate",
  "How it works",
  "Forbidden referral program claims",
  "GTM launch checklist",
  "NPS capture script",
] as const;

export type ReferralProgramDocAudit = {
  docPath: typeof REFERRAL_PROGRAM_DOC;
  missingHeadings: string[];
  npsThresholdDocumented: boolean;
  passed: boolean;
};

export function auditReferralProgramDoc(root = process.cwd()): ReferralProgramDocAudit {
  const source = readFileSync(join(root, REFERRAL_PROGRAM_DOC), "utf8");
  const missingHeadings = REFERRAL_PROGRAM_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const npsThresholdDocumented =
    source.includes(String(REFERRAL_PROGRAM_MIN_NPS)) &&
    source.includes("NPS");

  return {
    docPath: REFERRAL_PROGRAM_DOC,
    missingHeadings,
    npsThresholdDocumented,
    passed: missingHeadings.length === 0 && npsThresholdDocumented,
  };
}

/** Portfolio NPS = % promoters − % detractors (0–100 scale). */
export function calculatePortfolioNps(
  promoters: number,
  detractors: number,
  total: number,
): number | null {
  if (total <= 0) return null;
  return Math.round(((promoters - detractors) / total) * 100);
}

export function isReferralProgramGtmEnabled(
  npsScore: number | null,
  pilotsWithNps: number,
): boolean {
  if (npsScore === null) return false;
  return (
    pilotsWithNps >= REFERRAL_PROGRAM_MIN_PILOTS_WITH_NPS &&
    npsScore >= REFERRAL_PROGRAM_MIN_NPS
  );
}

export type ReferralProgramLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintReferralProgramCopy(source: string): ReferralProgramLint {
  const lower = source.toLowerCase();
  const forbiddenHits = REFERRAL_PROGRAM_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}

export function getReferralGtmTierByRefereeCount(refereeCount: number): string {
  if (refereeCount >= 5) return "Champion";
  if (refereeCount >= 3) return "Advocate";
  return "Starter";
}
