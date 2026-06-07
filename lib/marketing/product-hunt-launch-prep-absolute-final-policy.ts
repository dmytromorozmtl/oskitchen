/**
 * Absolute Final Task 85 — Product Hunt launch prep playbook.
 *
 * @see docs/product-hunt-launch-prep.md
 * @see docs/product-hunt-launch-defer.md
 */

export const PRODUCT_HUNT_LAUNCH_PREP_ABSOLUTE_FINAL_POLICY_ID =
  "product-hunt-launch-prep-absolute-final-v1" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_DOC = "docs/product-hunt-launch-prep.md" as const;

export const PRODUCT_HUNT_LAUNCH_DEFER_DOC = "docs/product-hunt-launch-defer.md" as const;

export const PRODUCT_HUNT_LAUNCH_ARCHIVE_README =
  "artifacts/product-hunt-launch/README.md" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_SECTIONS = [
  "## Prep summary",
  "## T-minus timeline",
  "## Asset checklist",
  "## Listing copy",
  "## Hunter & supporter outreach",
  "## Launch day runbook",
  "## Metrics to track",
  "## Human gate checklist",
  "## Forbidden Product Hunt claims",
  "## Post-launch follow-up",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_HEADINGS = [
  "T-30 days",
  "T-14 days",
  "T-7 days",
  "T-1 day",
  "Launch day",
  "T+7 days",
  "Human gate checklist",
  "Honesty rule",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_HONESTY_MARKERS = [
  "Honesty rule",
  "BETA",
  "SKIPPED",
  "DEFER",
  "lintProductHuntLaunchDeferCopy",
  "Do not submit",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_FORBIDDEN_CLAIMS = [
  "Toast killer",
  "Thousands of restaurants",
  "All integrations live",
  "Guaranteed ROI",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_WIRING_PATHS = [
  PRODUCT_HUNT_LAUNCH_PREP_DOC,
  PRODUCT_HUNT_LAUNCH_DEFER_DOC,
  PRODUCT_HUNT_LAUNCH_ARCHIVE_README,
  "lib/marketing/product-hunt-launch-prep-absolute-final-policy.ts",
  "lib/marketing/product-hunt-launch-prep-audit.ts",
  "tests/unit/product-hunt-launch-prep-absolute-final.test.ts",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_UNIT_TEST =
  "tests/unit/product-hunt-launch-prep-absolute-final.test.ts" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_CI_SCRIPTS = [
  "test:ci:product-hunt-launch-prep",
  "test:ci:product-hunt-launch-prep:cert",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_UPSTREAM_POLICIES = [
  "product-hunt-launch-defer-mkt30-v1",
] as const;
