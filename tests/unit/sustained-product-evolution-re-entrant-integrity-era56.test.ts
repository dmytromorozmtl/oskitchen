import { describe, expect, it } from "vitest";

import { evaluateSustainedProductEvolutionReentrantIntegrity } from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";

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

describe("sustained-product-evolution-re-entrant-integrity-era56", () => {
  it("detects re-entrant started without honest train closure", () => {
    const result = evaluateSustainedProductEvolutionReentrantIntegrity(process.cwd(), {
      env: { SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.sustainedProductEvolutionReentrantExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "reentrant_evolution_without_train_closure"),
    ).toBe(true);
  });

  it("detects linear convergence surface reopened after train closure env", () => {
    const result = evaluateSustainedProductEvolutionReentrantIntegrity(process.cwd(), {
      env: {
        ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED: "1",
        PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "linear_convergence_surface_reopened"),
    ).toBe(true);
  });

  it("detects fake re-entrant report attestation before train closure honest", () => {
    const result = evaluateSustainedProductEvolutionReentrantIntegrity(process.cwd(), {
      env: {
        SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED: "1",
        SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_reentrant_report_attestation")).toBe(
      true,
    );
  });

  it("passes when re-entrant env absent", () => {
    const result = evaluateSustainedProductEvolutionReentrantIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.sustainedProductEvolutionReentrantExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
