/**
 * P2-58 — Design partner email sequence: 5-step problem → solution → demo → offer → follow-up.
 *
 * @see docs/design-partner-email-sequence-p2-58.md
 */

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID =
  "design-partner-email-sequence-p2-58-v1" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DOC =
  "docs/design-partner-email-sequence-p2-58.md" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_LEGACY_DOC =
  "docs/design-partner-email-sequence.md" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_ARTIFACT =
  "artifacts/design-partner-email-sequence-p2-58.json" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CONTENT_MODULE =
  "lib/marketing/design-partner-email-sequence-p2-58-content.ts" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_AUDIT_MODULE =
  "lib/marketing/design-partner-email-sequence-p2-58-audit.ts" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CHECK_NPM_SCRIPT =
  "check:design-partner-email-sequence-p2-58" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CI_NPM_SCRIPT =
  "test:ci:design-partner-email-sequence-p2-58" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_UNIT_TEST =
  "tests/unit/design-partner-email-sequence-p2-58.test.ts" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_COUNT = 5 as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_LOI_DOC =
  "docs/loi-design-partner-template.md" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_OUTREACH_DOC =
  "docs/design-partner-outreach-meal-prep-p0-7.md" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_PRICING_DOC =
  "docs/pricing-pilot-sku-p0-8.md" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DEMO_PATH = "/demo" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_BOOK_DEMO_PATH = "/book-demo" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_IDS = [
  "problem",
  "solution",
  "demo",
  "offer",
  "follow_up",
] as const;

export type DesignPartnerEmailSequenceP258StepId =
  (typeof DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_IDS)[number];

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_HONESTY_MARKERS = [
  "0 signed founding customers",
  "BETA",
  "design partner program",
  "not a fit",
  "honest",
] as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_WIRING_PATHS = [
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DOC,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_ARTIFACT,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_AUDIT_MODULE,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CONTENT_MODULE,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_UNIT_TEST,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CI_WORKFLOW,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_LOI_DOC,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_OUTREACH_DOC,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_PRICING_DOC,
  "docs/sales-safe-claims-registry.md",
] as const;
