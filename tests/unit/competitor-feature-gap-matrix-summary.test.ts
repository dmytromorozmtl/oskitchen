import { describe, expect, it } from "vitest";

import {
  buildCompetitorFeatureGapMatrixSummary,
  resolveCompetitorMatrixOverall,
  resolveCompetitorMatrixProofStatus,
} from "@/lib/commercial/competitor-feature-gap-matrix-summary";

describe("competitor feature gap matrix summary", () => {
  it("passes when cert passes — matrix aligned to era17 evidence", () => {
    const summary = buildCompetitorFeatureGapMatrixSummary({
      certPassed: true,
      requiredCompetitorCount: 16,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.matrixProofStatus).toBe("evidence_aligned_era17");
  });

  it("fails when cert fails", () => {
    expect(resolveCompetitorMatrixProofStatus(false)).toBe("proof_failed_cert");
    expect(resolveCompetitorMatrixOverall("proof_failed_cert")).toBe("FAILED");
    const summary = buildCompetitorFeatureGapMatrixSummary({
      certPassed: false,
      requiredCompetitorCount: 16,
    });
    expect(summary.overall).toBe("FAILED");
  });
});
