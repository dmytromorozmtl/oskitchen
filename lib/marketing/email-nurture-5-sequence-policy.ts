import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-19 — inbound email nurture 5-sequence policy.
 *
 * @see docs/email-nurture-5-sequence.md
 * @see docs/design-partner-email-sequence.md
 */

export const EMAIL_NURTURE_5_SEQUENCE_POLICY_ID = "email-nurture-5-sequence-mkt19-v1" as const;

export const EMAIL_NURTURE_5_SEQUENCE_DOC = "docs/email-nurture-5-sequence.md" as const;

export const EMAIL_NURTURE_5_SEQUENCE_EMAILS = [
  { id: "e1", label: "Welcome + honest scope", sendDay: 0 },
  { id: "e2", label: "Today Command Center", sendDay: 2 },
  { id: "e3", label: "Integration Health moat", sendDay: 5 },
  { id: "e4", label: "AI modules qualified", sendDay: 9 },
  { id: "e5", label: "Design partner invite", sendDay: 14 },
] as const;

export const EMAIL_NURTURE_5_SEQUENCE_UTM_CAMPAIGN = "nurture_mkt19" as const;

export const EMAIL_NURTURE_5_SEQUENCE_PRIMARY_CTA = {
  label: "Book fit call",
  href: `/book-demo?utm_source=email&utm_medium=nurture&utm_campaign=${EMAIL_NURTURE_5_SEQUENCE_UTM_CAMPAIGN}_e5`,
} as const;

export const EMAIL_NURTURE_5_SEQUENCE_TRUST_LINK = "/trust" as const;

export const EMAIL_NURTURE_5_SEQUENCE_AI_LINK = "/ai" as const;

export const EMAIL_NURTURE_5_SEQUENCE_FORBIDDEN_CLAIMS = [
  "trusted by thousands",
  "guaranteed roi",
  "guaranteed margin lift",
  "all integrations live",
  "untouchable ai moat",
  "sysco parity",
  "faire marketplace parity",
  "soc 2 certified",
] as const;

export const EMAIL_NURTURE_5_SEQUENCE_DOC_REQUIRED_HEADINGS = [
  "Sequence overview",
  "Email 1 — Welcome + honest scope",
  "Email 5 — Design partner invite + close",
  "Forbidden claims",
  "CRM tracking fields",
] as const;

export type EmailNurture5SequenceDocAudit = {
  docPath: typeof EMAIL_NURTURE_5_SEQUENCE_DOC;
  missingHeadings: string[];
  emailCount: number;
  totalSpanDays: number;
  passed: boolean;
};

export function totalEmailNurture5SequenceSpanDays(): number {
  return EMAIL_NURTURE_5_SEQUENCE_EMAILS[EMAIL_NURTURE_5_SEQUENCE_EMAILS.length - 1]?.sendDay ?? 0;
}

export function auditEmailNurture5SequenceDoc(root = process.cwd()): EmailNurture5SequenceDocAudit {
  const source = readFileSync(join(root, EMAIL_NURTURE_5_SEQUENCE_DOC), "utf8");
  const missingHeadings = EMAIL_NURTURE_5_SEQUENCE_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: EMAIL_NURTURE_5_SEQUENCE_DOC,
    missingHeadings,
    emailCount: EMAIL_NURTURE_5_SEQUENCE_EMAILS.length,
    totalSpanDays: totalEmailNurture5SequenceSpanDays(),
    passed: missingHeadings.length === 0,
  };
}

export type EmailNurture5SequenceLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintEmailNurture5SequenceCopy(source: string): EmailNurture5SequenceLint {
  const lower = source.toLowerCase();
  const forbiddenHits = EMAIL_NURTURE_5_SEQUENCE_FORBIDDEN_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
