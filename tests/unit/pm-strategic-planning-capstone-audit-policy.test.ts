import { describe, expect, it } from "vitest";

import {
  auditPmStrategicPlanningCapstone,
  PM_STRATEGIC_PLANNING_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/pm/pm-strategic-planning-capstone-audit-policy";
import {
  PM_STRATEGIC_PLANNING_CAPSTONE_POLICY_ID,
  PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-strategic-planning-capstone-patterns";

describe("PM strategic planning capstone audit (PM-05)", () => {
  it("locks PM-05 policy id and six-surface registry", () => {
    expect(PM_STRATEGIC_PLANNING_CAPSTONE_POLICY_ID).toBe(
      "pm-strategic-planning-capstone-pm05-v1",
    );
    expect(PM_STRATEGIC_PLANNING_CAPSTONE_AUDIT_POLICY_ID).toBe(
      PM_STRATEGIC_PLANNING_CAPSTONE_POLICY_ID,
    );
    expect(PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES).toHaveLength(6);
    expect(PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("PM-04");
  });

  it("composes OKRs, Series A, SOC2, marketplace pricing, and PM-04", () => {
    const report = auditPmStrategicPlanningCapstone();
    expect(report.subAudits).toHaveLength(6);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full PM strategic planning capstone against repo", () => {
    const report = auditPmStrategicPlanningCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditPmStrategicPlanningCapstone();
    for (const sub of report.subAudits) {
      const entry = PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
