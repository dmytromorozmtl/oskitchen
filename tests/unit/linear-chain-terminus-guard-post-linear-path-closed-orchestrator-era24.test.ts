import { describe, expect, it } from "vitest";

import {
  buildLinearChainTerminusGuardOrchestratorReportMarkdown,
  buildLinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary,
  resolveLinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearChainTerminusGuardWithMilestones } from "@/scripts/ops/validate-linear-chain-terminus-guard";

describe("linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24", () => {
  it("blocks when linear path is not healthy", () => {
    const result = evaluateLinearChainTerminusGuardWithMilestones({});
    expect(result.linearChainTerminusGuardMilestone).toBe("linear_path_closure_blocked");
  });

  it("resolves attention_catalog_integrity when guard fails", () => {
    const milestone = resolveLinearChainTerminusGuardMilestone({
      linearPathPermanentlyClosedMilestone: "linear_path_permanently_closed_healthy",
      guardPassed: false,
    });
    expect(milestone).toBe("attention_catalog_integrity");
  });

  it("resolves step17_forbidden_healthy when guard passes", () => {
    const milestone = resolveLinearChainTerminusGuardMilestone({
      linearPathPermanentlyClosedMilestone: "linear_path_permanently_closed_healthy",
      guardPassed: true,
    });
    expect(milestone).toBe("step17_forbidden_healthy");
  });

  it("builds orchestrator summary with Step 16 redirect when blocked", () => {
    const guard = evaluateLinearChainTerminusGuard();
    const summary = buildLinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary({
      guard,
      linearPathPermanentlyClosedMilestone: "absolute_end_blocked",
      artifacts: { terminusGuardReportPresent: false },
    });
    expect(summary.milestone).toBe("linear_path_closure_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "linear-path-permanently-closed-post-absolute-end-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const guard = evaluateLinearChainTerminusGuard();
    const summary = buildLinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary({
      guard,
      linearPathPermanentlyClosedMilestone: "linear_path_permanently_closed_healthy",
      artifacts: { terminusGuardReportPresent: false },
    });
    const markdown = buildLinearChainTerminusGuardOrchestratorReportMarkdown({ summary, guard });
    expect(markdown).toContain("Linear Chain Terminus Guard — Orchestrator Report");
    expect(markdown).toContain("#linear-chain-step17-forbidden");
    expect(markdown).toContain("Step 17 FORBIDDEN");
  });
});
