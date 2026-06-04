import { describe, expect, it } from "vitest";

import {
  auditCaseStudyTemplateDoc,
  CASE_STUDY_TEMPLATE_LONG_FORM_SECTIONS,
  CASE_STUDY_TEMPLATE_POLICY_ID,
  validateCaseStudyDraft,
} from "@/lib/marketing/case-study-template-policy";

describe("case study template policy (MKT-11)", () => {
  it("locks MKT-11 policy id and long-form section ladder", () => {
    expect(CASE_STUDY_TEMPLATE_POLICY_ID).toBe("case-study-template-mkt11-v1");
    expect(CASE_STUDY_TEMPLATE_LONG_FORM_SECTIONS).toHaveLength(8);
  });

  it("passes audit on canonical template docs", () => {
    const audit = auditCaseStudyTemplateDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.longFormSectionsPresent).toBe(CASE_STUDY_TEMPLATE_LONG_FORM_SECTIONS.length);
  });

  it("flags forbidden publish claims in draft markdown", () => {
    const result = validateCaseStudyDraft(`
      ### 5 — Results (After)
      | Orders/day | 10 | 20 | 2x | verified |
      Unified inventory depletion across all channels improved ops.
    `);
    expect(result.passed).toBe(false);
    expect(result.forbiddenClaimHits).toContain("unified inventory depletion");
  });

  it("allows honest draft with TBD in results table during internal review", () => {
    const result = validateCaseStudyDraft(`
      ### 5 — Results (After)
      | Metric | Before | After |
      | Orders/day | TBD | TBD |
      Qualified KDS refresh during pilot window.
    `);
    expect(result.passed).toBe(true);
    expect(result.hasTbdPlaceholders).toBe(true);
  });
});
