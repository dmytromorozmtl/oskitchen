import { describe, expect, it } from "vitest";

import {
  auditFinal06ProgramCapstone,
  FINAL_06_PROGRAM_CAPSTONE_POLICY_ID,
} from "@/lib/execution/final-06-program-capstone-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  PROGRAM_COMPLETION_CAPSTONE_POLICY_ID,
  PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/execution/program-completion-capstone-patterns";

describe("final orchestrator FINAL-06 EXEC-01 program capstone re-cert", () => {
  it("locks FINAL-06 policy and task slot 200", () => {
    expect(FINAL_06_PROGRAM_CAPSTONE_POLICY_ID).toBe("final-06-program-capstone-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[5]?.id).toBe("FINAL-06");
    expect(FINAL_ORCHESTRATOR_PHASES[5]?.taskSlot).toBe(200);
    expect(PROGRAM_COMPLETION_CAPSTONE_POLICY_ID).toBe("program-completion-capstone-exec01-v1");
  });

  it("passes EXEC-01 six-role program capstone re-cert against repo", () => {
    const report = auditFinal06ProgramCapstone();
    expect(report.passed).toBe(true);
    expect(report.programCapstonePassed).toBe(true);
    expect(report.allSixSubAuditsPassed).toBe(true);
    expect(report.final05Passed).toBe(true);
  });

  it("requires honest six-role registry and EXEC-01 audit surfaces", () => {
    const report = auditFinal06ProgramCapstone();
    expect(report.exec01PolicyPresent).toBe(true);
    expect(report.sixRoleRegistryHonest).toBe(true);
    expect(report.unitTestsPresent).toBe(true);
    expect(PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(6);
  });

  it("composes DEV-56, QA-45, DES-38, MKT-42, PM-06, and COMP-03 capstones", () => {
    const report = auditFinal06ProgramCapstone();
    expect(report.allSixSubAuditsPassed).toBe(true);
    expect(PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id)).toEqual([
      "DEV-56",
      "QA-45",
      "DES-38",
      "MKT-42",
      "PM-06",
      "COMP-03",
    ]);
  });
});
