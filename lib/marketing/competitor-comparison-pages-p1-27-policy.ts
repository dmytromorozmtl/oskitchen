/**
 * Blueprint P1-27 — Competitor comparison pages (/compare/toast, /compare/square, /compare/lightspeed).
 *
 * @see docs/competitor-comparison-pages-p1-27.md
 */

export const COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID =
  "competitor-comparison-pages-p1-27-v1" as const;

export const COMPETITOR_COMPARISON_PAGES_P1_27_DOC =
  "docs/competitor-comparison-pages-p1-27.md" as const;

export const COMPETITOR_COMPARISON_PAGES_P1_27_AUDIT_SCRIPT =
  "scripts/audit-competitor-comparison-pages-p1-27.ts" as const;

export const COMPETITOR_COMPARISON_PAGES_P1_27_NPM_SCRIPT =
  "audit:competitor-comparison-pages" as const;

export const COMPETITOR_COMPARISON_PAGES_P1_27_CHECK_NPM_SCRIPT =
  "check:competitor-comparison-pages" as const;

export const COMPETITOR_COMPARISON_PAGES_P1_27_UNIT_TEST =
  "tests/unit/competitor-comparison-pages-p1-27.test.ts" as const;

export const COMPETITOR_COMPARISON_PAGES_P1_27_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const COMPETITOR_COMPARISON_P1_27_ENTRIES = [
  {
    slug: "toast" as const,
    path: "/compare/toast" as const,
    positioningSection: "ToastPositioningSection" as const,
    competitorLabel: "Toast" as const,
  },
  {
    slug: "square" as const,
    path: "/compare/square" as const,
    positioningSection: "SquarePositioningSection" as const,
    competitorLabel: "Square" as const,
  },
  {
    slug: "lightspeed" as const,
    path: "/compare/lightspeed" as const,
    positioningSection: "LightspeedPositioningSection" as const,
    competitorLabel: "Lightspeed" as const,
  },
] as const;

export const COMPETITOR_COMPARISON_P1_27_HONESTY_MARKERS = [
  "not affiliated",
  "verify",
  "Choose",
  "when",
  "BETA",
] as const;

export const COMPETITOR_COMPARISON_PAGES_P1_27_WIRING_PATHS = [
  COMPETITOR_COMPARISON_PAGES_P1_27_DOC,
  "lib/marketing/compare-content.ts",
  "lib/marketing/competitor-comparison-pages-p1-27-policy.ts",
  "lib/marketing/competitor-comparison-pages-p1-27-audit.ts",
  "components/marketing/compare-landing.tsx",
  "app/compare/[slug]/page.tsx",
  "app/compare/page.tsx",
  COMPETITOR_COMPARISON_PAGES_P1_27_UNIT_TEST,
  "docs/competitor-comparison-honest.md",
] as const;
