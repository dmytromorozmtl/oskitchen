/**
 * Blueprint P1-25 — Design partner outreach list (Montreal + Canada).
 *
 * @see docs/design-partner-outreach.md
 * @see docs/design-partner-email-sequence.md
 */

export const DESIGN_PARTNER_OUTREACH_POLICY_ID = "design-partner-outreach-p1-25-v1" as const;

export const DESIGN_PARTNER_OUTREACH_DOC = "docs/design-partner-outreach.md" as const;

export const DESIGN_PARTNER_OUTREACH_CONTENT_PATH =
  "lib/marketing/design-partner-outreach-content.ts" as const;

export const DESIGN_PARTNER_OUTREACH_AUDIT_SCRIPT =
  "scripts/audit-design-partner-outreach.ts" as const;

export const DESIGN_PARTNER_OUTREACH_NPM_SCRIPT = "audit:design-partner-outreach" as const;

export const DESIGN_PARTNER_OUTREACH_CHECK_NPM_SCRIPT =
  "check:design-partner-outreach" as const;

export const DESIGN_PARTNER_OUTREACH_UNIT_TEST =
  "tests/unit/design-partner-outreach.test.ts" as const;

export const DESIGN_PARTNER_OUTREACH_EMAIL_SEQUENCE_DOC =
  "docs/design-partner-email-sequence.md" as const;

export const DESIGN_PARTNER_OUTREACH_LOI_DOC = "docs/loi-design-partner-template.md" as const;

/** Minimum Montreal-area operators in the canonical list. */
export const DESIGN_PARTNER_OUTREACH_MONTREAL_MIN_COUNT = 12 as const;

/** Total operators required for P1-25. */
export const DESIGN_PARTNER_OUTREACH_OPERATOR_COUNT = 20 as const;

export const DESIGN_PARTNER_OUTREACH_HONESTY_MARKERS = [
  "research target",
  "not contacted",
  "design partner program",
  "BETA",
  "0 signed founding customers",
] as const;

export const DESIGN_PARTNER_OUTREACH_WIRING_PATHS = [
  DESIGN_PARTNER_OUTREACH_DOC,
  DESIGN_PARTNER_OUTREACH_CONTENT_PATH,
  "lib/marketing/design-partner-outreach-policy.ts",
  "lib/marketing/design-partner-outreach-audit.ts",
  DESIGN_PARTNER_OUTREACH_UNIT_TEST,
  DESIGN_PARTNER_OUTREACH_EMAIL_SEQUENCE_DOC,
  DESIGN_PARTNER_OUTREACH_LOI_DOC,
] as const;
