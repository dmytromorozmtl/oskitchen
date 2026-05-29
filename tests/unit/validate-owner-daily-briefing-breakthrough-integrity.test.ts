import { describe, expect, it } from "vitest";

import { evaluateOwnerDailyBriefingBreakthroughIntegrity } from "@/scripts/ops/validate-owner-daily-briefing-breakthrough-integrity";

describe("validate-owner-daily-briefing-breakthrough-integrity", () => {
  it("exports evaluator for ops script", () => {
    const result = evaluateOwnerDailyBriefingBreakthroughIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era46-owner-daily-briefing-breakthrough-integrity-v1");
    expect(Array.isArray(result.recommendedCommands)).toBe(true);
  });
});
