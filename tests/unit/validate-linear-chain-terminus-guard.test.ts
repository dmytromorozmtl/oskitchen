import { describe, expect, it } from "vitest";

import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { buildLinearChainTerminusGuardReportMarkdown } from "../../scripts/ops/sync-linear-chain-terminus-guard-report";
import { evaluateLinearChainTerminusGuardWithMilestones } from "../../scripts/ops/validate-linear-chain-terminus-guard";

describe("validate-linear-chain-terminus-guard", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateLinearChainTerminusGuard()).not.toThrow();
  });

  it("reports guard PASS for repo integrity", () => {
    const result = evaluateLinearChainTerminusGuard();
    expect(result.guardPassed).toBe(true);
    expect(result.step18DocPresent).toBe(false);
  });

  it("wraps milestones for validate JSON", () => {
    const result = evaluateLinearChainTerminusGuardWithMilestones({});
    expect(result.linearChainTerminusGuardMilestone).toBe("linear_path_closure_blocked");
    expect(result.readyForLinearPathClosureSmokes).toBe(true);
    expect(result.guard.guardPassed).toBe(true);
  });

  it("builds terminus guard report", () => {
    const result = evaluateLinearChainTerminusGuardWithMilestones({});
    const markdown = buildLinearChainTerminusGuardReportMarkdown(result);
    expect(markdown).toContain("Linear Chain Terminus Guard Report");
    expect(markdown).toContain("Step 17 FORBIDDEN");
    expect(markdown).toContain("Guard milestone");
  });
});
