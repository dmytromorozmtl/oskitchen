/**
 * Blueprint P1-79 / P1-23 — ICP SEO landing pages (canonical routes + pilot highlights).
 *
 * @see docs/icp-landing-pages.md
 */

export const ICP_LANDING_PAGES_POLICY_ID = "icp-landing-pages-p1-79-v1" as const;

export const ICP_PILOT_HIGHLIGHTS_POLICY_ID = "icp-pilot-highlights-p1-23-v1" as const;

export const ICP_PILOT_HIGHLIGHTS_CHECK_NPM_SCRIPT = "check:icp-landing-pages" as const;

export const ICP_LANDING_PAGES_DOC = "docs/icp-landing-pages.md" as const;

export const ICP_LANDING_PAGES_AUDIT_SCRIPT = "scripts/audit-icp-landing-pages.ts" as const;

export const ICP_LANDING_PAGES_NPM_SCRIPT = "audit:icp-landing-pages" as const;

export const ICP_LANDING_PAGES_UNIT_TEST = "tests/unit/icp-landing-pages.test.ts" as const;

export const ICP_LANDING_PAGES_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const MEAL_PREP_SOFTWARE_ICP_PATH = "/meal-prep-software" as const;

export const GHOST_KITCHEN_SOFTWARE_ICP_PATH = "/ghost-kitchen-software" as const;

export const COMMISSARY_SOFTWARE_ICP_PATH = "/commissary-kitchen-software" as const;

export const ICP_LANDING_PAGE_ENTRIES = [
  {
    id: "meal-prep",
    path: MEAL_PREP_SOFTWARE_ICP_PATH,
    pagePath: "app/meal-prep-software/page.tsx",
    contentPath: "lib/marketing/meal-prep-software-landing-content.ts",
    componentPath: "components/marketing/meal-prep-software-landing.tsx",
    pathConstant: "MEAL_PREP_SOFTWARE_LANDING_PATH",
    testId: "meal-prep-software-landing",
  },
  {
    id: "ghost-kitchen",
    path: GHOST_KITCHEN_SOFTWARE_ICP_PATH,
    pagePath: "app/ghost-kitchen-software/page.tsx",
    contentPath: "lib/marketing/ghost-kitchen-landing-content.ts",
    componentPath: "components/marketing/ghost-kitchen-landing.tsx",
    pathConstant: "GHOST_KITCHEN_LANDING_PATH",
    testId: "ghost-kitchen-landing",
  },
  {
    id: "commissary",
    path: COMMISSARY_SOFTWARE_ICP_PATH,
    pagePath: "app/commissary-kitchen-software/page.tsx",
    contentPath: "lib/marketing/commissary-kitchen-software-landing-content.ts",
    componentPath: "components/marketing/commissary-kitchen-software-landing.tsx",
    pathConstant: "COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH",
    testId: "commissary-kitchen-software-landing",
  },
] as const;

export const ICP_LANDING_LEGACY_REDIRECTS = [
  { from: "/landing/ghost-kitchen", to: GHOST_KITCHEN_SOFTWARE_ICP_PATH, legacyPagePath: "app/landing/ghost-kitchen/page.tsx" },
  { from: "/commissary-software", to: COMMISSARY_SOFTWARE_ICP_PATH, legacyPagePath: "app/commissary-software/page.tsx" },
] as const;

export const ICP_PILOT_HIGHLIGHTS_LANDING_IDS = ["meal-prep", "ghost-kitchen"] as const;

export const ICP_LANDING_PAGES_WIRING_PATHS = [
  ICP_LANDING_PAGES_DOC,
  "lib/marketing/icp-landing-pages-policy.ts",
  "lib/marketing/icp-landing-pages-audit.ts",
  "lib/marketing/icp-pilot-highlights-content.ts",
  "components/marketing/icp-pilot-highlights-section.tsx",
  ICP_LANDING_PAGES_UNIT_TEST,
  ...ICP_LANDING_PAGE_ENTRIES.flatMap((entry) => [
    entry.pagePath,
    entry.contentPath,
    entry.componentPath,
  ]),
] as const;
