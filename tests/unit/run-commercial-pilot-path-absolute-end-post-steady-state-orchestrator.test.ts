import { describe, expect, it } from "vitest";

import { runCommercialPilotPathAbsoluteEndPostSteadyStateOrchestrator } from "../../scripts/ops/run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator";

describe("run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runCommercialPilotPathAbsoluteEndPostSteadyStateOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-commercial-pilot-path-absolute-end-post-steady-state-orchestrator-v1",
    );
    expect(summary.milestone).toBe("steady_state_blocked");
  });
});
