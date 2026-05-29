import { describe, expect, it } from "vitest";

import { buildCommercialInflectionReadinessOrchestratorReportMarkdown } from "@/lib/commercial/commercial-inflection-readiness-post-linear-closure-orchestrator-era28";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateCommercialInflectionReadiness as evaluateFromValidate } from "../../scripts/ops/validate-commercial-inflection-readiness";

describe("validate-commercial-inflection-readiness", () => {
  it("re-exports evaluate without throwing", () => {
    expect(() => evaluateFromValidate({})).not.toThrow();
  });

  it("reports honest p0_ops_vault_blocked locally", () => {
    const result = evaluateCommercialInflectionReadiness({});
    expect(result.milestone).toBe("p0_ops_vault_blocked");
    expect(result.blockers.some((row) => row.id === "p0_ops_vault_11_env")).toBe(true);
    expect(result.blockers.some((row) => row.id === "stop_skipped_as_pass")).toBe(true);
  });

  it("builds sync report markdown via orchestrator builder", () => {
    const evaluation = evaluateCommercialInflectionReadiness({});
    const markdown = buildCommercialInflectionReadinessOrchestratorReportMarkdown({
      ...evaluation,
      policyId: "commercial-inflection-readiness-post-linear-closure-orchestrator-v1",
      inflectionReportPresent: false,
      recommendedCommands: [
        "npm run ops:validate-commercial-inflection-readiness -- --json",
      ],
    });
    expect(markdown).toContain("artifacts/commercial-inflection-readiness-report.md");
  });
});
