import { describe, expect, it } from "vitest";

import { buildPaidPilotGoConvergenceEra25UiSlice } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import {
  buildOwnerDailyBriefingEra25PilotWeek1ExecutionConvergenceAction,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
  mergeBriefingEra25PilotWeek1ExecutionConvergenceTopActions,
} from "@/lib/briefing/owner-daily-briefing-era25-pilot-week1-execution-convergence-era48";

describe("owner-daily-briefing-era25-pilot-week1-execution-convergence-era48", () => {
  it("ranks week 1 meta action at priority 23", () => {
    const goConvergence = buildPaidPilotGoConvergenceEra25UiSlice({
      breakthroughVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25PilotWeek1ExecutionConvergenceAction(
      goConvergence?.pilotWeek1ExecutionConvergence ?? null,
    );
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(PILOT_WEEK1_EXECUTION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY);
    expect(action!.id).toBe("era25-pilot-week1-execution-convergence");
  });

  it("merges week 1 meta action ahead of lower-priority briefing items", () => {
    const goConvergence = buildPaidPilotGoConvergenceEra25UiSlice({
      breakthroughVisible: true,
      env: {},
    });
    const week1Action = buildOwnerDailyBriefingEra25PilotWeek1ExecutionConvergenceAction(
      goConvergence?.pilotWeek1ExecutionConvergence ?? null,
    );
    const merged = mergeBriefingEra25PilotWeek1ExecutionConvergenceTopActions(week1Action, [
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
    expect(merged[0]?.id).toBe("era25-pilot-week1-execution-convergence");
  });
});
