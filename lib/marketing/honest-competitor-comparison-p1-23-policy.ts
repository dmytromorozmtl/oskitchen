/**
 * P1-23 — Honest competitor comparison pages (LIVE-only OS Kitchen cells, no hardware rows).
 *
 * @see docs/honest-competitor-comparison-p1-23.md
 */

export const HONEST_COMPETITOR_COMPARISON_P1_23_POLICY_ID =
  "honest-competitor-comparison-p1-23-v1" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_DOC =
  "docs/honest-competitor-comparison-p1-23.md" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_ARTIFACT =
  "artifacts/honest-competitor-comparison-p1-23.json" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_COMPARE_CONTENT =
  "lib/marketing/compare-content.ts" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_CONTENT_MODULE =
  "lib/marketing/honest-competitor-comparison-p1-23-content.ts" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_COMPARE_LANDING =
  "components/marketing/compare-landing.tsx" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_CHECK_NPM_SCRIPT =
  "check:honest-competitor-comparison-p1-23" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_CI_NPM_SCRIPT =
  "test:ci:honest-competitor-comparison-p1-23" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_UNIT_TEST =
  "tests/unit/honest-competitor-comparison-p1-23.test.ts" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_TEST_ID =
  "honest-competitor-comparison-p1-23" as const;

/** Compare slugs governed by P1-23 honesty contract. */
export const HONEST_COMPETITOR_COMPARISON_P1_23_SLUGS = ["toast", "square", "lightspeed"] as const;

export type HonestCompetitorComparisonP123Slug =
  (typeof HONEST_COMPETITOR_COMPARISON_P1_23_SLUGS)[number];

export const HONEST_COMPETITOR_COMPARISON_P1_23_ENTRIES = [
  { slug: "toast" as const, path: "/compare/toast" as const, competitorLabel: "Toast" as const },
  { slug: "square" as const, path: "/compare/square" as const, competitorLabel: "Square" as const },
  {
    slug: "lightspeed" as const,
    path: "/compare/lightspeed" as const,
    competitorLabel: "Lightspeed" as const,
  },
] as const;

/** Phrases banned from P1-23 compare page matrices (hardware is out of scope). */
export const HONEST_COMPETITOR_COMPARISON_P1_23_HARDWARE_BANNED = [
  "Payment hardware",
  "hardware ecosystem",
  "terminal lease",
  "proprietary hardware",
  "Toast Go",
  "hardware lock-in",
  "Proprietary hardware",
  "BYO devices",
  "Stripe M2",
] as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_HONESTY_MARKERS = [
  "LIVE",
  "not affiliated",
  "verify",
  "Choose",
  "when",
  "SKIPPED",
] as const;

export const HONEST_COMPETITOR_COMPARISON_P1_23_WIRING_PATHS = [
  HONEST_COMPETITOR_COMPARISON_P1_23_DOC,
  HONEST_COMPETITOR_COMPARISON_P1_23_COMPARE_CONTENT,
  HONEST_COMPETITOR_COMPARISON_P1_23_CONTENT_MODULE,
  HONEST_COMPETITOR_COMPARISON_P1_23_COMPARE_LANDING,
  HONEST_COMPETITOR_COMPARISON_P1_23_UNIT_TEST,
  HONEST_COMPETITOR_COMPARISON_P1_23_ARTIFACT,
  HONEST_COMPETITOR_COMPARISON_P1_23_CI_WORKFLOW,
] as const;
