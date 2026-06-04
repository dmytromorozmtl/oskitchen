import { describe, expect, it } from "vitest";

import {
  auditFinal11MarketingCompletion,
  FINAL_11_MARKETING_COMPLETION_POLICY_ID,
} from "@/lib/execution/final-11-marketing-completion-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  MARKETING_COMPLETION_CAPSTONE_POLICY_ID,
  MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-completion-capstone-patterns";

describe("final orchestrator FINAL-11 marketing completion capstone audit", () => {
  it("locks FINAL-11 policy and task slot 205", () => {
    expect(FINAL_11_MARKETING_COMPLETION_POLICY_ID).toBe("final-11-marketing-completion-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[10]?.id).toBe("FINAL-11");
    expect(FINAL_ORCHESTRATOR_PHASES[10]?.taskSlot).toBe(205);
    expect(MARKETING_COMPLETION_CAPSTONE_POLICY_ID).toBe(
      "marketing-completion-capstone-mkt42-v1",
    );
  });

  it("passes MKT-42 marketing completion capstone re-cert against repo", () => {
    const report = auditFinal11MarketingCompletion();
    expect(report.passed).toBe(true);
    expect(report.marketingCapstonePassed).toBe(true);
    expect(report.allSubAuditsPassed).toBe(true);
    expect(report.final10Passed).toBe(true);
  });

  it("requires MKT-39 through MKT-41 registry and completion audit surfaces", () => {
    const report = auditFinal11MarketingCompletion();
    expect(report.mkt42PolicyPresent).toBe(true);
    expect(report.threeCapstoneRegistryHonest).toBe(true);
    expect(report.unitTestsPresent).toBe(true);
    expect(report.mkt42RoleDone).toBe(true);
    expect(MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(3);
  });

  it("composes full stabilization, claims governance, and sales playbook capstones", () => {
    const report = auditFinal11MarketingCompletion();
    expect(report.allSubAuditsPassed).toBe(true);
    expect(MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id)).toEqual([
      "MKT-39",
      "MKT-40",
      "MKT-41",
    ]);
  });
});
