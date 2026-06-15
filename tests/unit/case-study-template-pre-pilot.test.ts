import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditCaseStudyTemplatePrePilotDoc,
  auditCaseStudyTemplatePrePilotFromRoot,
  CASE_STUDY_TEMPLATE_PRE_PILOT_DOC,
  CASE_STUDY_TEMPLATE_PRE_PILOT_FILL_IN_DOC,
  CASE_STUDY_TEMPLATE_PRE_PILOT_FOUNDER_SECTIONS,
  CASE_STUDY_TEMPLATE_PRE_PILOT_POLICY_ID,
  CASE_STUDY_TEMPLATE_PRE_PILOT_REQUIRED_HEADINGS,
  lintCaseStudyPrePilotCopy,
} from "@/lib/marketing/case-study-template-pre-pilot-policy";

const ROOT = process.cwd();

describe("case study template pre-pilot (Absolute Final Task 33)", () => {
  it("locks pre-pilot policy id and doc paths", () => {
    expect(CASE_STUDY_TEMPLATE_PRE_PILOT_POLICY_ID).toBe(
      "case-study-template-pre-pilot-absolute-final-v1",
    );
    expect(CASE_STUDY_TEMPLATE_PRE_PILOT_DOC).toBe("docs/case-study-template-pre-pilot.md");
    expect(CASE_STUDY_TEMPLATE_PRE_PILOT_FILL_IN_DOC).toBe(
      "docs/case-studies/_PRE_PILOT_TEMPLATE.md",
    );
    expect(CASE_STUDY_TEMPLATE_PRE_PILOT_FOUNDER_SECTIONS).toHaveLength(4);
  });

  it("passes audit on canonical pre-pilot template doc and fill-in scaffold", () => {
    const audit = auditCaseStudyTemplatePrePilotFromRoot();
    expect(audit.missingHeadings, audit.missingHeadings.join("; ")).toEqual([]);
    expect(audit.founderSectionCount).toBe(
      CASE_STUDY_TEMPLATE_PRE_PILOT_FOUNDER_SECTIONS.length,
    );
    expect(audit.fillInPresent).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("includes all required headings and links to post-pilot upgrade doc", () => {
    const source = readFileSync(join(ROOT, CASE_STUDY_TEMPLATE_PRE_PILOT_DOC), "utf8");
    for (const heading of CASE_STUDY_TEMPLATE_PRE_PILOT_REQUIRED_HEADINGS) {
      expect(source).toContain(heading);
    }
    expect(source).toContain("case-study-template.md");
    expect(source).toContain("founding-customer-story.md");
    expect(source).toContain("pilot-week1-roadmap.md");
  });

  it("flags forbidden pre-pilot customer claims", () => {
    const result = lintCaseStudyPrePilotCopy(
      "Our customer saved $50k — case study proves thousands of operators use OS Kitchen with proven ROI.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest founder-story copy", () => {
    const result = lintCaseStudyPrePilotCopy(
      "Pre-pilot founder story — design partner program open, no verified customer metrics yet.",
    );
    expect(result.passed).toBe(true);
  });

  it("fails audit when founder sections missing", () => {
    const audit = auditCaseStudyTemplatePrePilotDoc("# Pre-pilot case study template\n");
    expect(audit.passed).toBe(false);
    expect(audit.founderSectionCount).toBeLessThan(4);
  });
});
