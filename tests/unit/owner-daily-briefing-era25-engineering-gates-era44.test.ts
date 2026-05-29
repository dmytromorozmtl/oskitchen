import { describe, expect, it } from "vitest";

import { buildEra25FirstCharterSliceReadinessUiSlice } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import {
  buildOwnerDailyBriefingEra25EngineeringGatesAction,
  ERA25_ENGINEERING_GATES_BRIEFING_ACTION_PRIORITY,
  mergeBriefingEra25EngineeringGatesTopActions,
} from "@/lib/briefing/owner-daily-briefing-era25-engineering-gates-era44";

describe("owner-daily-briefing-era25-engineering-gates-era44", () => {
  it("ranks engineering gates action at priority 19", () => {
    const firstSlice = buildEra25FirstCharterSliceReadinessUiSlice({
      charterExitVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25EngineeringGatesAction(
      firstSlice?.engineeringGates ?? null,
    );
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(ERA25_ENGINEERING_GATES_BRIEFING_ACTION_PRIORITY);
    expect(action!.id).toBe("era25-engineering-gates-require-signed-charter");
  });

  it("merges gates action ahead of lower-priority briefing items", () => {
    const firstSlice = buildEra25FirstCharterSliceReadinessUiSlice({
      charterExitVisible: true,
      env: {},
    });
    const gatesAction = buildOwnerDailyBriefingEra25EngineeringGatesAction(
      firstSlice?.engineeringGates ?? null,
    );
    const merged = mergeBriefingEra25EngineeringGatesTopActions(gatesAction, [
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
    expect(merged[0]?.id).toBe("era25-engineering-gates-require-signed-charter");
  });
});
