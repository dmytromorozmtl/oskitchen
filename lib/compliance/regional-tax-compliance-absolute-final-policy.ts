/**
 * Absolute Final Task 88 — regional tax compliance guide.
 *
 * @see docs/regional-tax-compliance.md
 * @see lib/storefront/tax-settings.ts
 */

export const REGIONAL_TAX_COMPLIANCE_ABSOLUTE_FINAL_POLICY_ID =
  "regional-tax-compliance-absolute-final-v1" as const;

export const REGIONAL_TAX_COMPLIANCE_DOC_PATH = "docs/regional-tax-compliance.md" as const;

export const REGIONAL_TAX_COMPLIANCE_TAX_SETTINGS_PATH = "lib/storefront/tax-settings.ts" as const;

export const REGIONAL_TAX_COMPLIANCE_INTERNATIONAL_PLAN_PATH =
  "docs/international-expansion-plan.md" as const;

export const REGIONAL_TAX_COMPLIANCE_REQUIRED_HEADINGS = [
  "## Gap analysis by region",
  "## Timeline",
  "## Human gate checklist",
  "## Sales guidance",
  "Phase 0 — Baseline",
  "Phase 1 — US/CA hardening",
  "Phase 2 — TaxJar path",
  "Phase 3 — UK VAT pilot",
  "Phase 4 — EU advisory",
  "Phase 5 — Reporting exports",
] as const;

export const REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES = [
  "Phase 0 — Baseline",
  "Phase 1 — US/CA hardening",
  "Phase 2 — TaxJar path",
  "Phase 3 — UK VAT pilot",
  "Phase 4 — EU advisory",
  "Phase 5 — Reporting exports",
] as const;

export const REGIONAL_TAX_COMPLIANCE_GAP_REGIONS = [
  "US sales tax",
  "Canada GST/PST",
  "UK VAT",
  "EU VAT",
  "AU/NZ GST",
  "Marketplace / delivery tax",
] as const;

export const REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES = [
  "single",
  "us_sales",
  "ca_sales",
  "eu_vat",
] as const;

export const REGIONAL_TAX_COMPLIANCE_HONESTY_MARKERS = [
  "Do **not** claim",
  "not tax advice",
  "operator responsibility",
  "Not available",
  "~25%",
] as const;

export const REGIONAL_TAX_COMPLIANCE_WIRING_PATHS = [
  REGIONAL_TAX_COMPLIANCE_DOC_PATH,
  REGIONAL_TAX_COMPLIANCE_TAX_SETTINGS_PATH,
  REGIONAL_TAX_COMPLIANCE_INTERNATIONAL_PLAN_PATH,
  "docs/eu-data-residency-roadmap.md",
  "lib/compliance/regional-tax-compliance-absolute-final-policy.ts",
  "lib/compliance/regional-tax-compliance-audit.ts",
  "tests/unit/regional-tax-compliance-absolute-final.test.ts",
] as const;

export const REGIONAL_TAX_COMPLIANCE_UNIT_TEST =
  "tests/unit/regional-tax-compliance-absolute-final.test.ts" as const;

export const REGIONAL_TAX_COMPLIANCE_CI_SCRIPTS = [
  "test:ci:regional-tax-compliance",
  "test:ci:regional-tax-compliance:cert",
] as const;

export type RegionalTaxCompliancePhase = (typeof REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES)[number];
