import { describe, expect, it } from "vitest";

import { evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55";

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

describe("era25-commercial-pilot-convergence-train-closure-integrity-era55", () => {
  it("detects train closure started without honest pure ops + baselines", () => {
    const result = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(process.cwd(), {
      env: { ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25CommercialPilotConvergenceTrainClosureExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "convergence_train_closure_without_pure_ops_active"),
    ).toBe(true);
    expect(result.missingBaselineArtifacts.length).toBeGreaterThan(0);
  });

  it("detects fake train closure report attestation before baselines honest", () => {
    const result = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(process.cwd(), {
      env: {
        ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED: "1",
        ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_convergence_train_closure_report_attestation"),
    ).toBe(true);
  });

  it("passes when train closure env absent", () => {
    const result = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25CommercialPilotConvergenceTrainClosureExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });

  it("counts eight era47–era54 convergence baselines in registry", () => {
    const result = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.convergenceIntegrityBaselinesTotalCount).toBe(8);
  });
});
