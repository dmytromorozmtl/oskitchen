import { describe, expect, it } from "vitest";

import {
  buildEnterpriseSsoPilotReadyGateSummary,
  evaluateEnterpriseSsoPilotReadyGate,
} from "@/lib/enterprise/enterprise-sso-pilot-ready-summary";

describe("enterprise SSO pilot ready summary", () => {
  it("keeps pilot_foundation when Cycle 2 artifact is skipped", () => {
    const evaluation = evaluateEnterpriseSsoPilotReadyGate({
      overall: "SKIPPED",
      loginProofStatus: "proof_skipped_missing_prerequisites",
      idpStagingPrerequisitesMet: false,
    });
    expect(evaluation.ssoDeliveryStatus).toBe("pilot_foundation");
    expect(evaluation.promotionAllowed).toBe(false);
    expect(evaluation.gateOutcome).toBe("pilot_foundation_awaiting_proof");
    expect(evaluation.reason).toContain("SKIPPED WITH REASON");
  });

  it("promotes to pilot_ready only when login proof passed and overall passed", () => {
    const evaluation = evaluateEnterpriseSsoPilotReadyGate({
      overall: "PASSED",
      loginProofStatus: "proof_passed",
      idpStagingPrerequisitesMet: true,
    });
    expect(evaluation.ssoDeliveryStatus).toBe("pilot_ready");
    expect(evaluation.promotionAllowed).toBe(true);
    expect(evaluation.gateOutcome).toBe("qualified_pilot_ready");
  });

  it("does not promote when login proof passed but overall skipped", () => {
    const evaluation = evaluateEnterpriseSsoPilotReadyGate({
      overall: "SKIPPED",
      loginProofStatus: "proof_passed",
      idpStagingPrerequisitesMet: true,
    });
    expect(evaluation.ssoDeliveryStatus).toBe("pilot_foundation");
    expect(evaluation.promotionAllowed).toBe(false);
  });

  it("builds summary with honest default delivery status", () => {
    const summary = buildEnterpriseSsoPilotReadyGateSummary({
      idpStagingArtifact: {
        overall: "SKIPPED",
        loginProofStatus: "proof_skipped_missing_prerequisites",
      },
      commitSha: "abc123",
      runAt: new Date("2026-05-28T15:30:00.000Z"),
    });
    expect(summary.ssoDeliveryStatus).toBe("pilot_foundation");
    expect(summary.promotionAllowed).toBe(false);
    expect(summary.commitSha).toBe("abc123");
    expect(summary.gateProofStatus).toBe("awaiting_idp_login_proof");
  });
});
