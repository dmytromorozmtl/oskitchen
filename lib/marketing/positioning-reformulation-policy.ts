/**
 * Blueprint P1-72 — Positioning reformulation.
 *
 * Canonical line: more than Square, without Toast hardware lock-in.
 *
 * @see docs/positioning-reformulation.md
 * @see components/marketing/positioning-reformulation-strip.tsx
 */

export const POSITIONING_REFORMULATION_POLICY_ID =
  "positioning-reformulation-p1-72-v1" as const;

export const POSITIONING_REFORMULATION_PRIMARY_LINE =
  "Built for operators who need more than Square but can't afford Toast's hardware lock-in." as const;

export const POSITIONING_REFORMULATION_DOC = "docs/positioning-reformulation.md" as const;

export const POSITIONING_REFORMULATION_LEGACY_DOC = "docs/POSITIONING.md" as const;

export const POSITIONING_REFORMULATION_CONTENT_PATH =
  "lib/marketing/positioning-reformulation-content.ts" as const;

export const POSITIONING_REFORMULATION_COMPONENT_PATH =
  "components/marketing/positioning-reformulation-strip.tsx" as const;

export const POSITIONING_REFORMULATION_HOME_LANDING =
  "components/marketing/home-landing.tsx" as const;

export const POSITIONING_REFORMULATION_STRIP_TEST_ID =
  "positioning-reformulation-strip" as const;

export const POSITIONING_REFORMULATION_SUPPORTING_PILLARS = [
  {
    id: "square_gap",
    title: "More than Square",
    body: "Enterprise depth — marketplace, invoice AI, multi-brand ops — without enterprise contracts or add-on sprawl.",
  },
  {
    id: "toast_gap",
    title: "Without Toast lock-in",
    body: "Browser-first POS on hardware you already own. Optional Stripe Terminal — no proprietary terminal lease.",
  },
  {
    id: "operator_truth",
    title: "Honest ops truth",
    body: "Integration Health shows PASS, SKIPPED, or FAILED — not fake green tiles that fail at rush hour.",
  },
] as const;

export const POSITIONING_REFORMULATION_HONESTY_MARKERS = [
  "BETA",
  "partner-gated",
  "no hardware lock-in",
  "not live today",
] as const;

export const POSITIONING_REFORMULATION_AUDIT_SCRIPT =
  "scripts/audit-positioning-reformulation.ts" as const;

export const POSITIONING_REFORMULATION_NPM_SCRIPT =
  "audit:positioning-reformulation" as const;

export const POSITIONING_REFORMULATION_UNIT_TEST =
  "tests/unit/positioning-reformulation.test.ts" as const;

export const POSITIONING_REFORMULATION_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const POSITIONING_REFORMULATION_WIRING_PATHS = [
  POSITIONING_REFORMULATION_DOC,
  POSITIONING_REFORMULATION_LEGACY_DOC,
  POSITIONING_REFORMULATION_CONTENT_PATH,
  POSITIONING_REFORMULATION_COMPONENT_PATH,
  POSITIONING_REFORMULATION_HOME_LANDING,
  "lib/marketing/positioning-reformulation-policy.ts",
  "lib/marketing/positioning-reformulation-audit.ts",
  POSITIONING_REFORMULATION_UNIT_TEST,
] as const;
