/**
 * Absolute Final Task 79 — vertical-specific messaging ("Built for multi-concept operators").
 *
 * @see lib/marketing/vertical-specific-messaging-content.ts
 * @see components/marketing/vertical-specific-messaging-section.tsx
 * @see docs/icp-definition-final.md
 */

export const VERTICAL_SPECIFIC_MESSAGING_ABSOLUTE_FINAL_POLICY_ID =
  "vertical-specific-messaging-absolute-final-v1" as const;

export const VERTICAL_SPECIFIC_MESSAGING_PRIMARY_HEADLINE =
  "Built for multi-concept operators" as const;

export const VERTICAL_SPECIFIC_MESSAGING_CONTENT_PATH =
  "lib/marketing/vertical-specific-messaging-content.ts" as const;

export const VERTICAL_SPECIFIC_MESSAGING_COMPONENT_PATH =
  "components/marketing/vertical-specific-messaging-section.tsx" as const;

export const VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_PAGE =
  "app/solutions/page.tsx" as const;

export const VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_HUB =
  "lib/marketing/solutions-hub-content.ts" as const;

export const VERTICAL_SPECIFIC_MESSAGING_ICP_DOC = "docs/icp-definition-final.md" as const;

export const VERTICAL_SPECIFIC_MESSAGING_REQUIRED_SECTIONS = [
  'data-testid="vertical-specific-messaging"',
  "VERTICAL_MESSAGING_PRIMARY_HEADLINE",
] as const;

export const VERTICAL_SPECIFIC_MESSAGING_HONESTY_MARKERS = [
  "BETA",
  "SKIPPED",
  "pilot scope",
  "no hardware",
] as const;

export const VERTICAL_SPECIFIC_MESSAGING_WIRING_PATHS = [
  VERTICAL_SPECIFIC_MESSAGING_CONTENT_PATH,
  VERTICAL_SPECIFIC_MESSAGING_COMPONENT_PATH,
  VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_PAGE,
  VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_HUB,
  VERTICAL_SPECIFIC_MESSAGING_ICP_DOC,
  "lib/marketing/vertical-specific-messaging-absolute-final-policy.ts",
  "lib/marketing/vertical-specific-messaging-audit.ts",
  "tests/unit/vertical-specific-messaging-absolute-final.test.ts",
] as const;

export const VERTICAL_SPECIFIC_MESSAGING_UNIT_TEST =
  "tests/unit/vertical-specific-messaging-absolute-final.test.ts" as const;

export const VERTICAL_SPECIFIC_MESSAGING_CI_SCRIPTS = [
  "test:ci:vertical-specific-messaging",
  "test:ci:vertical-specific-messaging:cert",
] as const;

export const VERTICAL_SPECIFIC_MESSAGING_UPSTREAM_POLICIES = [
  "era17-pilot-icp-contract-v1",
  "seo-10-icp-keywords-mkt20-v1",
] as const;
