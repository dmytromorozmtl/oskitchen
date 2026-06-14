/**
 * P3-93 — Field sales / local rep network deferred; digital-only GTM.
 *
 * @see docs/field-sales-deferral-p3-93.md
 * @see lib/marketing/public-roadmap-content.ts
 */

export const FIELD_SALES_DEFERRAL_P3_93_POLICY_ID =
  "field-sales-deferral-p3-93-v1" as const;

export const FIELD_SALES_DEFERRAL_P3_93_DOC = "docs/field-sales-deferral-p3-93.md" as const;

export const FIELD_SALES_DEFERRAL_P3_93_ARTIFACT =
  "artifacts/field-sales-deferral-p3-93.json" as const;

export const FIELD_SALES_DEFERRAL_P3_93_CONTENT_MODULE =
  "lib/marketing/field-sales-deferral-p3-93-content.ts" as const;

export const FIELD_SALES_DEFERRAL_P3_93_AUDIT_MODULE =
  "lib/marketing/field-sales-deferral-p3-93-audit.ts" as const;

export const FIELD_SALES_DEFERRAL_P3_93_CHECK_NPM_SCRIPT =
  "check:field-sales-deferral-p3-93" as const;

export const FIELD_SALES_DEFERRAL_P3_93_UNIT_TEST =
  "tests/unit/field-sales-deferral-p3-93.test.ts" as const;

export const FIELD_SALES_DEFERRAL_P3_93_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const FIELD_SALES_DEFERRAL_P3_93_ROADMAP_ITEM_ID = "field-sales" as const;

export const FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_ROADMAP =
  "lib/marketing/public-roadmap-content.ts" as const;

export const FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_PRODUCT_ROADMAP =
  "docs/PRODUCT_ROADMAP_2026.md" as const;

export const FIELD_SALES_DEFERRAL_P3_93_WIRING_PATHS = [
  FIELD_SALES_DEFERRAL_P3_93_DOC,
  FIELD_SALES_DEFERRAL_P3_93_ARTIFACT,
  FIELD_SALES_DEFERRAL_P3_93_CONTENT_MODULE,
  FIELD_SALES_DEFERRAL_P3_93_AUDIT_MODULE,
  FIELD_SALES_DEFERRAL_P3_93_UNIT_TEST,
  FIELD_SALES_DEFERRAL_P3_93_CI_WORKFLOW,
  FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_ROADMAP,
  FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_PRODUCT_ROADMAP,
] as const;
