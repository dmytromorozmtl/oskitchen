import { describe, expect, it } from "vitest";

import { evaluateOwnerDailyBriefingBreakthroughEra25 } from "@/lib/commercial/evaluate-owner-daily-briefing-breakthrough-era25";

describe("evaluate-owner-daily-briefing-breakthrough-era25", () => {
  it("blocks slice when blueprint not ready", () => {
    const evaluation = evaluateOwnerDailyBriefingBreakthroughEra25({});
    expect(evaluation.sliceBlocked).toBe(true);
    expect(evaluation.briefingSchemeCount).toBe(5);
    expect(evaluation.allBriefingTilesWired).toBe(true);
    expect(evaluation.p0ProofStatus).toBe("awaiting_ops_credentials");
  });
});
