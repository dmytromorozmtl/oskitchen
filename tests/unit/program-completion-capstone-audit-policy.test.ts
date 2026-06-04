import { describe, expect, it } from "vitest";

import {
  auditProgramCompletionCapstone,
  PROGRAM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/execution/program-completion-capstone-audit-policy";
import {
  PROGRAM_COMPLETION_CAPSTONE_POLICY_ID,
  PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/execution/program-completion-capstone-patterns";

describe("program completion capstone audit (EXEC-01 / task-181)", () => {
  it("locks EXEC-01 policy id and six role capstone registry", () => {
    expect(PROGRAM_COMPLETION_CAPSTONE_POLICY_ID).toBe("program-completion-capstone-exec01-v1");
    expect(PROGRAM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID).toBe(PROGRAM_COMPLETION_CAPSTONE_POLICY_ID);
    expect(PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(6);
    expect(PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("COMP-03");
  });

  it("composes all six role completion capstones", () => {
    const report = auditProgramCompletionCapstone();
    expect(report.subAudits).toHaveLength(6);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full EXEC-01 program capstone against repo", () => {
    const report = auditProgramCompletionCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("reports nested sub-audit counts per role capstone", () => {
    const report = auditProgramCompletionCapstone();
    expect(report.subAudits.find((a) => a.taskId === "DEV-56")?.nestedSubAuditCount).toBe(3);
    expect(report.subAudits.find((a) => a.taskId === "QA-45")?.nestedSubAuditCount).toBe(3);
    expect(report.subAudits.find((a) => a.taskId === "DES-38")?.nestedSubAuditCount).toBe(11);
    expect(report.subAudits.find((a) => a.taskId === "MKT-42")?.nestedSubAuditCount).toBe(3);
    expect(report.subAudits.find((a) => a.taskId === "PM-06")?.nestedSubAuditCount).toBe(5);
    expect(report.subAudits.find((a) => a.taskId === "COMP-03")?.nestedSubAuditCount).toBe(2);
  });
});
