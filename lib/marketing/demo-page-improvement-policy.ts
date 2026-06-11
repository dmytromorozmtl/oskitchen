/**
 * Blueprint P1-83 — Demo page improvement (interactive sandbox + guided video tour).
 *
 * @see docs/demo-page-improvement.md
 * @see components/marketing/demo-guided-tour-section.tsx
 */

export const DEMO_PAGE_IMPROVEMENT_POLICY_ID = "demo-page-improvement-p1-83-v1" as const;

export const DEMO_PAGE_IMPROVEMENT_DOC = "docs/demo-page-improvement.md" as const;

export const DEMO_PAGE_IMPROVEMENT_CONTENT_PATH =
  "lib/marketing/demo-page-improvement-content.ts" as const;

export const DEMO_PAGE_IMPROVEMENT_COMPONENT =
  "components/marketing/demo-guided-tour-section.tsx" as const;

export const DEMO_PAGE_IMPROVEMENT_PAGE = "app/demo/page.tsx" as const;

export const DEMO_PAGE_IMPROVEMENT_ROUTE = "/demo" as const;

export const DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID = "demo-interactive-sandbox" as const;

export const DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID = "demo-guided-video-tour" as const;

export const DEMO_PAGE_IMPROVEMENT_HEADLINE =
  "Explore before you launch — interactive sandbox + guided tour" as const;

export const DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT = 5 as const;

export const DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT = 5 as const;

export const DEMO_PAGE_IMPROVEMENT_HONESTY_MARKERS = [
  "BETA",
  "simulated",
  "verify",
  "honest",
  "typical",
] as const;

export const DEMO_PAGE_IMPROVEMENT_AUDIT_SCRIPT =
  "scripts/audit-demo-page-improvement.ts" as const;

export const DEMO_PAGE_IMPROVEMENT_NPM_SCRIPT = "audit:demo-page-improvement" as const;

export const DEMO_PAGE_IMPROVEMENT_UNIT_TEST =
  "tests/unit/demo-page-improvement.test.ts" as const;

export const DEMO_PAGE_IMPROVEMENT_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const DEMO_PAGE_IMPROVEMENT_WIRING_PATHS = [
  DEMO_PAGE_IMPROVEMENT_DOC,
  DEMO_PAGE_IMPROVEMENT_CONTENT_PATH,
  DEMO_PAGE_IMPROVEMENT_COMPONENT,
  DEMO_PAGE_IMPROVEMENT_PAGE,
  "lib/marketing/demo-page-improvement-policy.ts",
  "lib/marketing/demo-page-improvement-audit.ts",
  DEMO_PAGE_IMPROVEMENT_UNIT_TEST,
  "docs/demo-video-script-5min.md",
] as const;
