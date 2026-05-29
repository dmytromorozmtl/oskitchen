import { describe, expect, it } from "vitest";

import { evaluatePilotGoNoGoIntegrity } from "@/lib/commercial/pilot-gono-go-integrity-era28";
import {
  recomputePilotGoNoGoDecisionFromSummary,
  type PilotGoNoGoSummary,
} from "@/lib/commercial/pilot-gono-go-summary";

function fakeGoSummary(): PilotGoNoGoSummary {
  return {
    version: "era17-pilot-gono-go-v1",
    runAt: "2026-05-28T00:00:00.000Z",
    decision: "GO",
    blockers: ["No signed LOI / customer on record (era17-pilot-gono-go-v1)"],
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
    evidenceGates: [
      {
        id: "tier2",
        label: "Tier 2 operator golden path",
        pass: false,
        reason: "not passed",
      },
    ],
    evaluatorInput: {
      tier0Pass: false,
      tier1Pass: false,
      tier2Pass: false,
      tier3Pass: false,
      roleChecklistsComplete: false,
      forbiddenClaimsInContract: false,
      icpQualified: false,
      stagingUrl: null,
      commitSha: null,
    },
  };
}

describe("pilot-gono-go-integrity-era28", () => {
  it("detects fake GO when blockers and gates fail", () => {
    const summary = fakeGoSummary();
    expect(recomputePilotGoNoGoDecisionFromSummary(summary)).toBe("NO-GO");

    const result = evaluatePilotGoNoGoIntegrity(process.cwd(), {
      artifactOverride: summary,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.violations.some((row) => row.id === "fake_go_decision_mismatch")).toBe(true);
    expect(result.violations.some((row) => row.id === "fake_go_with_blockers")).toBe(true);
    expect(result.violations.some((row) => row.id === "fake_go_missing_customer")).toBe(true);
  });

  it("passes when artifact missing", () => {
    const result = evaluatePilotGoNoGoIntegrity(process.cwd(), {
      artifactOverride: null,
    });
    expect(result.integrityPassed).toBe(true);
  });
});
