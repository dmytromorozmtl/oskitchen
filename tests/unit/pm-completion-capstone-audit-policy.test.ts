import { describe, expect, it } from "vitest";

import {
  auditPmCompletionCapstone,
  PM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/pm/pm-completion-capstone-audit-policy";
import {
  PM_COMPLETION_CAPSTONE_POLICY_ID,
  PM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-completion-capstone-patterns";

describe("PM completion capstone audit (PM-06)", () => {
  it("locks PM-06 policy id and PM-01 through PM-05 registry", () => {
    expect(PM_COMPLETION_CAPSTONE_POLICY_ID).toBe("pm-completion-capstone-pm06-v1");
    expect(PM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID).toBe(PM_COMPLETION_CAPSTONE_POLICY_ID);
    expect(PM_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(5);
    expect(PM_COMPLETION_CAPSTONE_SUB_POLICIES[0]?.id).toBe("PM-01");
    expect(PM_COMPLETION_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("PM-05");
  });

  it("composes all five PM capstone audits", () => {
    const report = auditPmCompletionCapstone();
    expect(report.subAudits).toHaveLength(5);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      PM_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full PM completion capstone against repo", () => {
    const report = auditPmCompletionCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("reports nested sub-audit counts per PM capstone", () => {
    const report = auditPmCompletionCapstone();
    expect(report.subAudits.find((a) => a.taskId === "PM-01")?.nestedSubAuditCount).toBe(5);
    expect(report.subAudits.find((a) => a.taskId === "PM-02")?.nestedSubAuditCount).toBe(4);
    expect(report.subAudits.find((a) => a.taskId === "PM-03")?.nestedSubAuditCount).toBe(5);
    expect(report.subAudits.find((a) => a.taskId === "PM-04")?.nestedSubAuditCount).toBe(5);
    expect(report.subAudits.find((a) => a.taskId === "PM-05")?.nestedSubAuditCount).toBe(6);
    for (const sub of report.subAudits) {
      const entry = PM_COMPLETION_CAPSTONE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
