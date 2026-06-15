import { describe, expect, it } from "vitest";

import { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";
import { buildLinearPathPermanentlyClosedReportMarkdown } from "../../scripts/ops/sync-linear-path-permanently-closed-report";
import { evaluateLinearPathPermanentlyClosedWithMilestones } from "../../scripts/ops/validate-linear-path-permanently-closed";

describe("validate-linear-path-permanently-closed", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateLinearPathPermanentlyClosed({})).not.toThrow();
  });

  it("reports honest not-active locally", () => {
    const result = evaluateLinearPathPermanentlyClosed({});
    expect(result.terminalClosureActive).toBe(false);
    expect(result.linearPathPermanentlyClosed).toBe(true);
    expect(result.docChainSteps).toBe(16);
    expect(result.totalSteps).toBe(16);
  });

  it("wraps milestones for validate JSON", () => {
    const result = evaluateLinearPathPermanentlyClosedWithMilestones({});
    expect(result.linearPathPermanentlyClosedMilestone).toBe("era25_sustained_ops_convergence_blocked");
    expect(result.readyForAbsoluteEndSmokes).toBe(true);
    expect(result.missingDocChainDocs).toEqual([]);
    expect(result.guard.guardPassed).toBe(true);
  });

  it("builds terminal closure report", () => {
    const result = evaluateLinearPathPermanentlyClosedWithMilestones({});
    const markdown = buildLinearPathPermanentlyClosedReportMarkdown(result);
    expect(markdown).toContain("Linear Path — Permanently Closed Report");
    expect(markdown).toContain("next-step-16-linear-path-permanently-closed");
    expect(markdown).toContain("Linear path milestone");
    expect(markdown).toContain("Step 17+");
  });
});
