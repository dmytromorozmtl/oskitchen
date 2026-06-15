/**
 * Blueprint P3-135 — Pricing SKU PM (Pilot $X/3mo, Standard $Y/mo).
 *
 * @see docs/pricing-sku-pm.md
 */

export const PRICING_SKU_P3_135_POLICY_ID = "pricing-sku-p3-135-v1" as const;

export const PRICING_SKU_P3_135_DOC = "docs/pricing-sku-pm.md" as const;

export const PRICING_SKU_P3_135_ARTIFACT = "artifacts/pricing-sku-registry.json" as const;

export const PRICING_SKU_P3_135_AUDIT_SCRIPT = "scripts/audit-pricing-sku-p3-135.ts" as const;

export const PRICING_SKU_P3_135_NPM_SCRIPT = "audit:pricing-sku-p3-135" as const;

export const PRICING_SKU_P3_135_UNIT_TEST = "tests/unit/pricing-sku-p3-135.test.ts" as const;

export const PRICING_SKU_P3_135_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const PRICING_SKU_P3_135_PILOT_SKU = "PILOT-PRO-50" as const;

export const PRICING_SKU_P3_135_STANDARD_SKU = "STD-PRO" as const;

export const PRICING_SKU_P3_135_PILOT_MONTHLY_USD = 40 as const;

export const PRICING_SKU_P3_135_STANDARD_MONTHLY_USD = 79 as const;

export const PRICING_SKU_P3_135_PILOT_TERM_MONTHS = 3 as const;

export const PRICING_SKU_P3_135_PILOT_TOTAL_USD = 120 as const;

export const PRICING_SKU_P3_135_PILOT_DISCOUNT_PCT = 50 as const;

export const PRICING_SKU_P3_135_IMPLEMENTATION_SOURCE =
  "lib/marketing/pilot-pricing-skus.ts" as const;

export const PRICING_SKU_P3_135_BILLING_SOURCE = "lib/billing/plan-registry.ts" as const;

export const PRICING_SKU_P3_135_RELATED_DOCS = [
  "docs/pilot-package-v1.md",
  "docs/forbidden-claims-audit.md",
  "docs/sales-limitation-sheet.md",
  "docs/pilot-proposal-template.md",
  "app/pricing/page.tsx",
] as const;

export const PRICING_SKU_P3_135_HONESTY_MARKERS = [
  "0 signed LOIs",
  "qualified beta",
  "LOI/SOW",
  "baseline",
  "not production-certified",
] as const;

export const PRICING_SKU_P3_135_WIRING_PATHS = [
  PRICING_SKU_P3_135_DOC,
  "lib/pm/pricing-sku-p3-135-policy.ts",
  "lib/pm/pricing-sku-p3-135-operations.ts",
  "lib/pm/pricing-sku-p3-135-audit.ts",
  PRICING_SKU_P3_135_ARTIFACT,
  PRICING_SKU_P3_135_UNIT_TEST,
  PRICING_SKU_P3_135_IMPLEMENTATION_SOURCE,
  PRICING_SKU_P3_135_BILLING_SOURCE,
] as const;
