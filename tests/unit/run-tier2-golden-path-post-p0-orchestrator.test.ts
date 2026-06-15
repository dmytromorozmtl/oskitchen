import { describe, expect, it } from "vitest";

import { runTier2GoldenPathPostP0Orchestrator } from "../../scripts/ops/run-tier2-golden-path-post-p0-orchestrator";

describe("run-tier2-golden-path-post-p0-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runTier2GoldenPathPostP0Orchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-tier2-golden-path-post-p0-orchestrator-v1");
    expect(summary.milestone).not.toBe("proof_passed");
  });
});
