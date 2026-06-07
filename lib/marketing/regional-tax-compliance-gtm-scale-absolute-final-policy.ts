/**
 * Absolute Final Task 133 — regional tax compliance GTM scale (feature 88).
 *
 * @see docs/regional-tax-compliance-gtm-scale.md
 * @see docs/regional-tax-compliance.md
 */

export const REGIONAL_TAX_COMPLIANCE_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "regional-tax-compliance-gtm-scale-absolute-final-v1" as const;

export const REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH =
  "docs/regional-tax-compliance-gtm-scale.md" as const;

export const REGIONAL_TAX_COMPLIANCE_GTM_SCALE_HONESTY_MARKERS = [
  "Do **not** claim",
  "not tax advice",
  "operator responsibility",
  "Not available",
  "~25%",
  "sales-safe",
] as const;

export const REGIONAL_TAX_COMPLIANCE_GTM_SCALE_WIRING_PATHS = [
  REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH,
  "docs/regional-tax-compliance.md",
  "lib/compliance/regional-tax-compliance-absolute-final-policy.ts",
  "lib/marketing/regional-tax-compliance-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/regional-tax-compliance-gtm-scale-audit.ts",
  "tests/unit/regional-tax-compliance-absolute-final.test.ts",
] as const;
