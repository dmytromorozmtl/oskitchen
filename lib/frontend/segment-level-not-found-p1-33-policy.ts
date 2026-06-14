/**
 * P1-33 — Segment-level not-found.tsx for dashboard, vendor, and storefront.
 *
 * @see docs/segment-level-not-found-p1-33.md
 */

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_POLICY_ID =
  "segment-level-not-found-p1-33-v1" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_DOC =
  "docs/segment-level-not-found-p1-33.md" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_ARTIFACT =
  "artifacts/segment-level-not-found-p1-33.json" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_DASHBOARD =
  "app/dashboard/not-found.tsx" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_VENDOR =
  "app/vendor/not-found.tsx" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_STOREFRONT =
  "app/s/not-found.tsx" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_ROOT =
  "app/not-found.tsx" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_TEST_ID_PREFIX =
  "segment-not-found" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENT_TEST_IDS = {
  dashboard: "segment-not-found-dashboard",
  vendor: "segment-not-found-vendor",
  storefront: "segment-not-found-storefront",
} as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_CHECK_NPM_SCRIPT =
  "check:segment-level-not-found-p1-33" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_CI_NPM_SCRIPT =
  "test:ci:segment-level-not-found-p1-33" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_UNIT_TEST =
  "tests/unit/segment-level-not-found-p1-33.test.ts" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_SEGMENTS = [
  "dashboard",
  "vendor",
  "storefront",
] as const;

export const SEGMENT_LEVEL_NOT_FOUND_P1_33_WIRING_PATHS = [
  SEGMENT_LEVEL_NOT_FOUND_P1_33_DOC,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_DASHBOARD,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_VENDOR,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_STOREFRONT,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_UNIT_TEST,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_ARTIFACT,
  SEGMENT_LEVEL_NOT_FOUND_P1_33_CI_WORKFLOW,
] as const;
