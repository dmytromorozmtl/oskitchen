import { describe, expect, it } from "vitest";

import {
  auditCompetitorLeapfrogGapClosure,
  COMPETITOR_LEAPFROG_GAP_CLOSURE_AUDIT_POLICY_ID,
} from "@/lib/competitor/competitor-leapfrog-gap-closure-audit-policy";
import {
  COMPETITOR_LEAPFROG_GAP_CLOSURE_POLICY_ID,
  COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES,
} from "@/lib/competitor/competitor-leapfrog-gap-closure-patterns";

describe("competitor leapfrog gap-closure capstone audit (COMP-02)", () => {
  it("locks COMP-02 policy id and six sub-policy registry", () => {
    expect(COMPETITOR_LEAPFROG_GAP_CLOSURE_POLICY_ID).toBe(
      "competitor-leapfrog-gap-closure-comp02-v1",
    );
    expect(COMPETITOR_LEAPFROG_GAP_CLOSURE_AUDIT_POLICY_ID).toBe(
      COMPETITOR_LEAPFROG_GAP_CLOSURE_POLICY_ID,
    );
    expect(COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES).toHaveLength(6);
    expect(COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES[0]?.id).toBe("COMP-01");
    expect(COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES.at(-1)?.id).toBe("COMP-02e");
  });

  it("composes COMP-01 plus five leapfrog/gap-closure sub-audits", () => {
    const report = auditCompetitorLeapfrogGapClosure();
    expect(report.subAudits).toHaveLength(6);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full COMP-02 capstone against repo", () => {
    const report = auditCompetitorLeapfrogGapClosure();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditCompetitorLeapfrogGapClosure();
    for (const sub of report.subAudits) {
      const entry = COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
