import { describe, expect, it } from "vitest";

import {
  buildPilotGoNoGoSummary,
  deriveCustomerExecution,
  deriveForbiddenClaimsEnforcementPass,
  deriveP0StagingProofPass,
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
      forbiddenClaimsEnforcement: null,
      p0StagingProof: null,
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

  it("blocks GO when forbidden-claims enforcement artifact missing", () => {
    const summary = buildPilotGoNoGoSummary({
      preflight: {
        overall: "PASSED",
        tier0ProofStatus: "proof_passed",
        tier1ProofStatus: "proof_passed",
      },
      goldenPath: { phaseProofStatus: "proof_passed" },
      forbiddenClaimsEnforcement: null,
      p0StagingProof: {
        overall: "PASSED",
        p0ProofStatus: "proof_passed",
        children: {
          ssoIdpStaging: { proofStatus: "proof_passed", overall: "PASSED" },
          stagingWorkflowsFirstGreen: { proofStatus: "proof_passed", overall: "PASSED" },
          channelLive: { proofStatus: "proof_passed/proof_passed", overall: "PASSED" },
        },
      },
      icpInput: {
        singleOrSmallMultiUnit: true,
        ownerOperatorEngaged: true,
        needsCoreKitchenOrderPath: true,
        acceptsQualifiedBetaLabels: true,
      },
      roleChecklistsComplete: true,
      tier3Pass: true,
      customerName: "Acme Kitchen",
      loiSignedDate: "2026-05-28",
    });
    expect(summary.decision).toBe("NO-GO");
    expect(
      summary.blockers.some((item) =>
        item.includes("forbidden-claims enforcement"),
      ),
    ).toBe(true);
  });

  it("passes forbidden-claims gate when proof_passed", () => {
    const gate = deriveForbiddenClaimsEnforcementPass({
      overall: "PASSED",
      claimsEnforcementProofStatus: "proof_passed",
    });
    expect(gate.pass).toBe(true);
  });

  it("blocks GO when P0 staging proof is awaiting ops credentials", () => {
    const gate = deriveP0StagingProofPass({
      overall: "SKIPPED",
      p0ProofStatus: "awaiting_ops_credentials",
      allMissingEnvVars: ["E2E_STAGING_BASE_URL"],
    });
    expect(gate.pass).toBe(false);
    expect(gate.reason).toContain("SKIPPED WITH REASON");

    const summary = buildPilotGoNoGoSummary({
      preflight: {
        overall: "PASSED",
        tier0ProofStatus: "proof_passed",
        tier1ProofStatus: "proof_passed",
      },
      goldenPath: { phaseProofStatus: "proof_passed" },
      forbiddenClaimsEnforcement: {
        overall: "PASSED",
        claimsEnforcementProofStatus: "proof_passed",
      },
      p0StagingProof: {
        overall: "SKIPPED",
        p0ProofStatus: "awaiting_ops_credentials",
        allMissingEnvVars: ["E2E_STAGING_BASE_URL"],
      },
      icpInput: {
        singleOrSmallMultiUnit: true,
        ownerOperatorEngaged: true,
        needsCoreKitchenOrderPath: true,
        acceptsQualifiedBetaLabels: true,
      },
      roleChecklistsComplete: true,
      tier3Pass: true,
      customerName: "Acme Kitchen",
      loiSignedDate: "2026-05-28",
    });
    expect(summary.decision).toBe("NO-GO");
    expect(
      summary.blockers.some((item) => item.includes("P0 staging proof not passed")),
    ).toBe(true);
    expect(summary.evidenceGates.some((gate) => gate.id === "p0_sso_idp")).toBe(true);
  });
});
