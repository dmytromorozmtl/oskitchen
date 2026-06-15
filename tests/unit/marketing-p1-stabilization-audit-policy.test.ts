import { describe, expect, it } from "vitest";

import {
  auditMarketingP1Stabilization,
  MARKETING_P1_STABILIZATION_AUDIT_POLICY_ID,
} from "@/lib/marketing/marketing-p1-stabilization-audit-policy";
import {
  MARKETING_P1_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_P1_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-p1-stabilization-patterns";

describe("marketing P1 stabilization capstone audit (MKT-37)", () => {
  it("locks MKT-37 policy id and MKT-11 through MKT-28 registry", () => {
    expect(MARKETING_P1_STABILIZATION_PATTERNS_POLICY_ID).toBe(
      "marketing-p1-stabilization-patterns-mkt37-v1",
    );
    expect(MARKETING_P1_STABILIZATION_AUDIT_POLICY_ID).toBe(
      MARKETING_P1_STABILIZATION_PATTERNS_POLICY_ID,
    );
    expect(MARKETING_P1_STABILIZATION_SUB_POLICIES).toHaveLength(18);
    expect(MARKETING_P1_STABILIZATION_SUB_POLICIES[0]?.id).toBe("MKT-11");
    expect(MARKETING_P1_STABILIZATION_SUB_POLICIES.at(-1)?.id).toBe("MKT-28");
  });

  it("composes all eighteen P1 marketing sub-audits", () => {
    const report = auditMarketingP1Stabilization();
    expect(report.subAudits).toHaveLength(18);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      MARKETING_P1_STABILIZATION_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full marketing P1 stabilization audit against repo", () => {
    const report = auditMarketingP1Stabilization();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditMarketingP1Stabilization();
    for (const sub of report.subAudits) {
      const entry = MARKETING_P1_STABILIZATION_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
