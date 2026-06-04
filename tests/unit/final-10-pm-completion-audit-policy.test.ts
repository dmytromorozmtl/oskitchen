import { describe, expect, it } from "vitest";

import {
  auditFinal10PmCompletion,
  FINAL_10_PM_COMPLETION_POLICY_ID,
} from "@/lib/execution/final-10-pm-completion-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  PM_COMPLETION_CAPSTONE_POLICY_ID,
  PM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-completion-capstone-patterns";

describe("final orchestrator FINAL-10 PM completion capstone audit", () => {
  it("locks FINAL-10 policy and task slot 204", () => {
    expect(FINAL_10_PM_COMPLETION_POLICY_ID).toBe("final-10-pm-completion-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[9]?.id).toBe("FINAL-10");
    expect(FINAL_ORCHESTRATOR_PHASES[9]?.taskSlot).toBe(204);
    expect(PM_COMPLETION_CAPSTONE_POLICY_ID).toBe("pm-completion-capstone-pm06-v1");
  });

  it("passes PM-06 program management capstone re-cert against repo", () => {
    const report = auditFinal10PmCompletion();
    expect(report.passed).toBe(true);
    expect(report.pmCapstonePassed).toBe(true);
    expect(report.allSubAuditsPassed).toBe(true);
    expect(report.final09Passed).toBe(true);
  });

  it("requires PM-01 through PM-05 registry and completion audit surfaces", () => {
    const report = auditFinal10PmCompletion();
    expect(report.pm06PolicyPresent).toBe(true);
    expect(report.fiveCapstoneRegistryHonest).toBe(true);
    expect(report.unitTestsPresent).toBe(true);
    expect(report.pm06RoleDone).toBe(true);
    expect(PM_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(5);
  });

  it("composes P0 foundation, GO/NO-GO, ops, GTM, and strategic planning capstones", () => {
    const report = auditFinal10PmCompletion();
    expect(report.allSubAuditsPassed).toBe(true);
    expect(PM_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id)).toEqual([
      "PM-01",
      "PM-02",
      "PM-03",
      "PM-04",
      "PM-05",
    ]);
  });
});
