/**
 * Blueprint P1-80 — Competitor alternative SEO landing pages.
 *
 * @see docs/competitor-alternative-pages.md
 */

export const COMPETITOR_ALTERNATIVE_PAGES_POLICY_ID =
  "competitor-alternative-pages-p1-80-v1" as const;

export const COMPETITOR_ALTERNATIVE_PAGES_DOC = "docs/competitor-alternative-pages.md" as const;

export const COMPETITOR_ALTERNATIVE_PAGES_AUDIT_SCRIPT =
  "scripts/audit-competitor-alternative-pages.ts" as const;

export const COMPETITOR_ALTERNATIVE_PAGES_NPM_SCRIPT =
  "audit:competitor-alternative-pages" as const;

export const COMPETITOR_ALTERNATIVE_PAGES_UNIT_TEST =
  "tests/unit/competitor-alternative-pages.test.ts" as const;

export const COMPETITOR_ALTERNATIVE_PAGES_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const COMPETITOR_ALTERNATIVE_SLUGS = [
  "toast",
  "square",
  "marketman",
  "marginedge",
  "restaurant365",
] as const;

export type CompetitorAlternativeSlug = (typeof COMPETITOR_ALTERNATIVE_SLUGS)[number];

export const COMPETITOR_ALTERNATIVE_PAGES = [
  {
    slug: "toast" as const,
    path: "/toast-alternative" as const,
    pagePath: "app/toast-alternative/page.tsx",
    compareSlug: "toast" as const,
    positioningSection: "ToastPositioningSection",
    primaryLineConstant: "TOAST_POSITIONING_PRIMARY_LINE",
  },
  {
    slug: "square" as const,
    path: "/square-alternative" as const,
    pagePath: "app/square-alternative/page.tsx",
    compareSlug: "square" as const,
    positioningSection: "SquarePositioningSection",
    primaryLineConstant: "SQUARE_POSITIONING_PRIMARY_LINE",
  },
  {
    slug: "marketman" as const,
    path: "/marketman-alternative" as const,
    pagePath: "app/marketman-alternative/page.tsx",
    compareSlug: "marketman" as const,
    positioningSection: "MarketmanPositioningSection",
    primaryLineConstant: "MARKETMAN_POSITIONING_PRIMARY_LINE",
  },
  {
    slug: "marginedge" as const,
    path: "/marginedge-alternative" as const,
    pagePath: "app/marginedge-alternative/page.tsx",
    compareSlug: "marginedge" as const,
    positioningSection: "MarginedgePositioningSection",
    primaryLineConstant: "MARGINEDGE_POSITIONING_PRIMARY_LINE",
  },
  {
    slug: "restaurant365" as const,
    path: "/restaurant365-alternative" as const,
    pagePath: "app/restaurant365-alternative/page.tsx",
    compareSlug: "restaurant365" as const,
    positioningSection: null,
    primaryLineConstant: null,
  },
] as const;

export const COMPETITOR_ALTERNATIVE_HONESTY_MARKERS = [
  "wins",
  "verify",
  "not affiliated",
  "typical",
  "BETA",
] as const;

export const COMPETITOR_ALTERNATIVE_PAGES_WIRING_PATHS = [
  COMPETITOR_ALTERNATIVE_PAGES_DOC,
  "lib/marketing/competitor-alternative-pages-policy.ts",
  "lib/marketing/competitor-alternative-pages-content.ts",
  "lib/marketing/competitor-alternative-pages-audit.ts",
  "components/marketing/competitor-alternative-landing.tsx",
  COMPETITOR_ALTERNATIVE_PAGES_UNIT_TEST,
  ...COMPETITOR_ALTERNATIVE_PAGES.map((entry) => entry.pagePath),
] as const;
