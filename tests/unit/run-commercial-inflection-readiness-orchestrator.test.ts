import { describe, expect, it } from "vitest";

import { runCommercialInflectionReadinessOrchestrator } from "../../scripts/ops/run-commercial-inflection-readiness-orchestrator";

describe("run-commercial-inflection-readiness-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runCommercialInflectionReadinessOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "commercial-inflection-readiness-post-linear-closure-orchestrator-v1",
    );
    expect(summary.milestone).toBe("p0_ops_vault_blocked");
    expect(summary.p0VaultMissingCount).toBe(11);
    expect(summary.p0ProofStatus).toBeTruthy();
  });
});
