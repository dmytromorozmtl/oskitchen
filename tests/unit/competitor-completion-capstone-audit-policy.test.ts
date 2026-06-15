import { describe, expect, it } from "vitest";

import {
  auditCompetitorCompletionCapstone,
  COMPETITOR_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/competitor/competitor-completion-capstone-audit-policy";
import {
  COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID,
  COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/competitor/competitor-completion-capstone-patterns";

describe("competitor completion capstone audit (COMP-03)", () => {
  it("locks COMP-03 policy id and COMP-01 + COMP-02 registry", () => {
    expect(COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID).toBe(
      "competitor-completion-capstone-comp03-v1",
    );
    expect(COMPETITOR_COMPLETION_CAPSTONE_AUDIT_POLICY_ID).toBe(
      COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID,
    );
    expect(COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(2);
    expect(COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES[0]?.id).toBe("COMP-01");
    expect(COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("COMP-02");
  });

  it("composes both competitor capstone audits", () => {
    const report = auditCompetitorCompletionCapstone();
    expect(report.subAudits).toHaveLength(2);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full COMP-03 capstone against repo", () => {
    const report = auditCompetitorCompletionCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("reports nested sub-audit counts per competitor capstone", () => {
    const report = auditCompetitorCompletionCapstone();
    expect(report.subAudits.find((a) => a.taskId === "COMP-01")?.nestedSubAuditCount).toBe(5);
    expect(report.subAudits.find((a) => a.taskId === "COMP-02")?.nestedSubAuditCount).toBe(6);
    for (const sub of report.subAudits) {
      const entry = COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
