import { describe, expect, it } from "vitest";

import {
  auditMarketingFullStabilization,
  MARKETING_FULL_STABILIZATION_AUDIT_POLICY_ID,
} from "@/lib/marketing/marketing-full-stabilization-audit-policy";
import {
  MARKETING_FULL_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_FULL_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-full-stabilization-patterns";

describe("marketing full stabilization capstone audit (MKT-39)", () => {
  it("locks MKT-39 policy id and MKT-36 through MKT-38 tier registry", () => {
    expect(MARKETING_FULL_STABILIZATION_PATTERNS_POLICY_ID).toBe(
      "marketing-full-stabilization-patterns-mkt39-v1",
    );
    expect(MARKETING_FULL_STABILIZATION_AUDIT_POLICY_ID).toBe(
      MARKETING_FULL_STABILIZATION_PATTERNS_POLICY_ID,
    );
    expect(MARKETING_FULL_STABILIZATION_SUB_POLICIES).toHaveLength(3);
    expect(MARKETING_FULL_STABILIZATION_SUB_POLICIES[0]?.id).toBe("MKT-38");
    expect(MARKETING_FULL_STABILIZATION_SUB_POLICIES.at(-1)?.id).toBe("MKT-36");
  });

  it("composes all three marketing tier capstone audits", () => {
    const report = auditMarketingFullStabilization();
    expect(report.subAudits).toHaveLength(3);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      MARKETING_FULL_STABILIZATION_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full marketing stabilization audit against repo", () => {
    const report = auditMarketingFullStabilization();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("reports nested sub-audit counts per tier capstone", () => {
    const report = auditMarketingFullStabilization();
    const p0 = report.subAudits.find((a) => a.taskId === "MKT-38");
    const p1 = report.subAudits.find((a) => a.taskId === "MKT-37");
    const p2 = report.subAudits.find((a) => a.taskId === "MKT-36");
    expect(p0?.subAuditCount).toBe(10);
    expect(p1?.subAuditCount).toBe(18);
    expect(p2?.subAuditCount).toBe(7);
    for (const sub of report.subAudits) {
      const entry = MARKETING_FULL_STABILIZATION_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
