import { describe, expect, it } from "vitest";

import {
  auditPmOpsGovernanceCapstone,
  PM_OPS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/pm/pm-ops-governance-capstone-audit-policy";
import {
  PM_OPS_GOVERNANCE_CAPSTONE_POLICY_ID,
  PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-ops-governance-capstone-patterns";

describe("PM ops governance capstone audit (PM-03)", () => {
  it("locks PM-03 policy id and five-surface registry", () => {
    expect(PM_OPS_GOVERNANCE_CAPSTONE_POLICY_ID).toBe("pm-ops-governance-capstone-pm03-v1");
    expect(PM_OPS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID).toBe(PM_OPS_GOVERNANCE_CAPSTONE_POLICY_ID);
    expect(PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES).toHaveLength(5);
    expect(PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("PM-02");
  });

  it("composes incident, integration, triage, era freeze, and PM-02 sub-audits", () => {
    const report = auditPmOpsGovernanceCapstone();
    expect(report.subAudits).toHaveLength(5);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full PM ops governance capstone against repo", () => {
    const report = auditPmOpsGovernanceCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditPmOpsGovernanceCapstone();
    for (const sub of report.subAudits) {
      const entry = PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
