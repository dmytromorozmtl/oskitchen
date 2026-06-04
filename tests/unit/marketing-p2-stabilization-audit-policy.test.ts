import { describe, expect, it } from "vitest";

import {
  auditMarketingP2Stabilization,
  MARKETING_P2_STABILIZATION_AUDIT_POLICY_ID,
} from "@/lib/marketing/marketing-p2-stabilization-audit-policy";
import {
  MARKETING_P2_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_P2_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-p2-stabilization-patterns";

describe("marketing P2 stabilization capstone audit (MKT-36)", () => {
  it("locks MKT-36 policy id and MKT-29 through MKT-35 registry", () => {
    expect(MARKETING_P2_STABILIZATION_PATTERNS_POLICY_ID).toBe(
      "marketing-p2-stabilization-patterns-mkt36-v1",
    );
    expect(MARKETING_P2_STABILIZATION_AUDIT_POLICY_ID).toBe(
      MARKETING_P2_STABILIZATION_PATTERNS_POLICY_ID,
    );
    expect(MARKETING_P2_STABILIZATION_SUB_POLICIES).toHaveLength(7);
    expect(MARKETING_P2_STABILIZATION_SUB_POLICIES[0]?.id).toBe("MKT-29");
    expect(MARKETING_P2_STABILIZATION_SUB_POLICIES.at(-1)?.id).toBe("MKT-35");
  });

  it("composes all seven P2 marketing sub-audits", () => {
    const report = auditMarketingP2Stabilization();
    expect(report.subAudits).toHaveLength(7);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      MARKETING_P2_STABILIZATION_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full marketing P2 stabilization audit against repo", () => {
    const report = auditMarketingP2Stabilization();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditMarketingP2Stabilization();
    for (const sub of report.subAudits) {
      const entry = MARKETING_P2_STABILIZATION_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
