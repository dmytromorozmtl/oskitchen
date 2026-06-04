import { describe, expect, it } from "vitest";

import {
  auditFinal12DesignStabilization,
  FINAL_12_DESIGN_STABILIZATION_POLICY_ID,
} from "@/lib/execution/final-12-design-stabilization-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  STABILIZATION_DESIGN_PATTERNS_POLICY_ID,
  STABILIZATION_DESIGN_SUB_POLICIES,
} from "@/lib/design/stabilization-design-patterns";

describe("final orchestrator FINAL-12 DES-38 stabilization design audit", () => {
  it("locks FINAL-12 policy and task slot 206", () => {
    expect(FINAL_12_DESIGN_STABILIZATION_POLICY_ID).toBe("final-12-design-stabilization-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[11]?.id).toBe("FINAL-12");
    expect(FINAL_ORCHESTRATOR_PHASES[11]?.taskSlot).toBe(206);
    expect(STABILIZATION_DESIGN_PATTERNS_POLICY_ID).toBe(
      "stabilization-design-patterns-des38-v1",
    );
  });

  it("passes DES-38 stabilization design capstone re-cert against repo", () => {
    const report = auditFinal12DesignStabilization();
    expect(report.passed).toBe(true);
    expect(report.stabilizationDesignPassed).toBe(true);
    expect(report.allSubAuditsPassed).toBe(true);
    expect(report.final11Passed).toBe(true);
  });

  it("requires DES-27 through DES-37 registry and audit surfaces", () => {
    const report = auditFinal12DesignStabilization();
    expect(report.des38PolicyPresent).toBe(true);
    expect(report.elevenSubPolicyRegistryHonest).toBe(true);
    expect(report.unitTestsPresent).toBe(true);
    expect(report.des38RoleDone).toBe(true);
    expect(STABILIZATION_DESIGN_SUB_POLICIES).toHaveLength(11);
  });

  it("composes page layout, loading, forms, states, and permission-denied audits", () => {
    const report = auditFinal12DesignStabilization();
    expect(report.allSubAuditsPassed).toBe(true);
    expect(STABILIZATION_DESIGN_SUB_POLICIES[0]?.id).toBe("DES-27");
    expect(STABILIZATION_DESIGN_SUB_POLICIES.at(-1)?.id).toBe("DES-37");
  });
});
