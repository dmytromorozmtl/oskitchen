import { describe, expect, it } from "vitest";

import { evaluateOwnerDailyBriefingBreakthroughIntegrity } from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";

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

describe("owner-daily-briefing-breakthrough-integrity-era46", () => {
  it("detects breakthrough started without honest blueprint ready", () => {
    const result = evaluateOwnerDailyBriefingBreakthroughIntegrity(process.cwd(), {
      env: { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.ownerDailyBriefingBreakthroughExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "breakthrough_started_without_blueprint_ready"),
    ).toBe(true);
  });

  it("detects fake breakthrough report attestation before blueprint honest", () => {
    const result = evaluateOwnerDailyBriefingBreakthroughIntegrity(process.cwd(), {
      env: {
        OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_ATTESTED: "1",
        OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_breakthrough_report_attestation")).toBe(
      true,
    );
  });

  it("passes when breakthrough env absent", () => {
    const result = evaluateOwnerDailyBriefingBreakthroughIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.ownerDailyBriefingBreakthroughExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
