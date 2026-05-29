import { describe, expect, it } from "vitest";

import {
  buildScaleReadinessConvergenceEra25UiSlice,
  formatScaleReadinessConvergenceEra25Label,
} from "@/lib/commercial/scale-readiness-convergence-ui-era25";

describe("scale-readiness-convergence-ui-era25", () => {
  it("returns null when month 2 convergence not visible", () => {
    expect(
      buildScaleReadinessConvergenceEra25UiSlice({ month2ConvergenceVisible: false }),
    ).toBeNull();
  });

  it("builds slice when month 2 convergence visible", () => {
    const slice = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.scaleReadinessConvergenceEra25Milestone).toBe(
      "month2_convergence_regression_blocked",
    );
    expect(slice?.postMonth2ConvergenceOrchestratorCommand).toContain(
      "run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25",
    );
  });

  it("flags integrity fail when scale attested without month 2 ready", () => {
    const slice = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: { SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
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
    expect(slice?.scaleReadinessConvergenceIntegrityPassed).toBe(false);
  });

  it("formats convergence label", () => {
    const slice = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatScaleReadinessConvergenceEra25Label(slice)).toContain("scale readiness");
    expect(formatScaleReadinessConvergenceEra25Label(slice)).toContain("BLOCKED");
  });
});
