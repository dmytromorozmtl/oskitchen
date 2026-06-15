import { describe, expect, it } from "vitest";

import {
  evaluateP0StagingProofIntegrity,
  recomputeP0StagingProofStatusFromSummary,
} from "@/lib/commercial/p0-staging-proof-integrity-era28";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";

function fakePassedSummary(): P0StagingProofUnblockSummary {
  return {
    version: "era17-p0-staging-proof-unblock-v1",
    runAt: "2026-05-28T00:00:00.000Z",
    commitSha: null,
    overall: "SKIPPED",
    p0ProofStatus: "proof_passed",
    defaultProofStatus: "awaiting_ops_credentials",
    allMissingEnvVars: ["E2E_STAGING_BASE_URL"],
    children: {
      ssoIdpStaging: {
        smokeScript: "smoke:enterprise-sso-idp-staging",
        artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
        overall: "SKIPPED",
        proofStatus: null,
        missingEnvVars: [],
      },
      stagingWorkflowsFirstGreen: {
        smokeScript: "smoke:staging-workflows-first-green",
        artifactPath: "artifacts/staging-workflows-first-green-summary.json",
        overall: "SKIPPED",
        proofStatus: null,
        missingEnvVars: [],
      },
      channelLive: {
        smokeScript: "smoke:woo-shopify-live",
        artifactPath: "artifacts/channel-live-smoke-summary.json",
        overall: "SKIPPED",
        proofStatus: null,
        missingEnvVars: [],
      },
    },
  };
}

describe("p0-staging-proof-integrity-era28", () => {
  it("detects fake proof_passed when children are SKIPPED", () => {
    const summary = fakePassedSummary();
    expect(recomputeP0StagingProofStatusFromSummary(summary)).toBe("awaiting_ops_credentials");

    const result = evaluateP0StagingProofIntegrity(process.cwd(), {
      artifactOverride: summary,
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.violations.some((row) => row.id === "fake_pass_status_mismatch")).toBe(true);
    expect(result.violations.some((row) => row.id === "fake_pass_overall_skipped")).toBe(true);
  });

  it("passes integrity when artifact honestly awaiting credentials", () => {
    const summary = fakePassedSummary();
    summary.p0ProofStatus = "awaiting_ops_credentials";
    expect(recomputeP0StagingProofStatusFromSummary(summary)).toBe("awaiting_ops_credentials");
  });
});
