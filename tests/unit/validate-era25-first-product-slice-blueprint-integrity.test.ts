import { describe, expect, it } from "vitest";

import { evaluateEra25FirstProductSliceBlueprintIntegrity } from "@/scripts/ops/validate-era25-first-product-slice-blueprint-integrity";

describe("validate-era25-first-product-slice-blueprint-integrity", () => {
  it("exports evaluator for ops script", () => {
    const result = evaluateEra25FirstProductSliceBlueprintIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era45-era25-first-product-slice-blueprint-integrity-v1");
    expect(Array.isArray(result.recommendedCommands)).toBe(true);
  });
});
