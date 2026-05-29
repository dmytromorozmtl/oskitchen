import { describe, expect, it } from "vitest";

import { evaluateSustainedOperationalExcellenceConvergenceIntegrity } from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";

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

describe("sustained-operational-excellence-convergence-integrity-era53", () => {
  it("detects sustained ops started without honest market leader convergence ready", () => {
    const result = evaluateSustainedOperationalExcellenceConvergenceIntegrity(process.cwd(), {
      env: { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.sustainedOperationalExcellenceConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some(
        (row) => row.id === "sustained_ops_started_without_market_leader_convergence_ready",
      ),
    ).toBe(true);
  });

  it("detects fake sustained ops report attestation before market leader honest", () => {
    const result = evaluateSustainedOperationalExcellenceConvergenceIntegrity(process.cwd(), {
      env: {
        SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED: "1",
        SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_sustained_ops_convergence_report_attestation"),
    ).toBe(true);
  });

  it("passes when sustained ops env absent", () => {
    const result = evaluateSustainedOperationalExcellenceConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.sustainedOperationalExcellenceConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
