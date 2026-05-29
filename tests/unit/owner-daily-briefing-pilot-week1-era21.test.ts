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
        evidenceGates: [
          { id: "tier0", label: "t0", pass: true, reason: "ok" },
          { id: "tier1", label: "t1", pass: true, reason: "ok" },
          { id: "tier2", label: "t2", pass: true, reason: "ok" },
          { id: "icp_qualification", label: "icp", pass: true, reason: "ok" },
          { id: "forbidden_claims_enforcement", label: "fc", pass: true, reason: "ok" },
          { id: "p0_staging_proof", label: "p0", pass: true, reason: "ok" },
        ],
        evaluatorInput: {
          tier0Pass: true,
          tier1Pass: true,
          tier2Pass: true,
          tier3Pass: true,
          roleChecklistsComplete: true,
          forbiddenClaimsInContract: false,
          icpQualified: true,
          stagingUrl: "https://x.example.com",
          commitSha: "abc",
        },
      },
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
    });
    const action = buildOwnerDailyBriefingPilotWeek1Action(slice);
    expect(action?.id).toBe("pilot-week1-execution");
    expect(action?.priority).toBe(PILOT_WEEK1_BRIEFING_ACTION_PRIORITY);
    expect(action?.title).toContain("Pilot Week 1");
  });
});
