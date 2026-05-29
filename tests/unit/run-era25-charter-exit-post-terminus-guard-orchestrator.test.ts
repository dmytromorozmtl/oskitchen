import { describe, expect, it } from "vitest";

import { runEra25CharterExitPostTerminusGuardOrchestrator } from "../../scripts/ops/run-era25-charter-exit-post-terminus-guard-orchestrator";

describe("run-era25-charter-exit-post-terminus-guard-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runEra25CharterExitPostTerminusGuardOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-era25-charter-exit-post-terminus-guard-orchestrator-v1",
    );
    expect(summary.milestone).toBe("terminus_guard_blocked");
  });
});
