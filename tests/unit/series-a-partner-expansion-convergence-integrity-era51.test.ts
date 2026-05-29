import { describe, expect, it } from "vitest";

import { evaluateSeriesAPartnerExpansionConvergenceIntegrity } from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";

const honestGo = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "GO" as const,
  blockers: [],
  warnings: [],
  customerExecutionStatus: "recorded" as const,
  customerName: "Acme",
  loiSignedDate: "2026-06-01",
  prospectExecutionStatus: "none" as const,
  prospectName: null,
  icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
  evidenceGates: [],
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
};

describe("series-a-partner-expansion-convergence-integrity-era51", () => {
  it("detects series A started without honest scale convergence ready", () => {
    const result = evaluateSeriesAPartnerExpansionConvergenceIntegrity(process.cwd(), {
      env: { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.seriesAPartnerExpansionConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "series_a_started_without_scale_convergence_ready"),
    ).toBe(true);
  });

  it("detects fake series A report attestation before scale honest", () => {
    const result = evaluateSeriesAPartnerExpansionConvergenceIntegrity(process.cwd(), {
      env: {
        SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED: "1",
        SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_series_a_convergence_report_attestation"),
    ).toBe(true);
  });

  it("passes when series A env absent", () => {
    const result = evaluateSeriesAPartnerExpansionConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.seriesAPartnerExpansionConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
