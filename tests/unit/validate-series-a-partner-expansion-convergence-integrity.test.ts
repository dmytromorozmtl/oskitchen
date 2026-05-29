import { describe, expect, it } from "vitest";

import { evaluateSeriesAPartnerExpansionConvergenceIntegrity } from "@/scripts/ops/validate-series-a-partner-expansion-convergence-integrity";

describe("validate-series-a-partner-expansion-convergence-integrity script export", () => {
  it("re-exports era51 evaluator", () => {
    const result = evaluateSeriesAPartnerExpansionConvergenceIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era51-series-a-partner-expansion-convergence-integrity-v1");
  });
});
