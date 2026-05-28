import { describe, expect, it } from "vitest";

import {
  PILOT_CASE_STUDY_DRAFT_ERA17_BACKLOG_ID,
  PILOT_CASE_STUDY_DRAFT_ERA17_DOC,
  PILOT_CASE_STUDY_DRAFT_ERA17_FORBIDDEN_CLAIMS,
  PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID,
  PILOT_CASE_STUDY_DRAFT_ERA17_PROOF_STATUS,
  PILOT_CASE_STUDY_DRAFT_ERA17_REQUIRED_SECTIONS,
  PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES,
} from "@/lib/commercial/pilot-case-study-draft-era17-policy";

describe("pilot case study draft era17 policy", () => {
  it("locks era17 pilot case study draft policy id", () => {
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID).toBe("era17-pilot-case-study-draft-v1");
  });

  it("requires internal draft status without publish claim", () => {
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_PROOF_STATUS).toBe(
      "internal_draft_awaiting_customer_approval",
    );
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_DOC).toBe("docs/pilot-case-study-draft-era17.md");
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_BACKLOG_ID).toBe("KOS-E17-036");
  });

  it("defines required sections and approval values", () => {
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_REQUIRED_SECTIONS).toContain("Customer permission gate");
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES).toEqual([
      "signed",
      "anonymized_signed",
    ]);
    expect(PILOT_CASE_STUDY_DRAFT_ERA17_FORBIDDEN_CLAIMS.length).toBeGreaterThan(5);
  });
});
