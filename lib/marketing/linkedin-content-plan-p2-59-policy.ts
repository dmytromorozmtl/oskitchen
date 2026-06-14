/**
 * P2-59 — LinkedIn content plan: 3 posts/week founder-led.
 *
 * @see docs/linkedin-content-plan-p2-59.md
 */

export const LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID =
  "linkedin-content-plan-p2-59-v1" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_DOC =
  "docs/linkedin-content-plan-p2-59.md" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_LEGACY_DOC =
  "docs/linkedin-content-plan.md" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_ARTIFACT =
  "artifacts/linkedin-content-plan-p2-59.json" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_CONTENT_MODULE =
  "lib/marketing/linkedin-content-plan-p2-59-content.ts" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_AUDIT_MODULE =
  "lib/marketing/linkedin-content-plan-p2-59-audit.ts" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_CHECK_NPM_SCRIPT =
  "check:linkedin-content-plan-p2-59" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_CI_NPM_SCRIPT =
  "test:ci:linkedin-content-plan-p2-59" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_UNIT_TEST =
  "tests/unit/linkedin-content-plan-p2-59.test.ts" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_POSTS_PER_WEEK = 3 as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_FOUNDER_NAME = "Dmytro" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_CLAIMS_DOC =
  "docs/sales-safe-claims-registry.md" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_AI_HONESTY_DOC =
  "docs/ai-moats-honest-positioning.md" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_EMAIL_SEQUENCE_DOC =
  "docs/design-partner-email-sequence-p2-58.md" as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_WEEKDAY_SLOTS = [
  "monday",
  "wednesday",
  "friday",
] as const;

export type LinkedInContentPlanP259WeekdaySlot =
  (typeof LINKEDIN_CONTENT_PLAN_P2_59_WEEKDAY_SLOTS)[number];

export const LINKEDIN_CONTENT_PLAN_P2_59_HONESTY_MARKERS = [
  "0 signed founding customers",
  "BETA",
  "founder-led",
  "building in public",
  "design partner",
] as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_WIRING_PATHS = [
  LINKEDIN_CONTENT_PLAN_P2_59_DOC,
  LINKEDIN_CONTENT_PLAN_P2_59_ARTIFACT,
  LINKEDIN_CONTENT_PLAN_P2_59_AUDIT_MODULE,
  LINKEDIN_CONTENT_PLAN_P2_59_CONTENT_MODULE,
  LINKEDIN_CONTENT_PLAN_P2_59_UNIT_TEST,
  LINKEDIN_CONTENT_PLAN_P2_59_CI_WORKFLOW,
  LINKEDIN_CONTENT_PLAN_P2_59_CLAIMS_DOC,
  LINKEDIN_CONTENT_PLAN_P2_59_AI_HONESTY_DOC,
  LINKEDIN_CONTENT_PLAN_P2_59_EMAIL_SEQUENCE_DOC,
  "artifacts/pilot-gono-go-summary.json",
] as const;
