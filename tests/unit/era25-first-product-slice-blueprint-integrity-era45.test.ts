import { describe, expect, it } from "vitest";

import { evaluateEra25FirstProductSliceBlueprintIntegrity } from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";

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

describe("era25-first-product-slice-blueprint-integrity-era45", () => {
  it("detects blueprint started without honest engineering gates open", () => {
    const result = evaluateEra25FirstProductSliceBlueprintIntegrity(process.cwd(), {
      env: { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25FirstProductSliceBlueprintExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "blueprint_started_without_gates_open"),
    ).toBe(true);
  });

  it("detects fake blueprint report attestation before gates honest", () => {
    const result = evaluateEra25FirstProductSliceBlueprintIntegrity(process.cwd(), {
      env: {
        ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED: "1",
        ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_blueprint_report_attestation")).toBe(
      true,
    );
  });

  it("passes when blueprint env absent", () => {
    const result = evaluateEra25FirstProductSliceBlueprintIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25FirstProductSliceBlueprintExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
