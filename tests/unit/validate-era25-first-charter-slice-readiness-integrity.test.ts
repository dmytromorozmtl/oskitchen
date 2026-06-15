import { describe, expect, it } from "vitest";

import { evaluateEra25FirstCharterSliceReadinessIntegrity } from "@/scripts/ops/validate-era25-first-charter-slice-readiness-integrity";

describe("validate-era25-first-charter-slice-readiness-integrity", () => {
  it("exports evaluator for ops script", () => {
    const result = evaluateEra25FirstCharterSliceReadinessIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era43-era25-first-charter-slice-readiness-integrity-v1");
    expect(Array.isArray(result.recommendedCommands)).toBe(true);
  });
});
