import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingPilotWeek1Action } from "@/lib/briefing/owner-daily-briefing-pilot-week1-era21";
import { buildPilotWeek1ExecutionUiSlice } from "@/lib/commercial/pilot-week1-execution-ui-era21";
import { PILOT_WEEK1_BRIEFING_ACTION_PRIORITY } from "@/lib/briefing/owner-daily-briefing-pilot-week1-era21";

describe("owner-daily-briefing-pilot-week1-era21", () => {
  it("builds ranked action with priority 3 when week1 active", () => {
    const slice = buildPilotWeek1ExecutionUiSlice({
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
        decision: "GO",
        blockers: [],
        warnings: [],
        customerExecutionStatus: "recorded",
        customerName: "Acme",
        loiSignedDate: "2026-06-01",
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: true,
          tier1Pass: true,
          tier2Pass: true,
          tier3Pass: false,
          roleChecklistsComplete: true,
          forbiddenClaimsInContract: true,
          icpQualified: true,
          stagingUrl: "https://x.example.com",
          commitSha: "abc",
        },
      },
    });
    const action = buildOwnerDailyBriefingPilotWeek1Action(slice);
    expect(action?.id).toBe("pilot-week1-execution");
    expect(action?.priority).toBe(PILOT_WEEK1_BRIEFING_ACTION_PRIORITY);
    expect(action?.title).toContain("Pilot Week 1");
  });
});
