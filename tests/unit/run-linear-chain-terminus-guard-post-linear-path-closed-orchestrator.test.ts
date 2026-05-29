import { describe, expect, it } from "vitest";

import { runLinearChainTerminusGuardPostLinearPathClosedOrchestrator } from "../../scripts/ops/run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator";

describe("run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runLinearChainTerminusGuardPostLinearPathClosedOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-linear-chain-terminus-guard-post-linear-path-closed-orchestrator-v1",
    );
    expect(summary.milestone).toBe("linear_path_closure_blocked");
    expect(summary.step17Forbidden).toBe(true);
  });
});
