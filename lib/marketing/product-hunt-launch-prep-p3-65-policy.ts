/**
 * Blueprint P3-65 — Product Hunt launch prep playbook.
 *
 * @see docs/product-hunt-launch-prep.md
 * @see docs/product-hunt-launch-prep-p3-65.md
 */

import {
  PRODUCT_HUNT_LAUNCH_PREP_ABSOLUTE_FINAL_POLICY_ID,
  PRODUCT_HUNT_LAUNCH_PREP_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_UNIT_TEST,
} from "@/lib/marketing/product-hunt-launch-prep-absolute-final-policy";

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_POLICY_ID =
  "product-hunt-launch-prep-p3-65-v1" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC =
  "docs/product-hunt-launch-prep-p3-65.md" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARTIFACT =
  "artifacts/product-hunt-launch-prep-p3-65-registry.json" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_AUDIT_SCRIPT =
  "scripts/audit-product-hunt-launch-prep-p3-65.ts" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPT =
  "audit:product-hunt-launch-prep-p3-65" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_CHECK_NPM_SCRIPT =
  "check:product-hunt-launch-prep-p3-65" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_UNIT_TEST =
  "tests/unit/product-hunt-launch-prep-p3-65.test.ts" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_UPSTREAM_TEST = PRODUCT_HUNT_LAUNCH_PREP_UNIT_TEST;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC = PRODUCT_HUNT_LAUNCH_PREP_DOC;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR = "artifacts/product-hunt-launch" as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPTS = [
  "test:ci:product-hunt-launch-prep",
  "test:ci:product-hunt-launch-prep:cert",
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_WIRING_PATHS = [
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC,
  "docs/product-hunt-launch-defer.md",
  `${PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR}/README.md`,
  `${PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR}/listing-draft.md`,
  "lib/marketing/product-hunt-launch-prep-p3-65-measurement.ts",
  "lib/marketing/product-hunt-launch-prep-p3-65-audit.ts",
  "lib/marketing/product-hunt-launch-prep-audit.ts",
  "lib/marketing/product-hunt-launch-prep-absolute-final-policy.ts",
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_UNIT_TEST,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_UPSTREAM_TEST,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARTIFACT,
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_UPSTREAM_POLICY_ID =
  PRODUCT_HUNT_LAUNCH_PREP_ABSOLUTE_FINAL_POLICY_ID;

export const PRODUCT_HUNT_LAUNCH_PREP_P3_65_REQUIRED_TIMELINE = [
  "T-30 days",
  "T-14 days",
  "T-7 days",
  "T-1 day",
  "Launch day",
  "T+7 days",
] as const;
