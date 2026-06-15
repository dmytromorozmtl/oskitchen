import { describe, expect, it } from "vitest";

import {
  auditPmP0Foundation,
  PM_P0_FOUNDATION_AUDIT_POLICY_ID,
} from "@/lib/pm/pm-p0-foundation-audit-policy";
import {
  PM_P0_FOUNDATION_PATTERNS_POLICY_ID,
  PM_P0_FOUNDATION_SUB_POLICIES,
} from "@/lib/pm/pm-p0-foundation-patterns";

describe("PM P0 foundation capstone audit (PM-01)", () => {
  it("locks PM-01 policy id and five foundation doc registry", () => {
    expect(PM_P0_FOUNDATION_PATTERNS_POLICY_ID).toBe("pm-p0-foundation-patterns-pm01-v1");
    expect(PM_P0_FOUNDATION_AUDIT_POLICY_ID).toBe(PM_P0_FOUNDATION_PATTERNS_POLICY_ID);
    expect(PM_P0_FOUNDATION_SUB_POLICIES).toHaveLength(5);
    expect(PM_P0_FOUNDATION_SUB_POLICIES[0]?.id).toBe("PM-01a");
    expect(PM_P0_FOUNDATION_SUB_POLICIES.at(-1)?.id).toBe("PM-01e");
  });

  it("composes all five P0 PM foundation sub-audits", () => {
    const report = auditPmP0Foundation();
    expect(report.subAudits).toHaveLength(5);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      PM_P0_FOUNDATION_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full PM P0 foundation audit against repo", () => {
    const report = auditPmP0Foundation();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("aligns sub-audit policy ids with registry", () => {
    const report = auditPmP0Foundation();
    for (const sub of report.subAudits) {
      const entry = PM_P0_FOUNDATION_SUB_POLICIES.find((p) => p.id === sub.taskId);
      expect(sub.policyId).toBe(entry?.policyId);
    }
  });
});
