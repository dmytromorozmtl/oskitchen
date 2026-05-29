import { describe, expect, it } from "vitest";

import { runSustainedProductEvolutionPostImprovementLoopOrchestrator } from "../../scripts/ops/run-sustained-product-evolution-post-improvement-loop-orchestrator";

describe("run-sustained-product-evolution-post-improvement-loop-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runSustainedProductEvolutionPostImprovementLoopOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era23-sustained-product-evolution-post-improvement-loop-orchestrator-v1",
    );
    expect(summary.milestone).toBe("improvement_loop_blocked");
  });
});
