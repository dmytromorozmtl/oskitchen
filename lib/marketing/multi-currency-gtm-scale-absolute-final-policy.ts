/**
 * Absolute Final Task 131 — multi-currency GTM scale (feature 86).
 *
 * @see docs/multi-currency-gtm-scale.md
 * @see lib/finance/multi-currency-policy.ts
 */

export const MULTI_CURRENCY_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "multi-currency-gtm-scale-absolute-final-v1" as const;

export const MULTI_CURRENCY_GTM_SCALE_DOC_PATH = "docs/multi-currency-gtm-scale.md" as const;

export const MULTI_CURRENCY_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "Do not claim",
  "Lightspeed",
  "No FX conversion",
  "sales-safe",
] as const;

export const MULTI_CURRENCY_GTM_SCALE_WIRING_PATHS = [
  MULTI_CURRENCY_GTM_SCALE_DOC_PATH,
  "lib/finance/multi-currency-policy.ts",
  "lib/marketing/multi-currency-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/multi-currency-gtm-scale-audit.ts",
  "tests/unit/multi-currency-support.test.ts",
] as const;
