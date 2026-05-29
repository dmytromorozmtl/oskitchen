import { describe, expect, it } from "vitest";

import { evaluateScaleReadinessConvergenceIntegrity } from "@/lib/commercial/scale-readiness-convergence-integrity-era50";

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

describe("scale-readiness-convergence-integrity-era50", () => {
  it("detects scale started without honest month 2 convergence ready", () => {
    const result = evaluateScaleReadinessConvergenceIntegrity(process.cwd(), {
      env: { SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.scaleReadinessConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "scale_started_without_month2_convergence_ready"),
    ).toBe(true);
  });

  it("detects fake scale report attestation before month 2 honest", () => {
    const result = evaluateScaleReadinessConvergenceIntegrity(process.cwd(), {
      env: {
        SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED: "1",
        SCALE_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_scale_convergence_report_attestation"),
    ).toBe(true);
  });

  it("passes when scale env absent", () => {
    const result = evaluateScaleReadinessConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.scaleReadinessConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
