import { describe, expect, it } from "vitest";

import {
  auditStabilizationDesign,
  STABILIZATION_DESIGN_AUDIT_POLICY_ID,
} from "@/lib/design/stabilization-design-audit-policy";
import {
  STABILIZATION_DESIGN_PATTERNS_POLICY_ID,
  STABILIZATION_DESIGN_SUB_POLICIES,
} from "@/lib/design/stabilization-design-patterns";

describe("stabilization design capstone audit (DES-38)", () => {
  it("locks DES-38 policy id and sub-policy registry", () => {
    expect(STABILIZATION_DESIGN_PATTERNS_POLICY_ID).toBe("stabilization-design-patterns-des38-v1");
    expect(STABILIZATION_DESIGN_AUDIT_POLICY_ID).toBe(STABILIZATION_DESIGN_PATTERNS_POLICY_ID);
    expect(STABILIZATION_DESIGN_SUB_POLICIES).toHaveLength(11);
    expect(STABILIZATION_DESIGN_SUB_POLICIES[0]?.id).toBe("DES-27");
    expect(STABILIZATION_DESIGN_SUB_POLICIES.at(-1)?.id).toBe("DES-37");
  });

  it("composes all DES-27 through DES-37 sub-audits", () => {
    const report = auditStabilizationDesign();
    expect(report.subAudits).toHaveLength(11);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      STABILIZATION_DESIGN_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full stabilization design audit against repo", () => {
    const report = auditStabilizationDesign();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("reports module counts for each sub-audit", () => {
    const report = auditStabilizationDesign();
    for (const sub of report.subAudits) {
      expect(sub.moduleCount).toBeGreaterThan(0);
      expect(sub.policyId).toMatch(/des2[7-9]|des3[0-7]/);
    }
  });
});
