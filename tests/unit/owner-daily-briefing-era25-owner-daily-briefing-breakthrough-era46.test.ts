import { describe, expect, it } from "vitest";

import { buildEra25FirstProductSliceBlueprintUiSlice } from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";
import {
  buildOwnerDailyBriefingEra25OwnerDailyBriefingBreakthroughAction,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_BRIEFING_ACTION_PRIORITY,
  mergeBriefingEra25OwnerDailyBriefingBreakthroughTopActions,
} from "@/lib/briefing/owner-daily-briefing-era25-owner-daily-briefing-breakthrough-era46";

describe("owner-daily-briefing-era25-owner-daily-briefing-breakthrough-era46", { timeout: 120_000 }, () => {
  it("ranks breakthrough action at priority 21", () => {
    const blueprint = buildEra25FirstProductSliceBlueprintUiSlice({
      engineeringGatesVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25OwnerDailyBriefingBreakthroughAction(
      blueprint?.ownerDailyBriefingBreakthrough ?? null,
    );
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(OWNER_DAILY_BRIEFING_BREAKTHROUGH_BRIEFING_ACTION_PRIORITY);
    expect(action!.id).toBe("era25-owner-daily-briefing-breakthrough");
  });

  it("merges breakthrough action ahead of lower-priority briefing items", () => {
    const blueprint = buildEra25FirstProductSliceBlueprintUiSlice({
      engineeringGatesVisible: true,
      env: {},
    });
    const breakthroughAction = buildOwnerDailyBriefingEra25OwnerDailyBriefingBreakthroughAction(
      blueprint?.ownerDailyBriefingBreakthrough ?? null,
    );
    const merged = mergeBriefingEra25OwnerDailyBriefingBreakthroughTopActions(breakthroughAction, [
      {
        id: "other",
        title: "Other",
        reason: "x",
        severity: "normal",
        ownerRole: "owner",
        href: "/x",
        status: "open",
        unblockCondition: "y",
        priority: 50,
        ctaLabel: "Open",
        tone: "normal",
      },
    ]);
    expect(merged[0]?.id).toBe("era25-owner-daily-briefing-breakthrough");
  });
});
