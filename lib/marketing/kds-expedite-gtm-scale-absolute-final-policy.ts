/**
 * Absolute Final Task 139 — KDS expedite screen GTM scale (feature 94).
 *
 * @see docs/kds-expedite-gtm-scale.md
 * @see components/kitchen/kds-expedite-screen.tsx
 */

export const KDS_EXPEDITE_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "kds-expedite-gtm-scale-absolute-final-v1" as const;

export const KDS_EXPEDITE_GTM_SCALE_DOC_PATH = "docs/kds-expedite-gtm-scale.md" as const;

export const KDS_EXPEDITE_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "not rush-hour certified",
  "priority routing",
  "Expedite screen",
  "sales-safe",
] as const;

export const KDS_EXPEDITE_GTM_SCALE_WIRING_PATHS = [
  KDS_EXPEDITE_GTM_SCALE_DOC_PATH,
  "components/kitchen/kds-expedite-screen.tsx",
  "lib/kitchen/kds-expedite-screen-absolute-final-policy.ts",
  "lib/marketing/kds-expedite-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/kds-expedite-gtm-scale-audit.ts",
  "tests/unit/kds-expedite-screen-absolute-final.test.ts",
] as const;
