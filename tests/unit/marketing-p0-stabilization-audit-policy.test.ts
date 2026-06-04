import { describe, expect, it } from "vitest";

import {
  auditMarketingP0Stabilization,
  MARKETING_P0_STABILIZATION_AUDIT_POLICY_ID,
} from "@/lib/marketing/marketing-p0-stabilization-audit-policy";
import {
  MARKETING_P0_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_P0_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-p0-stabilization-patterns";

describe("marketing P0 stabilization capstone audit (MKT-38)", () => {
  it("locks MKT-38 policy id and MKT-01 through MKT-10 registry", () => {
    expect(MARKETING_P0_STABILIZATION_PATTERNS_POLICY_ID).toBe(
      "marketing-p0-stabilization-patterns-mkt38-v1",
    );
    expect(MARKETING_P0_STABILIZATION_AUDIT_POLICY_ID).toBe(
      MARKETING_P0_STABILIZATION_PATTERNS_POLICY_ID,
    );
    expect(MARKETING_P0_STABILIZATION_SUB_POLICIES).toHaveLength(10);
    expect(MARKETING_P0_STABILIZATION_SUB_POLICIES[0]?.id).toBe("MKT-01");
    expect(MARKETING_P0_STABILIZATION_SUB_POLICIES.at(-1)?.id).toBe("MKT-10");
  });

  it("composes all ten P0 marketing sub-audits", () => {
    const report = auditMarketingP0Stabilization();
    expect(report.subAudits).toHaveLength(10);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      MARKETING_P0_STABILIZATION_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full marketing P0 stabilization audit against repo", () => {
    const report = auditMarketingP0Stabilization();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditMarketingP0Stabilization();
    for (const sub of report.subAudits) {
      const entry = MARKETING_P0_STABILIZATION_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
