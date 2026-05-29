import { describe, expect, it } from "vitest";

import { runPostTerminusSteadyStatePostEngineeringTerminusOrchestrator } from "../../scripts/ops/run-post-terminus-steady-state-post-engineering-terminus-orchestrator";

describe("run-post-terminus-steady-state-post-engineering-terminus-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runPostTerminusSteadyStatePostEngineeringTerminusOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-post-terminus-steady-state-post-engineering-terminus-orchestrator-v1",
    );
    expect(summary.milestone).toBe("engineering_terminus_blocked");
  });
});
