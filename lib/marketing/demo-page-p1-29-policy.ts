/**
 * Blueprint P1-29 — Demo page interactive sandbox workspace with Integration Health.
 *
 * @see docs/demo-page-p1-29.md
 */

export const DEMO_PAGE_P1_29_POLICY_ID = "demo-page-p1-29-v1" as const;

export const DEMO_PAGE_P1_29_DOC = "docs/demo-page-p1-29.md" as const;

export const DEMO_PAGE_P1_29_ROUTE = "/demo" as const;

export const DEMO_PAGE_P1_29_COMPONENT =
  "components/marketing/demo-interactive-sandbox-workspace.tsx" as const;

export const DEMO_PAGE_P1_29_CONTENT_PATH =
  "lib/marketing/demo-page-p1-29-content.ts" as const;

export const DEMO_PAGE_P1_29_PAGE = "app/demo/page.tsx" as const;

export const DEMO_PAGE_P1_29_SANDBOX_TEST_ID = "demo-interactive-sandbox-workspace" as const;

export const DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID =
  "demo-sandbox-integration-health" as const;

export const DEMO_PAGE_P1_29_CHANNEL_COUNT = 6 as const;

export const DEMO_PAGE_P1_29_WORKSPACE_STOP_COUNT = 5 as const;

export const DEMO_PAGE_P1_29_HEADLINE =
  "Interactive sandbox workspace — click Integration Health before you launch" as const;

export const DEMO_PAGE_P1_29_HONESTY_MARKERS = [
  "simulated",
  "BETA",
  "SKIPPED",
  "verify",
  "honest",
] as const;

export const DEMO_PAGE_P1_29_AUDIT_SCRIPT = "scripts/audit-demo-page-p1-29.ts" as const;

export const DEMO_PAGE_P1_29_NPM_SCRIPT = "audit:demo-page" as const;

export const DEMO_PAGE_P1_29_CHECK_NPM_SCRIPT = "check:demo-page" as const;

export const DEMO_PAGE_P1_29_UNIT_TEST = "tests/unit/demo-page-p1-29.test.ts" as const;

export const DEMO_PAGE_P1_29_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const DEMO_PAGE_P1_29_WIRING_PATHS = [
  DEMO_PAGE_P1_29_DOC,
  DEMO_PAGE_P1_29_CONTENT_PATH,
  DEMO_PAGE_P1_29_COMPONENT,
  DEMO_PAGE_P1_29_PAGE,
  "lib/marketing/demo-page-p1-29-policy.ts",
  "lib/marketing/demo-page-p1-29-audit.ts",
  DEMO_PAGE_P1_29_UNIT_TEST,
] as const;
