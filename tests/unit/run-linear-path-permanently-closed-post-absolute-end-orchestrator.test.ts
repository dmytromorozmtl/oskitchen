import { describe, expect, it } from "vitest";

import { runLinearPathPermanentlyClosedPostAbsoluteEndOrchestrator } from "../../scripts/ops/run-linear-path-permanently-closed-post-absolute-end-orchestrator";

describe("run-linear-path-permanently-closed-post-absolute-end-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runLinearPathPermanentlyClosedPostAbsoluteEndOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-linear-path-permanently-closed-post-absolute-end-orchestrator-v1",
    );
    expect(summary.milestone).toBe("era25_sustained_ops_convergence_blocked");
  });
});
