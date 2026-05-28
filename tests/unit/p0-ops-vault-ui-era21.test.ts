import { describe, expect, it } from "vitest";

import {
  buildP0OpsVaultUiSlice,
  formatP0OpsVaultProgressLabel,
} from "@/lib/commercial/p0-ops-vault-ui-era21";
import { buildP0OpsVaultPhaseStatuses } from "@/lib/commercial/p0-ops-vault-phases-era21";

describe("p0-ops-vault-ui-era21", () => {
  it("builds slice when p0 not passed", () => {
    const slice = buildP0OpsVaultUiSlice({
      version: "era17-p0-staging-proof-unblock-v1",
      runAt: new Date().toISOString(),
      commitSha: null,
      overall: "SKIPPED",
      p0ProofStatus: "awaiting_ops_credentials",
      defaultProofStatus: "awaiting_ops_credentials",
      allMissingEnvVars: ["E2E_STAGING_BASE_URL", "DATABASE_URL"],
      children: {
        ssoIdpStaging: {
          smokeScript: "smoke:enterprise-sso-idp-staging",
          artifactPath: "a",
          overall: "SKIPPED",
          proofStatus: "proof_skipped_missing_prerequisites",
          missingEnvVars: [],
        },
        stagingWorkflowsFirstGreen: {
          smokeScript: "smoke:staging-workflows-first-green",
          artifactPath: "b",
          overall: "SKIPPED",
          proofStatus: "proof_skipped_missing_prerequisites",
          missingEnvVars: [],
        },
        channelLive: {
          smokeScript: "smoke:woo-shopify-live",
          artifactPath: "c",
          overall: "SKIPPED",
          proofStatus: "proof_skipped_missing_prerequisites",
          missingEnvVars: [],
        },
      },
    });
    expect(slice?.blocked).toBe(true);
    expect(slice?.phases.length).toBe(4);
    expect(slice?.day0Milestone).toBe("blocked");
    expect(slice?.day0OrchestratorCommand).toContain("ops:run-p0-vault-day0-orchestrator");
    expect(formatP0OpsVaultProgressLabel(slice!)).toContain("vars missing");
  });

  it("returns null when proof passed", () => {
    expect(
      buildP0OpsVaultUiSlice({
        version: "era17-p0-staging-proof-unblock-v1",
        runAt: new Date().toISOString(),
        commitSha: null,
        overall: "PASSED",
        p0ProofStatus: "proof_passed",
        defaultProofStatus: "awaiting_ops_credentials",
        allMissingEnvVars: [],
        children: {
          ssoIdpStaging: {
            smokeScript: "x",
            artifactPath: "a",
            overall: "PASSED",
            proofStatus: "proof_passed",
            missingEnvVars: [],
          },
          stagingWorkflowsFirstGreen: {
            smokeScript: "x",
            artifactPath: "b",
            overall: "PASSED",
            proofStatus: "proof_passed",
            missingEnvVars: [],
          },
          channelLive: {
            smokeScript: "x",
            artifactPath: "c",
            overall: "PASSED",
            proofStatus: "proof_passed",
            missingEnvVars: [],
          },
        },
      }),
    ).toBeNull();
  });

  it("phase statuses cover 11 keys", () => {
    const phases = buildP0OpsVaultPhaseStatuses({
      missingEnvVars: ["E2E_STAGING_BASE_URL"],
    });
    expect(phases).toHaveLength(4);
    expect(phases.filter((p) => !p.complete).length).toBeGreaterThan(0);
  });
});
