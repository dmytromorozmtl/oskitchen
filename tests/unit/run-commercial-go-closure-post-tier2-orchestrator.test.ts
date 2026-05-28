import { describe, expect, it } from "vitest";

import { runCommercialGoClosurePostTier2Orchestrator } from "../../scripts/ops/run-commercial-go-closure-post-tier2-orchestrator";

describe("run-commercial-go-closure-post-tier2-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runCommercialGoClosurePostTier2Orchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-commercial-go-closure-post-tier2-orchestrator-v1");
    expect(summary.milestone).toBe("tier2_blocked");
  });
});
