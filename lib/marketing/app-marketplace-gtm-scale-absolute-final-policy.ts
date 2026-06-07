/**
 * Absolute Final Task 134 — app marketplace GTM scale (feature 89).
 *
 * @see components/marketing/app-marketplace-third-party.tsx
 * @see lib/platform/app-marketplace-third-party-absolute-final-policy.ts
 */

export const APP_MARKETPLACE_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "app-marketplace-gtm-scale-absolute-final-v1" as const;

export const APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH =
  "components/marketing/app-marketplace-third-party.tsx" as const;

export const APP_MARKETPLACE_GTM_SCALE_CONTENT_PATH =
  "lib/marketing/app-marketplace-gtm-scale-content.ts" as const;

export const APP_MARKETPLACE_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "ROADMAP",
  "platform review",
  "not a self-serve",
  "Illustrative",
  "sales-safe",
] as const;

export const APP_MARKETPLACE_GTM_SCALE_WIRING_PATHS = [
  APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH,
  APP_MARKETPLACE_GTM_SCALE_CONTENT_PATH,
  "lib/platform/app-marketplace-third-party-absolute-final-policy.ts",
  "lib/marketing/app-marketplace-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/app-marketplace-gtm-scale-audit.ts",
  "tests/unit/app-marketplace-third-party-absolute-final.test.ts",
] as const;
