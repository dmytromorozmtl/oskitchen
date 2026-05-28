import { describe, expect, it } from "vitest";

import {
  buildPilotWeek1ExecutionUiSlice,
  formatPilotWeek1ExecutionProgressLabel,
} from "@/lib/commercial/pilot-week1-execution-ui-era21";

const goSummary = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: new Date().toISOString(),
  decision: "GO" as const,
  blockers: [] as string[],
  warnings: [] as string[],
  customerExecutionStatus: "recorded" as const,
  customerName: "Acme Kitchen",
  loiSignedDate: "2026-06-01",
  prospectExecutionStatus: "none" as const,
  prospectName: null,
  icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
  evidenceGates: [],
  evaluatorInput: {
    tier0Pass: true,
    tier1Pass: true,
    tier2Pass: true,
    tier3Pass: false,
    roleChecklistsComplete: true,
    forbiddenClaimsInContract: true,
    icpQualified: true,
    stagingUrl: "https://x.example.com",
    commitSha: "abc",
  },
};

describe("pilot-week1-execution-ui-era21", () => {
  it("visible when GO and week1 incomplete", () => {
    const slice = buildPilotWeek1ExecutionUiSlice({
      goNoGoSummary: goSummary,
    });
    expect(slice?.blocked).toBe(true);
    expect(slice?.phases.length).toBe(5);
    expect(slice?.week1Milestone).toBe("day1_ttv_onboarding");
    expect(slice?.postGoOrchestratorCommand).toContain(
      "ops:run-pilot-week1-execution-post-go-orchestrator",
    );
    expect(formatPilotWeek1ExecutionProgressLabel(slice!)).toContain("Acme Kitchen");
  });

  it("hidden when decision is not GO", () => {
    expect(
      buildPilotWeek1ExecutionUiSlice({
        goNoGoSummary: { ...goSummary, decision: "NO-GO" },
      }),
    ).toBeNull();
  });

  it("hidden when week1 complete", () => {
    const slice = buildPilotWeek1ExecutionUiSlice({
      goNoGoSummary: goSummary,
      metricsBaseline: {
        version: "era17-pilot-metrics-baseline-v1",
        policyId: "era17-pilot-metrics-baseline-v1",
        runAt: new Date().toISOString(),
        overall: "PASSED",
        baselineProofStatus: "proof_captured",
        pilotWeek: 1,
        customerRef: "Acme",
        capturedAt: new Date().toISOString(),
        metrics: [],
        capturedCount: 6,
        missingCount: 0,
      },
      caseStudyDraft: {
        version: "era17-pilot-case-study-draft-v1",
        runAt: new Date().toISOString(),
        commitSha: "abc",
        overall: "PASSED",
        caseStudyProofStatus: "internal_draft_ready",
        publishProofStatus: "proof_skipped_awaiting_customer_approval",
        pilotMetricsArtifactLoaded: true,
        pilotMetricsOverall: "PASSED",
        customerApprovalStatus: null,
        certPassed: true,
      },
      env: {
        PILOT_WEEK1_TTV_HOURS: "6",
        PILOT_WEEK1_FIRST_ORDER_ID: "ord_123",
        PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED: "1",
        PILOT_WEEK1_POS_CLOSEOUT_STATUS: "pass",
        PILOT_WEEK1_REPORTS_WEEKLY_EXPORT: "1",
      },
    });
    expect(slice).toBeNull();
  });
});
