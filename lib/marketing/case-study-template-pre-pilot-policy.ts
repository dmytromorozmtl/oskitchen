import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Absolute Final Task 33 — pre-pilot case study template with founder story.
 *
 * @see docs/case-study-template-pre-pilot.md
 * @see docs/case-studies/_PRE_PILOT_TEMPLATE.md
 * @see docs/case-study-template.md (post-pilot upgrade path)
 * @see docs/founding-customer-story.md
 */

export const CASE_STUDY_TEMPLATE_PRE_PILOT_POLICY_ID =
  "case-study-template-pre-pilot-absolute-final-v1" as const;

export const CASE_STUDY_TEMPLATE_PRE_PILOT_DOC =
  "docs/case-study-template-pre-pilot.md" as const;

export const CASE_STUDY_TEMPLATE_PRE_PILOT_FILL_IN_DOC =
  "docs/case-studies/_PRE_PILOT_TEMPLATE.md" as const;

export const CASE_STUDY_TEMPLATE_PRE_PILOT_POST_UPGRADE_DOC =
  "docs/case-study-template.md" as const;

export const CASE_STUDY_TEMPLATE_PRE_PILOT_REQUIRED_HEADINGS = [
  "Pre-pilot case study template",
  "Founder story",
  "Operator archetype",
  "Before pilot",
  "Why we're building OS Kitchen",
  "Design partner call to action",
  "Upgrade to post-pilot case study",
  "Forbidden pre-pilot claims",
] as const;

export const CASE_STUDY_TEMPLATE_PRE_PILOT_FOUNDER_SECTIONS = [
  "The problem we saw",
  "Why we built before the first customer",
  "Founder quote",
  "What changes after the first pilot",
] as const;

export const CASE_STUDY_TEMPLATE_PRE_PILOT_CI_SCRIPTS = [
  "test:ci:case-study-template-pre-pilot",
] as const;

export const CASE_STUDY_TEMPLATE_PRE_PILOT_FORBIDDEN_CLAIMS = [
  "our customer",
  "thousands of operators",
  "proven roi",
  "case study proves",
  "saved $",
  "live doordash",
  "live uber eats",
] as const;

export type CaseStudyTemplatePrePilotDocAudit = {
  policyId: typeof CASE_STUDY_TEMPLATE_PRE_PILOT_POLICY_ID;
  missingHeadings: string[];
  founderSectionCount: number;
  fillInPresent: boolean;
  passed: boolean;
};

export function auditCaseStudyTemplatePrePilotDoc(source: string): CaseStudyTemplatePrePilotDocAudit {
  const missingHeadings = CASE_STUDY_TEMPLATE_PRE_PILOT_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const founderSectionCount = CASE_STUDY_TEMPLATE_PRE_PILOT_FOUNDER_SECTIONS.filter((section) =>
    source.includes(section),
  ).length;

  return {
    policyId: CASE_STUDY_TEMPLATE_PRE_PILOT_POLICY_ID,
    missingHeadings,
    founderSectionCount,
    fillInPresent: false,
    passed:
      missingHeadings.length === 0 &&
      founderSectionCount === CASE_STUDY_TEMPLATE_PRE_PILOT_FOUNDER_SECTIONS.length,
  };
}

export function auditCaseStudyTemplatePrePilotFromRoot(
  root = process.cwd(),
): CaseStudyTemplatePrePilotDocAudit {
  const source = readFileSync(join(root, CASE_STUDY_TEMPLATE_PRE_PILOT_DOC), "utf8");
  let fillInPresent = false;
  try {
    readFileSync(join(root, CASE_STUDY_TEMPLATE_PRE_PILOT_FILL_IN_DOC), "utf8");
    fillInPresent = true;
  } catch {
    fillInPresent = false;
  }

  const audit = auditCaseStudyTemplatePrePilotDoc(source);
  return {
    ...audit,
    fillInPresent,
    passed: audit.passed && fillInPresent,
  };
}

export type CaseStudyPrePilotCopyLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintCaseStudyPrePilotCopy(source: string): CaseStudyPrePilotCopyLint {
  const lower = source.toLowerCase();
  const forbiddenHits = CASE_STUDY_TEMPLATE_PRE_PILOT_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
