import { describe, expect, it } from "vitest";

import { buildP0VaultDay0OrchestratorSummary } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { runP0VaultDay0Orchestrator } from "../../scripts/ops/run-p0-vault-day0-orchestrator";

describe("run-p0-vault-day0-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template and health", async () => {
    const summary = await runP0VaultDay0Orchestrator({
      writeArtifacts: false,
      skipHealth: true,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-p0-ops-vault-day0-orchestrator-v1");
    expect(summary.envTotalCount).toBe(11);
  });

  it("summary includes milestone fields", () => {
    const summary = buildP0VaultDay0OrchestratorSummary({
      env: {
        present: [],
        missing: ["E2E_STAGING_BASE_URL"],
        phases: [],
        allPresent: false,
        day0PartialComplete: false,
        day0Milestone: "blocked",
      },
      artifact: null,
      stagingHealth: {
        checked: false,
        ok: false,
        url: null,
        statusCode: null,
        error: "skipped",
      },
    });
    expect(summary.milestone).toBe("blocked");
  });
});
