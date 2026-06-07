/**
 * Absolute Final Task 140 — white-label storefront depth GTM scale (feature 95).
 *
 * @see docs/white-label-storefront-gtm-scale.md
 * @see components/dashboard/storefront/white-label-storefront-depth-panel.tsx
 */

export const WHITE_LABEL_STOREFRONT_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "white-label-storefront-gtm-scale-absolute-final-v1" as const;

export const WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH =
  "docs/white-label-storefront-gtm-scale.md" as const;

export const WHITE_LABEL_STOREFRONT_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "SKIPPED",
  "ChowNow parity",
  "DNS is not automatic",
  "Do not promise custom domains",
  "sales-safe",
] as const;

export const WHITE_LABEL_STOREFRONT_GTM_SCALE_WIRING_PATHS = [
  WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH,
  "components/dashboard/storefront/white-label-storefront-depth-panel.tsx",
  "lib/storefront/white-label-storefront-depth-absolute-final-policy.ts",
  "lib/marketing/white-label-storefront-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/white-label-storefront-gtm-scale-audit.ts",
  "tests/unit/white-label-storefront-depth-absolute-final.test.ts",
] as const;
