import { describe, expect, it } from "vitest";

import {
  auditMarketingClaimsGovernanceCapstone,
  MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/marketing/marketing-claims-governance-capstone-audit-policy";
import {
  MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_POLICY_ID,
  MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-claims-governance-capstone-patterns";

describe("marketing claims governance capstone audit (MKT-40)", () => {
  it("locks MKT-40 policy id and six-surface registry", () => {
    expect(MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_POLICY_ID).toBe(
      "marketing-claims-governance-capstone-mkt40-v1",
    );
    expect(MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID).toBe(
      MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_POLICY_ID,
    );
    expect(MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES).toHaveLength(6);
    expect(MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("MKT-39");
  });

  it("composes all claims governance sub-audits", () => {
    const report = auditMarketingClaimsGovernanceCapstone();
    expect(report.subAudits).toHaveLength(6);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full marketing claims governance capstone against repo", () => {
    const report = auditMarketingClaimsGovernanceCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditMarketingClaimsGovernanceCapstone();
    for (const sub of report.subAudits) {
      const entry = MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES.find(
        (p) => p.id === sub.taskId,
      );
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
