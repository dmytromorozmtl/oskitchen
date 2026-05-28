import { describe, expect, it } from "vitest";

import {
  buildCommercialGoClosureUiSlice,
  formatCommercialGoClosureProgressLabel,
} from "@/lib/commercial/commercial-go-closure-ui-era21";

describe("commercial-go-closure-ui-era21", () => {
  it("visible when tier2 passed and decision not GO", () => {
    const slice = buildCommercialGoClosureUiSlice({
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
        decision: "NO-GO",
        blockers: ["No signed LOI"],
        warnings: [],
        customerExecutionStatus: "skipped_missing_customer",
        customerName: null,
        loiSignedDate: null,
        prospectExecutionStatus: "none",
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
      },
    });
    expect(slice?.blocked).toBe(true);
    expect(slice?.phases.length).toBe(5);
    expect(formatCommercialGoClosureProgressLabel(slice!)).toContain("NO-GO");
  });

  it("hidden when decision is GO", () => {
    expect(
      buildCommercialGoClosureUiSlice({
        p0ProofStatus: "proof_passed",
        tier2ProofStatus: "proof_passed",
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
          icpQualification: {
            qualified: true,
            missingCriteria: [],
            disqualifiers: [],
          },
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
      }),
    ).toBeNull();
  });
});
