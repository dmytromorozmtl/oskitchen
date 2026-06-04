import { describe, expect, it } from "vitest";

import {
  auditDevBetaGovernanceCapstone,
  DEV_BETA_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/developer/dev-beta-governance-capstone-audit-policy";
import {
  DEV_BETA_GOVERNANCE_CAPSTONE_POLICY_ID,
  DEV_BETA_GOVERNANCE_CAPSTONE_SUB_POLICIES,
} from "@/lib/developer/dev-beta-governance-capstone-patterns";

describe("dev BETA governance capstone audit (DEV-56)", () => {
  it("locks DEV-56 policy id and three sub-policy registry", () => {
    expect(DEV_BETA_GOVERNANCE_CAPSTONE_POLICY_ID).toBe("dev-beta-governance-capstone-dev56-v1");
    expect(DEV_BETA_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID).toBe(DEV_BETA_GOVERNANCE_CAPSTONE_POLICY_ID);
    expect(DEV_BETA_GOVERNANCE_CAPSTONE_SUB_POLICIES).toHaveLength(3);
  });

  it("composes live DoD smoke doc, orchestrator, and artifact sub-audits", () => {
    const report = auditDevBetaGovernanceCapstone();
    expect(report.subAudits).toHaveLength(3);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      DEV_BETA_GOVERNANCE_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full DEV-56 capstone against repo", () => {
    const report = auditDevBetaGovernanceCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditDevBetaGovernanceCapstone();
    for (const sub of report.subAudits) {
      const entry = DEV_BETA_GOVERNANCE_CAPSTONE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
