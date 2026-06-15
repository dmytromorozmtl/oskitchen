import { describe, expect, it } from "vitest";

import {
  auditCompetitorP0Intelligence,
  COMPETITOR_P0_INTELLIGENCE_AUDIT_POLICY_ID,
} from "@/lib/competitor/competitor-p0-intelligence-audit-policy";
import {
  COMPETITOR_P0_INTELLIGENCE_POLICY_ID,
  COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES,
} from "@/lib/competitor/competitor-p0-intelligence-patterns";

describe("competitor P0 intelligence capstone audit (COMP-01)", () => {
  it("locks COMP-01 policy id and five sub-policy registry", () => {
    expect(COMPETITOR_P0_INTELLIGENCE_POLICY_ID).toBe("competitor-p0-intelligence-comp01-v1");
    expect(COMPETITOR_P0_INTELLIGENCE_AUDIT_POLICY_ID).toBe(COMPETITOR_P0_INTELLIGENCE_POLICY_ID);
    expect(COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES).toHaveLength(5);
    expect(COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES[0]?.id).toBe("COMP-01a");
    expect(COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES.at(-1)?.id).toBe("COMP-01e");
  });

  it("composes all five competitor intelligence sub-audits", () => {
    const report = auditCompetitorP0Intelligence();
    expect(report.subAudits).toHaveLength(5);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full COMP-01 capstone against repo", () => {
    const report = auditCompetitorP0Intelligence();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditCompetitorP0Intelligence();
    for (const sub of report.subAudits) {
      const entry = COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
