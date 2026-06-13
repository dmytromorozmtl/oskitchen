/**
 * Blueprint P3-67 — Social proof section for marketing landings.
 *
 * @see components/marketing/social-proof-section.tsx
 * @see docs/social-proof-section-p3-67.md
 */

import { SOCIAL_PROOF_SECTION_TEST_ID } from "@/lib/marketing/social-proof-section-content";

export const SOCIAL_PROOF_SECTION_P3_67_POLICY_ID = "social-proof-section-p3-67-v1" as const;

export const SOCIAL_PROOF_SECTION_P3_67_DOC = "docs/social-proof-section-p3-67.md" as const;

export const SOCIAL_PROOF_SECTION_P3_67_ARTIFACT =
  "artifacts/social-proof-section-p3-67-registry.json" as const;

export const SOCIAL_PROOF_SECTION_P3_67_AUDIT_SCRIPT =
  "scripts/audit-social-proof-section-p3-67.ts" as const;

export const SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPT = "audit:social-proof-section-p3-67" as const;

export const SOCIAL_PROOF_SECTION_P3_67_CHECK_NPM_SCRIPT =
  "check:social-proof-section-p3-67" as const;

export const SOCIAL_PROOF_SECTION_P3_67_UNIT_TEST =
  "tests/unit/social-proof-section-p3-67.test.ts" as const;

export const SOCIAL_PROOF_SECTION_P3_67_COMPONENT =
  "components/marketing/social-proof-section.tsx" as const;

export const SOCIAL_PROOF_SECTION_P3_67_CONTENT =
  "lib/marketing/social-proof-section-content.ts" as const;

export const SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPTS = [
  "test:ci:social-proof-section",
  "test:ci:social-proof-section:cert",
] as const;

export const SOCIAL_PROOF_SECTION_P3_67_LANDING_COMPONENTS = [
  "components/marketing/commissary-kitchen-software-landing.tsx",
  "components/marketing/ghost-kitchen-landing.tsx",
  "components/marketing/meal-prep-software-landing.tsx",
  "components/marketing/shopify-to-kds-landing.tsx",
  "components/marketing/restaurant-integration-health-landing.tsx",
  "components/marketing/commission-comparison-landing.tsx",
] as const;

export const SOCIAL_PROOF_SECTION_P3_67_WIRING_PATHS = [
  SOCIAL_PROOF_SECTION_P3_67_DOC,
  SOCIAL_PROOF_SECTION_P3_67_COMPONENT,
  SOCIAL_PROOF_SECTION_P3_67_CONTENT,
  "lib/marketing/social-proof-section-audit.ts",
  "lib/marketing/social-proof-section-p3-67-measurement.ts",
  "lib/marketing/social-proof-section-p3-67-audit.ts",
  SOCIAL_PROOF_SECTION_P3_67_UNIT_TEST,
  SOCIAL_PROOF_SECTION_P3_67_ARTIFACT,
  ...SOCIAL_PROOF_SECTION_P3_67_LANDING_COMPONENTS,
] as const;

export const SOCIAL_PROOF_SECTION_P3_67_TEST_ID = SOCIAL_PROOF_SECTION_TEST_ID;

export const SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT = 6 as const;
