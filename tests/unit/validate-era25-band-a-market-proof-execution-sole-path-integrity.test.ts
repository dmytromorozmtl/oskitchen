import { describe, expect, it } from "vitest";

import { evaluateEra25BandAMarketProofExecutionSolePathIntegrity } from "@/scripts/ops/validate-era25-band-a-market-proof-execution-sole-path-integrity";

describe("validate-era25-band-a-market-proof-execution-sole-path-integrity", () => {
  it("re-exports era61 evaluator", () => {
    const result = evaluateEra25BandAMarketProofExecutionSolePathIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era61-era25-band-a-market-proof-execution-sole-path-integrity-v1");
  });
});
