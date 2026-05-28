import { describe, expect, it } from "vitest";

import { runScaleReadinessPostMonth2Orchestrator } from "../../scripts/ops/run-scale-readiness-post-month2-orchestrator";

describe("run-scale-readiness-post-month2-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runScaleReadinessPostMonth2Orchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-scale-readiness-post-month2-orchestrator-v1");
    expect(summary.milestone).toBe("month2_blocked");
  });
});
