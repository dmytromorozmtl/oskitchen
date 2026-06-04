import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-11 — case study template policy (sales-safe pilot story scaffold).
 *
 * @see docs/case-study-template.md
 * @see docs/case-studies/_TEMPLATE.md
 */

export const CASE_STUDY_TEMPLATE_POLICY_ID = "case-study-template-mkt11-v1" as const;

export const CASE_STUDY_TEMPLATE_CANONICAL_DOC = "docs/case-study-template.md" as const;

export const CASE_STUDY_TEMPLATE_FILL_IN_DOC = "docs/case-studies/_TEMPLATE.md" as const;

export const CASE_STUDY_TEMPLATE_CODE_SURFACE = "lib/marketing/case-studies.ts" as const;

/** Long-form sections GTM must complete before publish review. */
export const CASE_STUDY_TEMPLATE_LONG_FORM_SECTIONS = [
  "At a glance (hero stats)",
  "Customer profile",
  "The challenge (Before)",
  "Why OS Kitchen",
  "Results (After)",
  "Quote",
  "Stack context (optional, honest)",
  "What's next",
] as const;

/** Short-form fields for deck sidebar / sales email. */
export const CASE_STUDY_SHORT_FORM_FIELDS = [
  "Challenge",
  "Solution",
  "Results (pilot window, verified)",
  "Quote",
] as const;

/** Publish gates referenced in template — not satisfied until artifacts exist. */
export const CASE_STUDY_PUBLISH_GATES = [
  "pilot-gono-go-summary.json",
  "pilot-metrics-baseline",
  "PILOT_CASE_STUDY_CUSTOMER_APPROVAL",
  "smoke:pilot-case-study-draft",
  "verify-claims",
] as const;

export const CASE_STUDY_TEMPLATE_REQUIRED_DOC_HEADINGS = [
  "Before you write",
  "Short form (sales email / deck sidebar)",
  "Long form (web / PDF / `/customers`)",
  "Forbidden in published case studies",
  "Sign-off checklist",
] as const;

export const CASE_STUDY_FORBIDDEN_PUBLISH_CLAIMS = [
  "fabricated operator",
  "production sso",
  "soc2",
  "unified inventory depletion",
  "rush-hour kds certified",
  "fully synced",
  "guaranteed roi",
  "untouchable",
] as const;

export type CaseStudyTemplateDocAudit = {
  docPath: typeof CASE_STUDY_TEMPLATE_CANONICAL_DOC;
  fillInPath: typeof CASE_STUDY_TEMPLATE_FILL_IN_DOC;
  missingHeadings: string[];
  longFormSectionsPresent: number;
  passed: boolean;
};

export function auditCaseStudyTemplateDoc(root = process.cwd()): CaseStudyTemplateDocAudit {
  const source = readFileSync(join(root, CASE_STUDY_TEMPLATE_CANONICAL_DOC), "utf8");
  const fillIn = readFileSync(join(root, CASE_STUDY_TEMPLATE_FILL_IN_DOC), "utf8");

  const missingHeadings = CASE_STUDY_TEMPLATE_REQUIRED_DOC_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  const longFormSectionsPresent = CASE_STUDY_TEMPLATE_LONG_FORM_SECTIONS.filter(
    (section) => fillIn.includes(section) || source.includes(section),
  ).length;

  return {
    docPath: CASE_STUDY_TEMPLATE_CANONICAL_DOC,
    fillInPath: CASE_STUDY_TEMPLATE_FILL_IN_DOC,
    missingHeadings,
    longFormSectionsPresent,
    passed:
      missingHeadings.length === 0 &&
      longFormSectionsPresent === CASE_STUDY_TEMPLATE_LONG_FORM_SECTIONS.length,
  };
}

export type CaseStudyDraftValidation = {
  hasTbdPlaceholders: boolean;
  forbiddenClaimHits: string[];
  passed: boolean;
};

/** Pre-publish lint for internal draft markdown — flags forbidden claims and bare TBD in outcomes. */
export function validateCaseStudyDraft(source: string): CaseStudyDraftValidation {
  const lower = source.toLowerCase();
  const forbiddenClaimHits = CASE_STUDY_FORBIDDEN_PUBLISH_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );

  const resultsSection = source.match(/### 5 — Results[\s\S]*?(?=###|$)/i)?.[0] ?? "";
  const hasTbdPlaceholders =
    /### 5 — Results/i.test(source) && /\|[^|\n]*TBD[^|\n]*\|/i.test(resultsSection);

  return {
    hasTbdPlaceholders,
    forbiddenClaimHits,
    passed: forbiddenClaimHits.length === 0,
  };
}
