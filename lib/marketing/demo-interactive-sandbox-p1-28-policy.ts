/**
 * P1-28 — Demo page interactive sandbox with test credentials + LIVE integrations.
 *
 * @see docs/demo-interactive-sandbox-p1-28.md
 */

export const DEMO_INTERACTIVE_SANDBOX_P1_28_POLICY_ID =
  "demo-interactive-sandbox-p1-28-v1" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_DOC =
  "docs/demo-interactive-sandbox-p1-28.md" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_ARTIFACT =
  "artifacts/demo-interactive-sandbox-p1-28.json" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_CONTENT =
  "lib/marketing/demo-interactive-sandbox-p1-28-content.ts" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_COMPONENT =
  "components/marketing/demo-test-credentials-panel.tsx" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_SANDBOX_COMPONENT =
  "components/marketing/demo-interactive-sandbox-workspace.tsx" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_PAGE = "app/demo/page.tsx" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_TEST_ID =
  "demo-test-credentials-p1-28" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_CHECK_NPM_SCRIPT =
  "check:demo-interactive-sandbox-p1-28" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_CI_NPM_SCRIPT =
  "test:ci:demo-interactive-sandbox-p1-28" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_UNIT_TEST =
  "tests/unit/demo-interactive-sandbox-p1-28.test.ts" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_LIVE_CHANNEL_IDS = [
  "shopify",
  "woocommerce",
  "storefront",
  "pos",
] as const;

export const DEMO_INTERACTIVE_SANDBOX_P1_28_WIRING_PATHS = [
  DEMO_INTERACTIVE_SANDBOX_P1_28_DOC,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CONTENT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_COMPONENT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_SANDBOX_COMPONENT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_PAGE,
  DEMO_INTERACTIVE_SANDBOX_P1_28_UNIT_TEST,
  DEMO_INTERACTIVE_SANDBOX_P1_28_ARTIFACT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CI_WORKFLOW,
] as const;
