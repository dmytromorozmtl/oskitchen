import { describe, expect, it } from "vitest";

import {
  buildPilotCaseStudyDraftSummary,
  resolveCaseStudyProofStatus,
  resolvePilotCaseStudyDraftOverall,
  resolvePublishProofStatus,
} from "@/lib/commercial/pilot-case-study-draft-summary";

describe("pilot case study draft summary", () => {
  it("passes when cert passes — internal draft ready", () => {
    const summary = buildPilotCaseStudyDraftSummary({
      certPassed: true,
      pilotMetrics: { overall: "SKIPPED" },
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.caseStudyProofStatus).toBe("internal_draft_ready");
    expect(summary.publishProofStatus).toBe("proof_skipped_missing_pilot_metrics");
  });

  it("fails when cert fails", () => {
    expect(resolveCaseStudyProofStatus(false)).toBe("proof_failed_cert");
    expect(resolvePilotCaseStudyDraftOverall("proof_failed_cert")).toBe("FAILED");
  });

  it("blocks publish until metrics and customer approval", () => {
    expect(
      resolvePublishProofStatus({
        pilotMetricsArtifactLoaded: true,
        pilotMetricsOverall: "PASSED",
        customerApprovalStatus: null,
      }),
    ).toBe("proof_skipped_awaiting_customer_approval");

    expect(
      resolvePublishProofStatus({
        pilotMetricsArtifactLoaded: true,
        pilotMetricsOverall: "PASSED",
        customerApprovalStatus: "anonymized_signed",
      }),
    ).toBe("proof_ready_for_publish");
  });
});
