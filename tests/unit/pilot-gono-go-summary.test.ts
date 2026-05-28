import { describe, expect, it } from "vitest";

import {
  buildPilotGoNoGoSummary,
  deriveCustomerExecution,
  deriveTier0Pass,
} from "@/lib/commercial/pilot-gono-go-summary";

describe("pilot gono-go summary", () => {
  it("returns NO-GO when tiers fail and no customer recorded", () => {
    const summary = buildPilotGoNoGoSummary({
      preflight: {
        overall: "SKIPPED",
        tier0ProofStatus: "proof_skipped_missing_prerequisites",
        tier1ProofStatus: "proof_passed",
      },
      goldenPath: {
        phaseProofStatus: "proof_skipped_missing_prerequisites",
      },
      icpInput: {},
    });
    expect(summary.decision).toBe("NO-GO");
    expect(summary.customerExecutionStatus).toBe("skipped_missing_customer");
    expect(summary.blockers.some((item) => item.includes("LOI"))).toBe(true);
  });

  it("records customer when name and LOI date provided", () => {
    const customer = deriveCustomerExecution({
      customerName: "Acme Kitchen",
      loiSignedDate: "2026-05-28",
    });
    expect(customer.status).toBe("recorded");
  });

  it("passes tier0 when preflight proof_passed", () => {
    const gate = deriveTier0Pass({
      overall: "PASSED",
      tier0ProofStatus: "proof_passed",
    });
    expect(gate.pass).toBe(true);
  });
});
