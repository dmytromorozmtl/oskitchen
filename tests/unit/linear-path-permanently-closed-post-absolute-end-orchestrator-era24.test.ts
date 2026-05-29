import { describe, expect, it } from "vitest";

import {
  buildLinearPathPermanentlyClosedOrchestratorReportMarkdown,
  buildLinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary,
  resolveLinearPathPermanentlyClosedMilestone,
  resolveMissingDocChainDocs,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";
import { evaluateLinearPathPermanentlyClosedWithMilestones } from "@/scripts/ops/validate-linear-path-permanently-closed";

describe("linear-path-permanently-closed-post-absolute-end-orchestrator-era24", () => {
  it("blocks when absolute end is not healthy", () => {
    const result = evaluateLinearPathPermanentlyClosedWithMilestones({});
    expect(result.linearPathPermanentlyClosedMilestone).toBe("absolute_end_blocked");
    expect(result.evaluation.terminalClosureActive).toBe(false);
  });

  it("resolves attention_doc_chain when docs are missing", () => {
    const milestone = resolveLinearPathPermanentlyClosedMilestone({
      terminalClosureActive: true,
      absoluteEndMilestone: "absolute_end_healthy",
      missingDocChainDocs: ["docs/missing-doc.md"],
      terminusGuardPassed: true,
    });
    expect(milestone).toBe("attention_doc_chain");
  });

  it("resolves attention_terminus_guard when guard fails", () => {
    const milestone = resolveLinearPathPermanentlyClosedMilestone({
      terminalClosureActive: true,
      absoluteEndMilestone: "absolute_end_healthy",
      missingDocChainDocs: [],
      terminusGuardPassed: false,
    });
    expect(milestone).toBe("attention_terminus_guard");
  });

  it("resolves linear_path_permanently_closed_healthy when chain and guard pass", () => {
    const milestone = resolveLinearPathPermanentlyClosedMilestone({
      terminalClosureActive: true,
      absoluteEndMilestone: "absolute_end_healthy",
      missingDocChainDocs: [],
      terminusGuardPassed: true,
    });
    expect(milestone).toBe("linear_path_permanently_closed_healthy");
  });

  it("finds no missing docs in live repo", () => {
    expect(resolveMissingDocChainDocs()).toEqual([]);
  });

  it("builds orchestrator summary with Step 15 redirect when blocked", () => {
    const evaluation = evaluateLinearPathPermanentlyClosed({});
    const guard = evaluateLinearChainTerminusGuard();
    const summary = buildLinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary({
      evaluation,
      absoluteEndMilestone: "steady_state_blocked",
      missingDocChainDocs: [],
      terminusGuardPassed: guard.guardPassed,
      terminusGuardViolationCount: guard.violations.length,
      artifacts: { linearPathReportPresent: false },
    });
    expect(summary.milestone).toBe("absolute_end_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "commercial-pilot-path-absolute-end-post-steady-state-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateLinearPathPermanentlyClosed({});
    const guard = evaluateLinearChainTerminusGuard();
    const summary = buildLinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary({
      evaluation,
      absoluteEndMilestone: "steady_state_blocked",
      missingDocChainDocs: [],
      terminusGuardPassed: guard.guardPassed,
      terminusGuardViolationCount: guard.violations.length,
      artifacts: { linearPathReportPresent: false },
    });
    const markdown = buildLinearPathPermanentlyClosedOrchestratorReportMarkdown({
      summary,
      evaluation,
      guard,
    });
    expect(markdown).toContain("Linear Path Permanently Closed — Orchestrator Report");
    expect(markdown).toContain("#linear-path-permanently-closed");
    expect(markdown).toContain("Step 17 FORBIDDEN");
  });
});
