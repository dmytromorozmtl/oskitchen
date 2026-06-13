/**
 * Blueprint P3-66 — Email nurture sequence (5 emails).
 *
 * @see docs/email-nurture-5-sequence.md
 * @see docs/email-nurture-sequence-p3-66.md
 */

import {
  EMAIL_NURTURE_5_SEQUENCE_DOC,
  EMAIL_NURTURE_5_SEQUENCE_POLICY_ID,
} from "@/lib/marketing/email-nurture-5-sequence-policy";

export const EMAIL_NURTURE_SEQUENCE_P3_66_POLICY_ID = "email-nurture-sequence-p3-66-v1" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_DOC = "docs/email-nurture-sequence-p3-66.md" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_ARTIFACT =
  "artifacts/email-nurture-sequence-p3-66-registry.json" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_AUDIT_SCRIPT =
  "scripts/audit-email-nurture-sequence-p3-66.ts" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPT = "audit:email-nurture-sequence-p3-66" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_CHECK_NPM_SCRIPT =
  "check:email-nurture-sequence-p3-66" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_UNIT_TEST =
  "tests/unit/email-nurture-sequence-p3-66.test.ts" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_UPSTREAM_TEST =
  "tests/unit/email-nurture-5-sequence-policy.test.ts" as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC = EMAIL_NURTURE_5_SEQUENCE_DOC;

export const EMAIL_NURTURE_SEQUENCE_P3_66_EMAIL_COUNT = 5 as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPTS = [
  "test:ci:email-nurture-sequence",
  "test:ci:email-nurture-sequence:cert",
] as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_WIRING_PATHS = [
  EMAIL_NURTURE_SEQUENCE_P3_66_DOC,
  EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC,
  "docs/design-partner-email-sequence.md",
  "lib/marketing/email-nurture-5-sequence-policy.ts",
  "lib/marketing/email-nurture-sequence-p3-66-measurement.ts",
  "lib/marketing/email-nurture-sequence-p3-66-audit.ts",
  EMAIL_NURTURE_SEQUENCE_P3_66_UNIT_TEST,
  EMAIL_NURTURE_SEQUENCE_P3_66_UPSTREAM_TEST,
  EMAIL_NURTURE_SEQUENCE_P3_66_ARTIFACT,
] as const;

export const EMAIL_NURTURE_SEQUENCE_P3_66_UPSTREAM_POLICY_ID = EMAIL_NURTURE_5_SEQUENCE_POLICY_ID;

export const EMAIL_NURTURE_SEQUENCE_P3_66_REQUIRED_EMAIL_HEADINGS = [
  "Email 1 — Welcome + honest scope",
  "Email 2 — Today Command Center",
  "Email 3 — Integration Health moat",
  "Email 4 — AI modules (qualified)",
  "Email 5 — Design partner invite + close",
] as const;
