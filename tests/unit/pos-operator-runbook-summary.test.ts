import { describe, expect, it } from "vitest";

import {
  buildPosOperatorRunbookSummary,
  formatPosOperatorRunbookStepLine,
  resolvePosOperatorRunbookProofStatus,
} from "@/lib/pos/pos-operator-runbook-summary";

describe("pos operator runbook summary", () => {
  it("defaults to awaiting golden path when operator email missing", () => {
    const summary = buildPosOperatorRunbookSummary({
      operatorEmail: null,
      stagingUrl: null,
      goldenPathAttestation: null,
      certPassed: true,
    });

    expect(summary.posOperatorProofStatus).toBe("awaiting_operator_golden_path_execution");
    expect(summary.passedStepCount).toBe(0);
    expect(summary.steps.every((step) => step.status === "SKIPPED")).toBe(true);
  });

  it("marks proof_passed when attestation and steps pass", () => {
    const status = resolvePosOperatorRunbookProofStatus({
      certPassed: true,
      operatorEmail: "ops@example.com",
      goldenPathAttestation: "passed",
      allStepsPassed: true,
    });
    expect(status).toBe("proof_passed");
  });

  it("formats skipped step with reason", () => {
    const line = formatPosOperatorRunbookStepLine({
      order: 1,
      action: "Open shift",
      status: "SKIPPED",
      reason: "POS_OPERATOR_RUNBOOK_OPERATOR_EMAIL is not set",
    });
    expect(line).toContain("SKIPPED WITH REASON");
  });

  it("returns proof_failed when cert fails", () => {
    const summary = buildPosOperatorRunbookSummary({
      operatorEmail: "ops@example.com",
      stagingUrl: "https://staging.example.com",
      goldenPathAttestation: "passed",
      certPassed: false,
    });
    expect(summary.posOperatorProofStatus).toBe("proof_failed");
  });
});
