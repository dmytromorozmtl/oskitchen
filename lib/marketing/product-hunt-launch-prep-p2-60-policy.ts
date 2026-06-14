/**
 * P2-60 — Product Hunt launch prep: assets, copy, checklist.
 *
 * @see docs/product-hunt-launch-prep-p2-60.md
 * @see docs/product-hunt-launch-prep.md
 */

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID =
  "product-hunt-launch-prep-p2-60-v1" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_DOC =
  "docs/product-hunt-launch-prep-p2-60.md" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARTIFACT =
  "artifacts/product-hunt-launch-prep-p2-60.json" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_CONTENT_MODULE =
  "lib/marketing/product-hunt-launch-prep-p2-60-content.ts" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_AUDIT_MODULE =
  "lib/marketing/product-hunt-launch-prep-p2-60-audit.ts" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_CHECK_NPM_SCRIPT =
  "check:product-hunt-launch-prep-p2-60" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_CI_NPM_SCRIPT =
  "test:ci:product-hunt-launch-prep-p2-60" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_UNIT_TEST =
  "tests/unit/product-hunt-launch-prep-p2-60.test.ts" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_PLAYBOOK_DOC =
  "docs/product-hunt-launch-prep.md" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_DEFER_DOC =
  "docs/product-hunt-launch-defer.md" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR =
  "artifacts/product-hunt-launch" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_DRAFT =
  "artifacts/product-hunt-launch/listing-draft.md" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_MAKER_COMMENT =
  "artifacts/product-hunt-launch/listing-maker-comment.md" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_UPSTREAM_POLICY_ID =
  "product-hunt-launch-prep-p3-65-v1" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_TIMELINE_HEADINGS = [
  "T-30 days",
  "T-14 days",
  "T-7 days",
  "T-1 day",
  "Launch day",
  "T+7 days",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_HONESTY_MARKERS = [
  "BETA",
  "DEFER",
  "0 forbidden hits",
  "design partner",
  "do not submit",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_WIRING_PATHS = [
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARTIFACT,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_AUDIT_MODULE,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_CONTENT_MODULE,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_UNIT_TEST,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_CI_WORKFLOW,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_PLAYBOOK_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_DEFER_DOC,
  `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/README.md`,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_DRAFT,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_MAKER_COMMENT,
  "docs/sales-safe-claims-registry.md",
] as const;
