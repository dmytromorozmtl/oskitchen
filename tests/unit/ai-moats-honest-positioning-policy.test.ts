import { describe, expect, it } from "vitest";

import {
  auditAiMoatsHonestPositioningPage,
  AI_MOATS_CORE_MODULE_IDS,
  AI_MOATS_HONEST_POSITIONING_HEADLINE,
  AI_MOATS_HONEST_POSITIONING_POLICY_ID,
  AI_MOATS_HONEST_POSITIONING_PUBLIC_PATH,
  lintAiMoatsHonestPositioningCopy,
} from "@/lib/marketing/ai-moats-honest-positioning-policy";

describe("AI moats honest positioning policy (MKT-17)", () => {
  it("locks MKT-17 policy id and public /ai route", () => {
    expect(AI_MOATS_HONEST_POSITIONING_POLICY_ID).toBe(
      "ai-moats-honest-positioning-mkt17-v1",
    );
    expect(AI_MOATS_HONEST_POSITIONING_PUBLIC_PATH).toBe("/ai");
    expect(AI_MOATS_CORE_MODULE_IDS).toHaveLength(7);
    expect(AI_MOATS_HONEST_POSITIONING_HEADLINE).toContain("7 proprietary");
  });

  it("passes page + doc audit for honest positioning surface", () => {
    const audit = auditAiMoatsHonestPositioningPage();
    expect(audit.passed).toBe(true);
    expect(audit.missingPageMarkers).toEqual([]);
    expect(audit.missingDocHeadings).toEqual([]);
  });

  it("flags forbidden AI hype in copy", () => {
    const result = lintAiMoatsHonestPositioningCopy(
      "Our untouchable AI delivers fully autonomous restaurant AI with guaranteed margin and Toast IQ parity.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows qualified module maturity copy", () => {
    const result = lintAiMoatsHonestPositioningCopy(
      "7 proprietary AI modules in production — pilot ready and BETA labels per module.",
    );
    expect(result.passed).toBe(true);
  });
});
