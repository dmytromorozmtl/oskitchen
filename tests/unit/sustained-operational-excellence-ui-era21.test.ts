import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceUiSlice } from "@/lib/commercial/sustained-operational-excellence-ui-era21";

describe("sustained-operational-excellence-ui-era21", () => {
  it("returns null when market leader is incomplete", () => {
    expect(
      buildSustainedOperationalExcellenceUiSlice({
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
        env: {},
      }),
    ).toBeNull();
  });
});
