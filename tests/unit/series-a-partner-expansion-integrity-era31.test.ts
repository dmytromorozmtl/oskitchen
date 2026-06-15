import { describe, expect, it } from "vitest";

import { evaluateSeriesAPartnerExpansionIntegrity } from "@/lib/commercial/series-a-partner-expansion-integrity-era31";
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { recomputeCompetitorMatrixProofStatusFromSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";

describe("series-a-partner-expansion-integrity-era31", () => {
  it("detects Series A started without honest Scale", () => {
    const result = evaluateSeriesAPartnerExpansionIntegrity(process.cwd(), {
      env: { SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED: "1" },
      goNoGoOverride: {
        version: "era17-pilot-gono-go-v1",
        runAt: "2026-05-28T00:00:00.000Z",
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
    expect(result.integrityPassed).toBe(false);
    expect(result.seriesAExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "series_a_started_without_scale")).toBe(
      true,
    );
  });

  it("detects fake competitor matrix PASS", () => {
    const competitor: CompetitorFeatureGapMatrixSummary = {
      version: "era17-competitor-feature-gap-matrix-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      commitSha: "abc",
      overall: "PASSED",
      matrixProofStatus: "evidence_aligned_era17",
      certPassed: false,
      requiredCompetitorCount: 3,
    };
    expect(recomputeCompetitorMatrixProofStatusFromSummary(competitor)).toBe("proof_failed_cert");

    const result = evaluateSeriesAPartnerExpansionIntegrity(process.cwd(), {
      competitorMatrixOverride: competitor,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_competitor_matrix_pass")).toBe(true);
    expect(result.violations.some((row) => row.id === "fake_competitor_matrix_proof_mismatch")).toBe(
      true,
    );
  });
});
