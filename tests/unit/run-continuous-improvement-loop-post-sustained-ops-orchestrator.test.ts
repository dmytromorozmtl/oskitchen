import { describe, expect, it } from "vitest";

import { runContinuousImprovementLoopPostSustainedOpsOrchestrator } from "../../scripts/ops/run-continuous-improvement-loop-post-sustained-ops-orchestrator";

describe("run-continuous-improvement-loop-post-sustained-ops-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runContinuousImprovementLoopPostSustainedOpsOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era22-continuous-improvement-loop-post-sustained-ops-orchestrator-v1",
    );
    expect(summary.milestone).toBe("sustained_ops_blocked");
  });
});
