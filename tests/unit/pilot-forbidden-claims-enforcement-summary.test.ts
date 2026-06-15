import { describe, expect, it } from "vitest";

import {
  buildPilotForbiddenClaimsEnforcementSummary,
  formatPilotForbiddenClaimsEnforcementStepLine,
} from "@/lib/commercial/pilot-forbidden-claims-enforcement-summary";

describe("pilot forbidden-claims enforcement summary", () => {
  it("marks proof_passed when all actionable steps pass", () => {
    const summary = buildPilotForbiddenClaimsEnforcementSummary([
      { id: "verify_claims_strict", label: "Marketing claims strict verify", status: "PASSED" },
      { id: "audit_marketing_claims", label: "Marketing claims registry audit", status: "PASSED" },
    ]);
    expect(summary.claimsEnforcementProofStatus).toBe("proof_passed");
    expect(summary.overall).toBe("PASSED");
  });

  it("marks proof_failed when a step fails", () => {
    const summary = buildPilotForbiddenClaimsEnforcementSummary([
      { id: "verify_claims_strict", label: "Marketing claims strict verify", status: "FAILED" },
    ]);
    expect(summary.claimsEnforcementProofStatus).toBe("proof_failed");
    expect(summary.overall).toBe("FAILED");
  });

  it("formats skipped steps honestly", () => {
    const line = formatPilotForbiddenClaimsEnforcementStepLine({
      id: "verify_claims_strict",
      label: "Marketing claims strict verify",
      status: "SKIPPED",
      reason: "certs-only",
    });
    expect(line).toContain("SKIPPED WITH REASON");
  });
});
