import { describe, expect, it } from "vitest";

import { evaluateSustainedProductEvolutionIntegrity } from "@/lib/commercial/sustained-product-evolution-integrity-era35";
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";

describe("sustained-product-evolution-integrity-era35", () => {
  it("detects product evolution started without honest Improvement loop", () => {
    const result = evaluateSustainedProductEvolutionIntegrity(process.cwd(), {
      env: { SUSTAINED_PRODUCT_EVOLUTION_PRODUCT_LED_GROWTH_ATTESTED: "1" },
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
    expect(result.productEvolutionExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "product_evolution_started_without_improvement_loop"),
    ).toBe(true);
  });

  it("detects fake ownership matrix attestation before improvement loop honest", () => {
    const result = evaluateSustainedProductEvolutionIntegrity(process.cwd(), {
      env: {
        SUSTAINED_PRODUCT_EVOLUTION_PRODUCT_LED_GROWTH_ATTESTED: "1",
        SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_REVIEWED: "1",
      },
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_ownership_matrix_attestation")).toBe(
      true,
    );
  });

  it("detects fake competitor matrix PASS for leapfrog roadmap track", () => {
    const competitor: CompetitorFeatureGapMatrixSummary = {
      version: "era17-competitor-feature-gap-matrix-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      commitSha: "abc",
      overall: "PASSED",
      matrixProofStatus: "evidence_aligned_era17",
      certPassed: false,
      requiredCompetitorCount: 3,
    };

    const result = evaluateSustainedProductEvolutionIntegrity(process.cwd(), {
      env: { SUSTAINED_PRODUCT_EVOLUTION_PRODUCT_LED_GROWTH_ATTESTED: "1" },
      competitorMatrixOverride: competitor,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_competitor_matrix_pass")).toBe(true);
  });
});
