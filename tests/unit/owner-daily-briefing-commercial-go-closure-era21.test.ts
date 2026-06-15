import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingCommercialGoClosureAction,
  COMMERCIAL_GO_CLOSURE_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-commercial-go-closure-era21";
import { buildCommercialGoClosureUiSlice } from "@/lib/commercial/commercial-go-closure-ui-era21";

const noGoSummary = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: new Date().toISOString(),
  decision: "NO-GO" as const,
  blockers: ["No signed LOI"],
  warnings: [],
  customerExecutionStatus: "skipped_missing_customer" as const,
  customerName: null,
  loiSignedDate: null,
  prospectExecutionStatus: "none" as const,
  prospectName: null,
  icpQualification: {
    qualified: false,
    missingCriteria: [],
    disqualifiers: [],
  },
  evidenceGates: [],
  evaluatorInput: {
    tier0Pass: true,
    tier1Pass: true,
    tier2Pass: true,
    tier3Pass: false,
    roleChecklistsComplete: false,
    forbiddenClaimsInContract: false,
    icpQualified: false,
    stagingUrl: null,
    commitSha: null,
  },
};

describe("owner-daily-briefing-commercial-go-closure-era21", () => {
  it("builds ranked action when commercial GO blocked", () => {
    const slice = buildCommercialGoClosureUiSlice({
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
      goNoGoSummary: noGoSummary,
    });
    const action = buildOwnerDailyBriefingCommercialGoClosureAction(slice);
    expect(action?.priority).toBe(COMMERCIAL_GO_CLOSURE_BRIEFING_ACTION_PRIORITY);
    expect(action?.title).toContain("Commercial GO");
  });
});
