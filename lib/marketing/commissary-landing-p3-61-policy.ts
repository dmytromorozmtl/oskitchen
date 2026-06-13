/**
 * Blueprint P3-61 — /commissary-kitchen-software landing page.
 *
 * @see app/commissary-kitchen-software/page.tsx
 * @see docs/commissary-landing-p3-61.md
 */

import {
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_COMPONENT_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_PAGE_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE,
  COMMISSARY_KITCHEN_SOFTWARE_PRIMARY_KEYWORD,
} from "@/lib/marketing/commissary-kitchen-software-landing-absolute-final-policy";
import { COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH } from "@/lib/marketing/commissary-kitchen-software-landing-content";
import { COMMISSARY_SOFTWARE_ICP_PATH } from "@/lib/marketing/icp-landing-pages-policy";

export const COMMISSARY_LANDING_P3_61_POLICY_ID = "commissary-landing-p3-61-v1" as const;

export const COMMISSARY_LANDING_P3_61_DOC = "docs/commissary-landing-p3-61.md" as const;

export const COMMISSARY_LANDING_P3_61_ARTIFACT =
  "artifacts/commissary-landing-p3-61-registry.json" as const;

export const COMMISSARY_LANDING_P3_61_AUDIT_SCRIPT =
  "scripts/audit-commissary-landing-p3-61.ts" as const;

export const COMMISSARY_LANDING_P3_61_NPM_SCRIPT = "audit:commissary-landing-p3-61" as const;

export const COMMISSARY_LANDING_P3_61_CHECK_NPM_SCRIPT = "check:commissary-landing-p3-61" as const;

export const COMMISSARY_LANDING_P3_61_UNIT_TEST =
  "tests/unit/commissary-landing-p3-61.test.ts" as const;

export const COMMISSARY_LANDING_P3_61_UPSTREAM_TEST =
  "tests/unit/commissary-kitchen-software-landing-absolute-final.test.ts" as const;

export const COMMISSARY_LANDING_P3_61_CANONICAL_PATH = "/commissary-kitchen-software" as const;

export const COMMISSARY_LANDING_P3_61_LEGACY_PATH = "/commissary-software" as const;

export const COMMISSARY_LANDING_P3_61_LEGACY_PAGE = "app/commissary-software/page.tsx" as const;

export const COMMISSARY_LANDING_P3_61_NPM_SCRIPTS = [
  "test:ci:commissary-kitchen-software-landing",
  "test:ci:commissary-kitchen-software-landing:cert",
] as const;

export const COMMISSARY_LANDING_P3_61_WIRING_PATHS = [
  COMMISSARY_LANDING_P3_61_DOC,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_PAGE_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_COMPONENT_PATH,
  "lib/marketing/commissary-kitchen-software-landing-content.ts",
  "lib/marketing/commissary-landing-p3-61-measurement.ts",
  "lib/marketing/commissary-landing-p3-61-audit.ts",
  COMMISSARY_LANDING_P3_61_UNIT_TEST,
  COMMISSARY_LANDING_P3_61_UPSTREAM_TEST,
  COMMISSARY_LANDING_P3_61_ARTIFACT,
  COMMISSARY_LANDING_P3_61_LEGACY_PAGE,
] as const;

export const COMMISSARY_LANDING_P3_61_UPSTREAM_POLICY_ID =
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID;

export const COMMISSARY_LANDING_P3_61_PRIMARY_KEYWORD = COMMISSARY_KITCHEN_SOFTWARE_PRIMARY_KEYWORD;

export function commissaryLandingCanonicalPath(): string {
  return COMMISSARY_LANDING_P3_61_CANONICAL_PATH;
}

export function commissaryLandingPathsAligned(): boolean {
  return (
    COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE === COMMISSARY_LANDING_P3_61_CANONICAL_PATH &&
    COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH === COMMISSARY_LANDING_P3_61_CANONICAL_PATH &&
    COMMISSARY_SOFTWARE_ICP_PATH === COMMISSARY_LANDING_P3_61_CANONICAL_PATH
  );
}
