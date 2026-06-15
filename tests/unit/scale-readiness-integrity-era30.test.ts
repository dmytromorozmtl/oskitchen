import { describe, expect, it } from "vitest";

import { evaluateScaleReadinessIntegrity } from "@/lib/commercial/scale-readiness-integrity-era30";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { recomputePilotRollbackProofStatusFromSummary } from "@/lib/commercial/pilot-rollback-drill-summary";

describe("scale-readiness-integrity-era30", () => {
  it("detects Scale started without honest Month 2", () => {
    const result = evaluateScaleReadinessIntegrity(process.cwd(), {
      env: { SCALE_PER_CUSTOMER_GO_ISOLATION: "1" },
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
    expect(result.scaleExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "scale_started_without_month2")).toBe(true);
  });

  it("detects fake rollback PASS", () => {
    const rollback: PilotRollbackDrillSummary = {
      version: "era17-pilot-rollback-drill-v1",
      policyId: "era17-pilot-rollback-drill-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      drillMode: "tabletop",
      rollbackProofStatus: "proof_passed",
      stagingUrl: null,
      operatorEmail: null,
      rollbackReason: null,
      commitSha: null,
      retrospective: { outcome: null, lessons: null, recorded: false },
      steps: [
        {
          order: 1,
          action: "step",
          owner: "ops",
          status: "SKIPPED",
          reason: "missing",
        },
      ],
      passedStepCount: 0,
      totalSteps: 1,
    };
    expect(recomputePilotRollbackProofStatusFromSummary(rollback)).toBe(
      "proof_skipped_missing_prerequisites",
    );

    const result = evaluateScaleReadinessIntegrity(process.cwd(), {
      rollbackDrillOverride: rollback,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_rollback_pass")).toBe(true);
  });
});
