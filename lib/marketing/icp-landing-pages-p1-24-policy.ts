/**
 * P1-24 — ICP landing pages optimized for operator pain points.
 *
 * @see docs/icp-landing-pages-p1-24.md
 */

export const ICP_LANDING_PAGES_P1_24_POLICY_ID = "icp-landing-pages-p1-24-v1" as const;

export const ICP_LANDING_PAGES_P1_24_DOC = "docs/icp-landing-pages-p1-24.md" as const;

export const ICP_LANDING_PAGES_P1_24_ARTIFACT =
  "artifacts/icp-landing-pages-p1-24.json" as const;

export const ICP_LANDING_PAGES_P1_24_CONTENT_MODULE =
  "lib/marketing/icp-landing-pages-p1-24-content.ts" as const;

export const ICP_LANDING_PAGES_P1_24_BRIDGE_COMPONENT =
  "components/marketing/icp-pain-solution-bridge-section.tsx" as const;

export const ICP_LANDING_PAGES_P1_24_CHECK_NPM_SCRIPT =
  "check:icp-landing-pages-p1-24" as const;

export const ICP_LANDING_PAGES_P1_24_CI_NPM_SCRIPT =
  "test:ci:icp-landing-pages-p1-24" as const;

export const ICP_LANDING_PAGES_P1_24_UNIT_TEST =
  "tests/unit/icp-landing-pages-p1-24.test.ts" as const;

export const ICP_LANDING_PAGES_P1_24_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const ICP_LANDING_PAGES_P1_24_ENTRIES = [
  {
    id: "meal-prep" as const,
    path: "/meal-prep-software" as const,
    pagePath: "app/meal-prep-software/page.tsx" as const,
    contentPath: "lib/marketing/meal-prep-software-landing-content.ts" as const,
    componentPath: "components/marketing/meal-prep-software-landing.tsx" as const,
    bridgeTestId: "icp-pain-solution-bridge-meal-prep-p1-24" as const,
  },
  {
    id: "ghost-kitchen" as const,
    path: "/ghost-kitchen-software" as const,
    pagePath: "app/ghost-kitchen-software/page.tsx" as const,
    contentPath: "lib/marketing/ghost-kitchen-landing-content.ts" as const,
    componentPath: "components/marketing/ghost-kitchen-landing.tsx" as const,
    bridgeTestId: "icp-pain-solution-bridge-ghost-kitchen-p1-24" as const,
  },
] as const;

export const ICP_LANDING_PAGES_P1_24_PAIN_MARKERS = [
  "symptom",
  "operatorCost",
  "solution",
] as const;

export const ICP_LANDING_PAGES_P1_24_HERO_PAIN_MARKERS = [
  "spreadsheet",
  "mispack",
  "cutoff",
  "tablet",
  "margin",
  "brand",
] as const;

export const ICP_LANDING_PAGES_P1_24_WIRING_PATHS = [
  ICP_LANDING_PAGES_P1_24_DOC,
  ICP_LANDING_PAGES_P1_24_CONTENT_MODULE,
  ICP_LANDING_PAGES_P1_24_BRIDGE_COMPONENT,
  ICP_LANDING_PAGES_P1_24_UNIT_TEST,
  ICP_LANDING_PAGES_P1_24_ARTIFACT,
  ICP_LANDING_PAGES_P1_24_CI_WORKFLOW,
  ...ICP_LANDING_PAGES_P1_24_ENTRIES.flatMap((e) => [
    e.pagePath,
    e.contentPath,
    e.componentPath,
  ]),
] as const;
