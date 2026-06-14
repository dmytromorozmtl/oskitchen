/**
 * P3-79 — Segment-level not-found.tsx: dashboard/, vendor/, s/* verification gate.
 *
 * Builds on P1-33 implementation; locks regression coverage in CI.
 *
 * @see docs/segment-not-found-p3-79.md
 */

export const SEGMENT_NOT_FOUND_P3_79_POLICY_ID = "segment-not-found-p3-79-v1" as const;

export const SEGMENT_NOT_FOUND_P3_79_DOC = "docs/segment-not-found-p3-79.md" as const;

export const SEGMENT_NOT_FOUND_P3_79_ARTIFACT = "artifacts/segment-not-found-p3-79.json" as const;

export const SEGMENT_NOT_FOUND_P3_79_AUDIT_MODULE =
  "lib/frontend/segment-not-found-p3-79-audit.ts" as const;

export const SEGMENT_NOT_FOUND_P3_79_SCORING_MODULE =
  "lib/frontend/segment-not-found-p3-79-scoring.ts" as const;

export const SEGMENT_NOT_FOUND_P3_79_SCENARIO_COUNT = 6 as const;

export const SEGMENT_NOT_FOUND_P3_79_CHECK_NPM_SCRIPT = "check:segment-not-found-p3-79" as const;

export const SEGMENT_NOT_FOUND_P3_79_UNIT_TEST =
  "tests/unit/segment-not-found-p3-79.test.ts" as const;

export const SEGMENT_NOT_FOUND_P3_79_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const SEGMENT_NOT_FOUND_P3_79_UPSTREAM_POLICY = "segment-level-not-found-p1-33-v1" as const;

export const SEGMENT_NOT_FOUND_P3_79_UPSTREAM_ARTIFACT =
  "artifacts/segment-level-not-found-p1-33.json" as const;

export const SEGMENT_NOT_FOUND_P3_79_ROOT_FALLBACK = "app/not-found.tsx" as const;

export type SegmentNotFoundP379Segment = {
  id: "dashboard" | "vendor" | "storefront";
  path: string;
  testId: string;
  primaryHref: string;
  layoutPath?: string;
};

export const SEGMENT_NOT_FOUND_P3_79_SEGMENTS: readonly SegmentNotFoundP379Segment[] = [
  {
    id: "dashboard",
    path: "app/dashboard/not-found.tsx",
    testId: "segment-not-found-dashboard",
    primaryHref: "/dashboard/today",
    layoutPath: "app/dashboard/layout.tsx",
  },
  {
    id: "vendor",
    path: "app/vendor/not-found.tsx",
    testId: "segment-not-found-vendor",
    primaryHref: "/vendor/dashboard",
    layoutPath: "app/vendor/layout.tsx",
  },
  {
    id: "storefront",
    path: "app/s/not-found.tsx",
    testId: "segment-not-found-storefront",
    primaryHref: "/",
  },
] as const;

export const SEGMENT_NOT_FOUND_P3_79_WIRING_PATHS = [
  SEGMENT_NOT_FOUND_P3_79_DOC,
  SEGMENT_NOT_FOUND_P3_79_ARTIFACT,
  SEGMENT_NOT_FOUND_P3_79_AUDIT_MODULE,
  SEGMENT_NOT_FOUND_P3_79_SCORING_MODULE,
  SEGMENT_NOT_FOUND_P3_79_UNIT_TEST,
  SEGMENT_NOT_FOUND_P3_79_CI_WORKFLOW,
  SEGMENT_NOT_FOUND_P3_79_ROOT_FALLBACK,
  SEGMENT_NOT_FOUND_P3_79_UPSTREAM_ARTIFACT,
  "lib/frontend/segment-level-not-found-p1-33-policy.ts",
  "tests/unit/segment-level-not-found-p1-33.test.ts",
  ...SEGMENT_NOT_FOUND_P3_79_SEGMENTS.map((segment) => segment.path),
] as const;
