import { describe, expect, it } from "vitest";

import {
  auditMarketingCompletionCapstone,
  MARKETING_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/marketing/marketing-completion-capstone-audit-policy";
import {
  MARKETING_COMPLETION_CAPSTONE_POLICY_ID,
  MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-completion-capstone-patterns";

describe("marketing completion capstone audit (MKT-42)", () => {
  it("locks MKT-42 policy id and MKT-39 through MKT-41 registry", () => {
    expect(MARKETING_COMPLETION_CAPSTONE_POLICY_ID).toBe(
      "marketing-completion-capstone-mkt42-v1",
    );
    expect(MARKETING_COMPLETION_CAPSTONE_AUDIT_POLICY_ID).toBe(
      MARKETING_COMPLETION_CAPSTONE_POLICY_ID,
    );
    expect(MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(3);
    expect(MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES[0]?.id).toBe("MKT-39");
    expect(MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("MKT-41");
  });

  it("composes all three top-level marketing capstone audits", () => {
    const report = auditMarketingCompletionCapstone();
    expect(report.subAudits).toHaveLength(3);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full marketing completion capstone against repo", () => {
    const report = auditMarketingCompletionCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("reports nested sub-audit counts per top-level capstone", () => {
    const report = auditMarketingCompletionCapstone();
    const mkt39 = report.subAudits.find((a) => a.taskId === "MKT-39");
    const mkt40 = report.subAudits.find((a) => a.taskId === "MKT-40");
    const mkt41 = report.subAudits.find((a) => a.taskId === "MKT-41");
    expect(mkt39?.nestedSubAuditCount).toBe(3);
    expect(mkt40?.nestedSubAuditCount).toBe(6);
    expect(mkt41?.nestedSubAuditCount).toBe(6);
    for (const sub of report.subAudits) {
      const entry = MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
