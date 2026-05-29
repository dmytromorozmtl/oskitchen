import { describe, expect, it } from "vitest";

import { runEra25FirstCharterSliceReadinessPostCharterExitOrchestrator } from "../../scripts/ops/run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator";

describe("run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runEra25FirstCharterSliceReadinessPostCharterExitOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-era25-first-charter-slice-readiness-post-charter-exit-orchestrator-v1",
    );
    expect(summary.milestone).toBe("charter_exit_blocked");
  });
});
