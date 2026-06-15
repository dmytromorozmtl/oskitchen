import { describe, expect, it } from "vitest";

import {
  auditFinal09CompetitorIntelligence,
  FINAL_09_COMPETITOR_INTELLIGENCE_POLICY_ID,
} from "@/lib/execution/final-09-competitor-intelligence-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID,
  COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/competitor/competitor-completion-capstone-patterns";

describe("final orchestrator FINAL-09 competitor intelligence capstone audit", () => {
  it("locks FINAL-09 policy and task slot 203", () => {
    expect(FINAL_09_COMPETITOR_INTELLIGENCE_POLICY_ID).toBe(
      "final-09-competitor-intelligence-v1",
    );
    expect(FINAL_ORCHESTRATOR_PHASES[8]?.id).toBe("FINAL-09");
    expect(FINAL_ORCHESTRATOR_PHASES[8]?.taskSlot).toBe(203);
    expect(COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID).toBe(
      "competitor-completion-capstone-comp03-v1",
    );
  });

  it("passes COMP-03 competitor intelligence re-cert against repo", () => {
    const report = auditFinal09CompetitorIntelligence();
    expect(report.passed).toBe(true);
    expect(report.competitorCapstonePassed).toBe(true);
    expect(report.allSubAuditsPassed).toBe(true);
    expect(report.final08Passed).toBe(true);
  });

  it("requires COMP-01 + COMP-02 registry and completion audit surfaces", () => {
    const report = auditFinal09CompetitorIntelligence();
    expect(report.comp03PolicyPresent).toBe(true);
    expect(report.twoCapstoneRegistryHonest).toBe(true);
    expect(report.unitTestsPresent).toBe(true);
    expect(report.comp03RoleDone).toBe(true);
    expect(COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES).toHaveLength(2);
  });

  it("composes P0 intelligence and leapfrog gap-closure capstones", () => {
    const report = auditFinal09CompetitorIntelligence();
    expect(report.allSubAuditsPassed).toBe(true);
    expect(COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES.map((p) => p.id)).toEqual([
      "COMP-01",
      "COMP-02",
    ]);
  });
});
