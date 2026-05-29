import { describe, expect, it } from "vitest";

import {
  buildCommercialInflectionReadinessOrchestratorReportMarkdown,
  buildCommercialInflectionReadinessOrchestratorSummary,
  COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/commercial-inflection-readiness-post-linear-closure-orchestrator-era28";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";

describe("commercial-inflection-readiness-orchestrator-era28", () => {
  it("builds orchestrator summary with post-linear policy id", () => {
    const evaluation = evaluateCommercialInflectionReadiness({});
    const summary = buildCommercialInflectionReadinessOrchestratorSummary({
      evaluation,
      artifacts: { inflectionReportPresent: false },
    });
    expect(summary.policyId).toBe(
      COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID,
    );
    expect(summary.milestone).toBe("p0_ops_vault_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "run-commercial-inflection-readiness-orchestrator",
    );
    expect(summary.recommendedCommands).toContain(
      "npm run ops:run-p0-vault-day0-orchestrator -- --json",
    );
  });

  it("builds orchestrator report markdown with matrix and execution doc links", () => {
    const evaluation = evaluateCommercialInflectionReadiness({});
    const summary = buildCommercialInflectionReadinessOrchestratorSummary({
      evaluation,
      artifacts: { inflectionReportPresent: false },
    });
    const markdown = buildCommercialInflectionReadinessOrchestratorReportMarkdown(summary);
    expect(markdown).toContain("Commercial Inflection Readiness — Report");
    expect(markdown).toContain("p0_ops_vault_blocked");
    expect(markdown).toContain("commercial-inflection-master-blocker-matrix");
    expect(markdown).toContain("next-step-commercial-inflection-execution");
    expect(markdown).toContain("#commercial-inflection-readiness");
    expect(markdown).toContain("Governance 100 ≠ market ready");
  });
});
