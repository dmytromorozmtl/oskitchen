/**
 * Absolute Final Task 71 — free pilot tier program for first 5 restaurants.
 *
 * @see docs/free-pilot-tier-program.md
 * @see docs/loi-signed.md
 */

export const FREE_PILOT_TIER_PROGRAM_ABSOLUTE_FINAL_POLICY_ID =
  "free-pilot-tier-program-absolute-final-v1" as const;

export const FREE_PILOT_TIER_PROGRAM_DOC = "docs/free-pilot-tier-program.md" as const;

export const FREE_PILOT_TIER_LOI_GATE_DOC = "docs/loi-signed.md" as const;

export const FREE_PILOT_TIER_ICP_DOC = "docs/icp-definition-final.md" as const;

export const FREE_PILOT_TIER_MAX_SLOTS = 5 as const;

export const FREE_PILOT_TIER_TERM_DAYS = 90 as const;

export const FREE_PILOT_TIER_PLANS = ["PRO", "TEAM"] as const;

export const FREE_PILOT_TIER_REQUIRED_SECTIONS = [
  "## Program summary",
  "## Eligibility",
  "## Included in free pilot tier",
  "## Operator obligations",
  "## Human gate checklist",
  "## Slot tracker",
  "## Conversion at day 90",
  "## Sales-safe wording",
] as const;

export const FREE_PILOT_TIER_REQUIRED_HEADINGS = [
  "Max slots",
  "90 calendar days",
  "Hard disqualifiers",
  "Operator obligations",
  "Human gate checklist",
  "Slot tracker",
  "Conversion at day 90",
  "Do not say",
] as const;

export const FREE_PILOT_TIER_HONESTY_MARKERS = [
  "Honesty rule",
  "not free forever",
  "5",
  "BETA",
  "Do not claim",
] as const;

export const FREE_PILOT_TIER_FORBIDDEN_CLAIMS = [
  "Free for all restaurants",
  "Free forever",
  "Production certified",
  "Thousands of operators",
] as const;

export const FREE_PILOT_TIER_WIRING_PATHS = [
  FREE_PILOT_TIER_PROGRAM_DOC,
  FREE_PILOT_TIER_LOI_GATE_DOC,
  FREE_PILOT_TIER_ICP_DOC,
  "lib/commercial/free-pilot-tier-program-absolute-final-policy.ts",
  "lib/commercial/free-pilot-tier-program-audit.ts",
  "tests/unit/free-pilot-tier-program-absolute-final.test.ts",
] as const;

export const FREE_PILOT_TIER_UNIT_TEST =
  "tests/unit/free-pilot-tier-program-absolute-final.test.ts" as const;

export const FREE_PILOT_TIER_CI_SCRIPTS = [
  "test:ci:free-pilot-tier-program",
  "test:ci:free-pilot-tier-program:cert",
] as const;

export const FREE_PILOT_TIER_UPSTREAM_POLICIES = [
  "loi-pipeline-icp-absolute-final-v1",
  "era17-pilot-icp-contract-v1",
] as const;
