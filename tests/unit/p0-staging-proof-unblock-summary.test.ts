import { describe, expect, it } from "vitest";

import {
  buildP0StagingProofUnblockSummary,
  resolveP0StagingProofUnblockOverall,
  resolveP0StagingProofUnblockStatus,
} from "@/lib/commercial/p0-staging-proof-unblock-summary";

describe("p0 staging proof unblock summary", () => {
  it("marks awaiting_ops_credentials when child smokes skipped for missing env", () => {
    const status = resolveP0StagingProofUnblockStatus({
      ssoOverall: "SKIPPED",
      workflowsOverall: "SKIPPED",
      channelOverall: "SKIPPED",
      ssoProof: "proof_skipped_missing_prerequisites",
      workflowsProof: "proof_skipped_missing_prerequisites",
      channelProof:
        "proof_skipped_missing_prerequisites/proof_skipped_missing_prerequisites",
    });
    expect(status).toBe("awaiting_ops_credentials");
    expect(
      resolveP0StagingProofUnblockOverall(status, ["SKIPPED", "SKIPPED", "SKIPPED"]),
    ).toBe("SKIPPED");
  });

  it("marks proof_failed when any child smoke failed", () => {
    const status = resolveP0StagingProofUnblockStatus({
      ssoOverall: "FAILED",
      workflowsOverall: "SKIPPED",
      channelOverall: "SKIPPED",
      ssoProof: "proof_failed",
      workflowsProof: "proof_skipped_missing_prerequisites",
      channelProof:
        "proof_skipped_missing_prerequisites/proof_skipped_missing_prerequisites",
    });
    expect(status).toBe("proof_failed");
    expect(resolveP0StagingProofUnblockOverall(status, ["FAILED", "SKIPPED", "SKIPPED"])).toBe(
      "FAILED",
    );
  });

  it("marks proof_passed only when all three P0 proofs passed", () => {
    const status = resolveP0StagingProofUnblockStatus({
      ssoOverall: "PASSED",
      workflowsOverall: "PASSED",
      channelOverall: "PASSED",
      ssoProof: "proof_passed",
      workflowsProof: "proof_passed",
      channelProof: "proof_passed/proof_passed",
    });
    expect(status).toBe("proof_passed");
    expect(resolveP0StagingProofUnblockOverall(status, ["PASSED", "PASSED", "PASSED"])).toBe(
      "PASSED",
    );
  });

  it("aggregates missing env vars from child artifacts", () => {
    const summary = buildP0StagingProofUnblockSummary({
      commitSha: "abc123",
      runAt: new Date("2026-05-28T12:00:00.000Z"),
      ssoArtifact: {
        overall: "SKIPPED",
        loginProofStatus: "proof_skipped_missing_prerequisites",
        missingEnvVars: ["E2E_STAGING_BASE_URL", "SSO_STAGING_WORKSPACE_ID"],
      },
      workflowsArtifact: {
        overall: "SKIPPED",
        firstGreenProofStatus: "proof_skipped_missing_prerequisites",
        missingEnvVars: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL"],
      },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped_missing_prerequisites",
        shopifyLiveProofStatus: "proof_skipped_missing_prerequisites",
        missingEnvVars: ["DATABASE_URL"],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.p0ProofStatus).toBe("awaiting_ops_credentials");
    expect(summary.allMissingEnvVars).toEqual(
      expect.arrayContaining([
        "E2E_STAGING_BASE_URL",
        "SSO_STAGING_WORKSPACE_ID",
        "E2E_LOGIN_EMAIL",
        "DATABASE_URL",
      ]),
    );
    expect(summary.children.ssoIdpStaging.missingEnvVars).toHaveLength(2);
  });
});
