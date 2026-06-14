/**
 * P3-99 — Not-found.tsx audit across all app verticals.
 *
 * Builds on P1-33 (3 segments) and P3-79 (regression gate); expands to 8 verticals.
 *
 * @see docs/not-found-audit-p3-99.md
 */

export const NOT_FOUND_AUDIT_P3_99_POLICY_ID = "not-found-audit-p3-99-v1" as const;

export const NOT_FOUND_AUDIT_P3_99_DOC = "docs/not-found-audit-p3-99.md" as const;

export const NOT_FOUND_AUDIT_P3_99_ARTIFACT = "artifacts/not-found-audit-p3-99.json" as const;

export const NOT_FOUND_AUDIT_P3_99_AUDIT_MODULE =
  "lib/frontend/not-found-audit-p3-99-audit.ts" as const;

export const NOT_FOUND_AUDIT_P3_99_SCORING_MODULE =
  "lib/frontend/not-found-audit-p3-99-scoring.ts" as const;

export const NOT_FOUND_AUDIT_P3_99_CHECK_NPM_SCRIPT = "check:not-found-audit-p3-99" as const;

export const NOT_FOUND_AUDIT_P3_99_UNIT_TEST = "tests/unit/not-found-audit-p3-99.test.ts" as const;

export const NOT_FOUND_AUDIT_P3_99_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const NOT_FOUND_AUDIT_P3_99_ROOT_FALLBACK = "app/not-found.tsx" as const;

export const NOT_FOUND_AUDIT_P3_99_UPSTREAM_POLICY = "segment-not-found-p3-79-v1" as const;

export const NOT_FOUND_AUDIT_P3_99_UPSTREAM_ARTIFACT =
  "artifacts/segment-not-found-p3-79.json" as const;

export const NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT = 8 as const;

export const NOT_FOUND_AUDIT_P3_99_SCENARIO_COUNT = 8 as const;

export type NotFoundAuditP399Segment = {
  id:
    | "dashboard"
    | "vendor"
    | "storefront"
    | "platform"
    | "onboarding"
    | "help"
    | "q"
    | "integrations";
  path: string;
  testId: string;
  primaryHref: string;
  layoutPath?: string;
};

export const NOT_FOUND_AUDIT_P3_99_SEGMENTS: readonly NotFoundAuditP399Segment[] = [
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
  {
    id: "platform",
    path: "app/platform/not-found.tsx",
    testId: "segment-not-found-platform",
    primaryHref: "/platform/dashboard",
    layoutPath: "app/platform/layout.tsx",
  },
  {
    id: "onboarding",
    path: "app/onboarding/not-found.tsx",
    testId: "segment-not-found-onboarding",
    primaryHref: "/onboarding",
    layoutPath: "app/onboarding/layout.tsx",
  },
  {
    id: "help",
    path: "app/help/not-found.tsx",
    testId: "segment-not-found-help",
    primaryHref: "/help",
    layoutPath: "app/help/layout.tsx",
  },
  {
    id: "q",
    path: "app/q/not-found.tsx",
    testId: "segment-not-found-q",
    primaryHref: "/",
    layoutPath: "app/q/layout.tsx",
  },
  {
    id: "integrations",
    path: "app/integrations/not-found.tsx",
    testId: "segment-not-found-integrations",
    primaryHref: "/integrations",
    layoutPath: "app/integrations/layout.tsx",
  },
] as const;

export const NOT_FOUND_AUDIT_P3_99_WIRING_PATHS = [
  NOT_FOUND_AUDIT_P3_99_DOC,
  NOT_FOUND_AUDIT_P3_99_ARTIFACT,
  NOT_FOUND_AUDIT_P3_99_AUDIT_MODULE,
  NOT_FOUND_AUDIT_P3_99_SCORING_MODULE,
  NOT_FOUND_AUDIT_P3_99_UNIT_TEST,
  NOT_FOUND_AUDIT_P3_99_CI_WORKFLOW,
  NOT_FOUND_AUDIT_P3_99_ROOT_FALLBACK,
  NOT_FOUND_AUDIT_P3_99_UPSTREAM_ARTIFACT,
  "lib/frontend/segment-not-found-p3-79-policy.ts",
  "tests/unit/segment-not-found-p3-79.test.ts",
  ...NOT_FOUND_AUDIT_P3_99_SEGMENTS.map((segment) => segment.path),
] as const;
