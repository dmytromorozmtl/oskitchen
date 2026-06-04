import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-31 — Shopify agency partner program policy (Woo + Shopify LIVE gate).
 *
 * @see docs/partner-program-shopify-agencies.md
 * @see docs/shopify-bundle-sales-guide.md
 * @see docs/shopify-live-smoke-setup.md
 * @see docs/woocommerce-live-smoke-setup.md
 */

export const PARTNER_PROGRAM_SHOPIFY_AGENCIES_POLICY_ID =
  "partner-program-shopify-agencies-mkt31-v1" as const;

export const PARTNER_PROGRAM_SHOPIFY_AGENCIES_DOC =
  "docs/partner-program-shopify-agencies.md" as const;

export const PARTNER_PROGRAM_STATUS = "PRE-LAUNCH" as const;

export const PARTNER_PROGRAM_WOO_SMOKE_ARTIFACT =
  "artifacts/woocommerce-live-smoke-summary.json" as const;

export const PARTNER_PROGRAM_SHOPIFY_SMOKE_ARTIFACT =
  "artifacts/shopify-live-smoke-summary.json" as const;

export const PARTNER_PROGRAM_ENABLE_GATES = [
  "woocommerce live smoke",
  "shopify live smoke",
  "p0 orchestrator",
  "partner agreement template",
] as const;

export const PARTNER_PROGRAM_TIERS = ["Registered", "Certified", "Premier"] as const;

export const PARTNER_PROGRAM_AGENCY_CRITERIA_COUNT = 10 as const;

export const PARTNER_PROGRAM_FORBIDDEN_CLAIMS = [
  "official shopify app",
  "live for all tenants",
  "beat shopify pos",
  "guaranteed referral income",
  "thousands of agency partners",
  "enterprise sso included",
  "production-certified channel sync",
] as const;

export const PARTNER_PROGRAM_DOC_REQUIRED_HEADINGS = [
  "Program enable gate",
  "Agency qualification criteria",
  "Partner tiers",
  "Forbidden partner program claims",
  "Launch checklist",
] as const;

export type PartnerProgramShopifyAgenciesDocAudit = {
  docPath: typeof PARTNER_PROGRAM_SHOPIFY_AGENCIES_DOC;
  missingHeadings: string[];
  tierCount: number;
  criteriaDocumented: boolean;
  passed: boolean;
};

export function auditPartnerProgramShopifyAgenciesDoc(
  root = process.cwd(),
): PartnerProgramShopifyAgenciesDocAudit {
  const source = readFileSync(join(root, PARTNER_PROGRAM_SHOPIFY_AGENCIES_DOC), "utf8");
  const missingHeadings = PARTNER_PROGRAM_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const tierCount = PARTNER_PROGRAM_TIERS.filter((tier) => source.includes(tier)).length;
  const criteriaDocumented = source.includes("A10") && source.includes("A1");

  return {
    docPath: PARTNER_PROGRAM_SHOPIFY_AGENCIES_DOC,
    missingHeadings,
    tierCount,
    criteriaDocumented,
    passed:
      missingHeadings.length === 0 &&
      tierCount === PARTNER_PROGRAM_TIERS.length &&
      criteriaDocumented &&
      source.includes(PARTNER_PROGRAM_STATUS),
  };
}

export function isPartnerProgramShopifyAgenciesEnabled(
  wooLivePassed: boolean,
  shopifyLivePassed: boolean,
): boolean {
  return wooLivePassed && shopifyLivePassed;
}

export type PartnerProgramShopifyAgenciesLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintPartnerProgramShopifyAgenciesCopy(
  source: string,
): PartnerProgramShopifyAgenciesLint {
  const lower = source.toLowerCase();
  const forbiddenHits = PARTNER_PROGRAM_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}

export function getPartnerTierByReferralCount(referralLoiCount: number): string | null {
  if (referralLoiCount >= 3) return "Premier";
  if (referralLoiCount >= 1) return "Certified";
  if (referralLoiCount >= 0) return "Registered";
  return null;
}
