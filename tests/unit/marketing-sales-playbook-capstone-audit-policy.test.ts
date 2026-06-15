import { describe, expect, it } from "vitest";

import {
  auditMarketingSalesPlaybookCapstone,
  MARKETING_SALES_PLAYBOOK_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/marketing/marketing-sales-playbook-capstone-audit-policy";
import {
  MARKETING_SALES_PLAYBOOK_CAPSTONE_POLICY_ID,
  MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-sales-playbook-capstone-patterns";

describe("marketing sales playbook capstone audit (MKT-41)", () => {
  it("locks MKT-41 policy id and six-surface registry", () => {
    expect(MARKETING_SALES_PLAYBOOK_CAPSTONE_POLICY_ID).toBe(
      "marketing-sales-playbook-capstone-mkt41-v1",
    );
    expect(MARKETING_SALES_PLAYBOOK_CAPSTONE_AUDIT_POLICY_ID).toBe(
      MARKETING_SALES_PLAYBOOK_CAPSTONE_POLICY_ID,
    );
    expect(MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES).toHaveLength(6);
    expect(MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("MKT-40");
  });

  it("composes all sales playbook sub-audits", () => {
    const report = auditMarketingSalesPlaybookCapstone();
    expect(report.subAudits).toHaveLength(6);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full marketing sales playbook capstone against repo", () => {
    const report = auditMarketingSalesPlaybookCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditMarketingSalesPlaybookCapstone();
    for (const sub of report.subAudits) {
      const entry = MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES.find(
        (p) => p.id === sub.taskId,
      );
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
