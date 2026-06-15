import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingBreakthroughEra25UiSlice } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import {
  buildOwnerDailyBriefingEra25PaidPilotGoConvergenceAction,
  PAID_PILOT_GO_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
  mergeBriefingEra25PaidPilotGoConvergenceTopActions,
} from "@/lib/briefing/owner-daily-briefing-era25-paid-pilot-go-convergence-era47";

describe("owner-daily-briefing-era25-paid-pilot-go-convergence-era47", { timeout: 120_000 }, () => {
  it("ranks GO convergence meta action at priority 22", () => {
    const breakthrough = buildOwnerDailyBriefingBreakthroughEra25UiSlice({
      blueprintVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25PaidPilotGoConvergenceAction(
      breakthrough?.paidPilotGoConvergence ?? null,
    );
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(PAID_PILOT_GO_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY);
    expect(action!.id).toBe("era25-paid-pilot-go-convergence");
  });

  it("merges GO convergence meta action ahead of lower-priority briefing items", () => {
    const breakthrough = buildOwnerDailyBriefingBreakthroughEra25UiSlice({
      blueprintVisible: true,
      env: {},
    });
    const convergenceAction = buildOwnerDailyBriefingEra25PaidPilotGoConvergenceAction(
      breakthrough?.paidPilotGoConvergence ?? null,
    );
    const merged = mergeBriefingEra25PaidPilotGoConvergenceTopActions(convergenceAction, [
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
    expect(merged[0]?.id).toBe("era25-paid-pilot-go-convergence");
  });
});
