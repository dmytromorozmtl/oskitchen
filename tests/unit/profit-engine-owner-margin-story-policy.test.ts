import { describe, expect, it } from "vitest";

import {
  auditProfitEngineOwnerMarginStoryDoc,
  lintProfitEngineOwnerMarginStoryCopy,
  PROFIT_ENGINE_OWNER_MARGIN_ONE_LINE_PITCH,
  PROFIT_ENGINE_OWNER_MARGIN_ROUTES,
  PROFIT_ENGINE_OWNER_MARGIN_STORY_BEATS,
  PROFIT_ENGINE_OWNER_MARGIN_STORY_POLICY_ID,
  totalProfitEngineOwnerMarginStoryDurationSec,
} from "@/lib/marketing/profit-engine-owner-margin-story-policy";

describe("profit engine owner margin story policy (MKT-15)", () => {
  it("locks MKT-15 policy id and 2-minute owner story arc", () => {
    expect(PROFIT_ENGINE_OWNER_MARGIN_STORY_POLICY_ID).toBe(
      "profit-engine-owner-margin-story-mkt15-v1",
    );
    expect(PROFIT_ENGINE_OWNER_MARGIN_STORY_BEATS).toHaveLength(5);
    expect(totalProfitEngineOwnerMarginStoryDurationSec()).toBe(120);
    expect(PROFIT_ENGINE_OWNER_MARGIN_ONE_LINE_PITCH).toContain("COGS");
  });

  it("maps three owner-facing profit routes", () => {
    expect(PROFIT_ENGINE_OWNER_MARGIN_ROUTES).toContain("/dashboard/today/profit");
    expect(PROFIT_ENGINE_OWNER_MARGIN_ROUTES).toHaveLength(3);
  });

  it("passes audit on canonical owner margin story doc", () => {
    const audit = auditProfitEngineOwnerMarginStoryDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
  });

  it("flags forbidden margin claims in copy", () => {
    const result = lintProfitEngineOwnerMarginStoryCopy(
      "Our AI delivers 100% accurate margins and guaranteed ROI — replaces QuickBooks.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest operational estimate copy", () => {
    const result = lintProfitEngineOwnerMarginStoryCopy(
      "Operational margin estimates with recipe COGS when configured — ±1% on seeded SKUs in tests.",
    );
    expect(result.passed).toBe(true);
  });
});
