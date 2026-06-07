/**
 * Absolute Final Task 132 — EU data residency GTM scale (feature 87).
 *
 * @see docs/eu-data-residency-gtm-scale.md
 * @see docs/eu-data-residency-roadmap.md
 */

export const EU_DATA_RESIDENCY_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "eu-data-residency-gtm-scale-absolute-final-v1" as const;

export const EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH =
  "docs/eu-data-residency-gtm-scale.md" as const;

export const EU_DATA_RESIDENCY_GTM_SCALE_HONESTY_MARKERS = [
  "Do **not** claim",
  "Not available",
  "US-primary",
  "~15%",
  "not GDPR certified",
  "sales-safe",
] as const;

export const EU_DATA_RESIDENCY_GTM_SCALE_WIRING_PATHS = [
  EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH,
  "docs/eu-data-residency-roadmap.md",
  "lib/compliance/eu-data-residency-roadmap-absolute-final-policy.ts",
  "lib/marketing/eu-data-residency-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/eu-data-residency-gtm-scale-audit.ts",
  "tests/unit/eu-data-residency-roadmap-absolute-final.test.ts",
] as const;
