/**
 * Absolute Final Task 145 — driver ETA tracking in KDS GTM scale (feature 100).
 *
 * @see docs/kds-driver-eta-gtm-scale.md
 * @see components/kitchen/kds-driver-eta-screen.tsx
 */

export const KDS_DRIVER_ETA_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "kds-driver-eta-gtm-scale-absolute-final-v1" as const;

export const KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH = "docs/kds-driver-eta-gtm-scale.md" as const;

export const KDS_DRIVER_ETA_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "estimated ETA",
  "not live GPS certified",
  "Do not claim",
  "Driver ETA",
  "sales-safe",
] as const;

export const KDS_DRIVER_ETA_GTM_SCALE_WIRING_PATHS = [
  KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH,
  "components/kitchen/kds-driver-eta-screen.tsx",
  "lib/kitchen/kds-driver-eta-tracking-absolute-final-policy.ts",
  "lib/marketing/kds-driver-eta-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/kds-driver-eta-gtm-scale-audit.ts",
  "tests/unit/kds-driver-eta-tracking-absolute-final.test.ts",
] as const;
