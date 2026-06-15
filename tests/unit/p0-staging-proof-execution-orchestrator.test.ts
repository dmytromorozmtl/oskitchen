import { describe, expect, it } from "vitest";

import {
  buildP0StagingProofExecutionPhaseStatuses,
  buildP0StagingProofExecutionSummary,
  resolveP0StagingProofExecutionMilestone,
} from "@/lib/ops/p0-staging-proof-execution-orchestrator";
import { P0_STAGING_PROOF_EXECUTION_PHASES } from "@/lib/ops/p0-staging-proof-execution-phases";

const emptyHealth = {
  checked: false,
  ok: false,
  url: null,
  statusCode: null,
  error: "E2E_STAGING_BASE_URL not set",
};

describe("p0-staging-proof-execution-orchestrator", () => {
  it("defines seven ordered execution phases", () => {
    expect(P0_STAGING_PROOF_EXECUTION_PHASES).toHaveLength(7);
    expect(P0_STAGING_PROOF_EXECUTION_PHASES[0]?.id).toBe("vault_gate");
    expect(P0_STAGING_PROOF_EXECUTION_PHASES.at(-1)?.id).toBe("integrity_validate");
  });

  it("starts at vault_blocked when secrets missing", () => {
    const phases = buildP0StagingProofExecutionPhaseStatuses({
      vaultReady: false,
      stagingHealth: emptyHealth,
      childArtifacts: { workflows: null, channel: null, sso: null, p0: null },
      integrityPassed: true,
    });
    expect(resolveP0StagingProofExecutionMilestone(phases)).toBe("vault_blocked");
    expect(phases[0]?.complete).toBe(false);
  });

  it("progresses through milestones when artifacts pass", () => {
    const phases = buildP0StagingProofExecutionPhaseStatuses({
      vaultReady: true,
      stagingHealth: {
        checked: true,
        ok: true,
        url: "https://staging.example.com/api/health",
        statusCode: 200,
        error: null,
      },
      childArtifacts: {
        workflows: { firstGreenProofStatus: "proof_passed", overall: "PASSED" },
        channel: { wooLiveProofStatus: "proof_passed", overall: "PASSED" },
        sso: { loginProofStatus: "proof_passed", overall: "PASSED" },
        p0: {
          version: "era17-p0-staging-proof-unblock-v1",
          runAt: "2026-05-29T00:00:00.000Z",
          commitSha: null,
          overall: "PASSED",
          p0ProofStatus: "proof_passed",
          defaultProofStatus: "awaiting_ops_credentials",
          allMissingEnvVars: [],
          children: {
            ssoIdpStaging: {
              smokeScript: "smoke:enterprise-sso-idp-staging",
              artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
              overall: "PASSED",
              proofStatus: "proof_passed",
              missingEnvVars: [],
            },
            stagingWorkflowsFirstGreen: {
              smokeScript: "smoke:staging-workflows-first-green",
              artifactPath: "artifacts/staging-workflows-first-green-summary.json",
              overall: "PASSED",
              proofStatus: "proof_passed",
              missingEnvVars: [],
            },
            channelLive: {
              smokeScript: "smoke:woo-shopify-live",
              artifactPath: "artifacts/channel-live-smoke-summary.json",
              overall: "PASSED",
              proofStatus: "proof_passed",
              missingEnvVars: [],
            },
          },
        },
      },
      integrityPassed: true,
    });
    expect(resolveP0StagingProofExecutionMilestone(phases)).toBe("proof_passed");
    expect(phases.every((phase) => phase.complete)).toBe(true);
  });

  it("never reports proof_passed when p0 artifact is still awaiting credentials", () => {
    const summary = buildP0StagingProofExecutionSummary({
      vaultReport: {
        version: "vault-readiness-v2",
        generatedAt: "2026-05-29T00:00:00.000Z",
        policyId: "era17-p0-staging-proof-unblock-v1",
        opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md",
        vaultMatrixDoc: "docs/ops-vault-matrix.md",
        vaultReady: false,
        presentCount: 0,
        totalCount: 11,
        missingKeys: ["DATABASE_URL"],
        day0Milestone: "blocked",
        day0PartialComplete: false,
        p0ProofStatus: "awaiting_ops_credentials",
        p0ArtifactOverall: "SKIPPED",
        nextPhase: null,
        phases: [],
        childSmokes: [],
        recommendedNextSteps: [],
        secrets: [],
        honestyNote: "test",
      },
      stagingHealth: emptyHealth,
      integrityPassed: true,
      childArtifacts: {
        workflows: null,
        channel: null,
        sso: null,
        p0: {
          version: "era17-p0-staging-proof-unblock-v1",
          runAt: "2026-05-29T00:00:00.000Z",
          commitSha: null,
          overall: "SKIPPED",
          p0ProofStatus: "awaiting_ops_credentials",
          defaultProofStatus: "awaiting_ops_credentials",
          allMissingEnvVars: ["DATABASE_URL"],
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
        },
      },
    });
    expect(summary.milestone).not.toBe("proof_passed");
    expect(summary.p0ProofStatus).toBe("awaiting_ops_credentials");
  });
});
