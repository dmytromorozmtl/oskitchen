import { describe, expect, it } from "vitest";

import {
  buildP0OpsVaultUiSlice,
  formatP0OpsVaultProgressLabel,
  formatP0OpsVaultTrustBannerHeadline,
  resolveP0OpsVaultNextPhaseSmokeCommands,
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
    expect(slice?.platformOpsHref).toContain("commercial-pilot-ops");
    expect(slice?.nextPhase?.id).toBe("staging_login");
    expect(formatP0OpsVaultProgressLabel(slice!)).toContain("vars missing");
    expect(formatP0OpsVaultTrustBannerHeadline(slice!)).toContain("Phase 1 — Staging login");
    expect(resolveP0OpsVaultNextPhaseSmokeCommands(slice!)[0]).toContain(
      "staging-workflows-first-green",
    );
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

  it("prefers vault report missing keys and next phase when provided", () => {
    const slice = buildP0OpsVaultUiSlice(
      {
        version: "era17-p0-staging-proof-unblock-v1",
        runAt: new Date().toISOString(),
        commitSha: null,
        overall: "SKIPPED",
        p0ProofStatus: "awaiting_ops_credentials",
        defaultProofStatus: "awaiting_ops_credentials",
        allMissingEnvVars: ["DATABASE_URL"],
        children: {
          ssoIdpStaging: {
            smokeScript: "x",
            artifactPath: "a",
            overall: "SKIPPED",
            proofStatus: null,
            missingEnvVars: [],
          },
          stagingWorkflowsFirstGreen: {
            smokeScript: "x",
            artifactPath: "b",
            overall: "SKIPPED",
            proofStatus: null,
            missingEnvVars: [],
          },
          channelLive: {
            smokeScript: "x",
            artifactPath: "c",
            overall: "SKIPPED",
            proofStatus: null,
            missingEnvVars: [],
          },
        },
      },
      {
        version: "vault-readiness-v2",
        generatedAt: "2026-05-28T00:00:00.000Z",
        policyId: "era17-p0-staging-proof-unblock-v1",
        opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md",
        vaultMatrixDoc: "docs/ops-vault-matrix.md",
        vaultReady: false,
        presentCount: 0,
        totalCount: 11,
        missingKeys: [
          "E2E_STAGING_BASE_URL",
          "E2E_LOGIN_EMAIL",
          "E2E_LOGIN_PASSWORD",
        ],
        day0Milestone: "blocked",
        day0PartialComplete: false,
        p0ProofStatus: "awaiting_ops_credentials",
        p0ArtifactOverall: "SKIPPED",
        nextPhase: {
          id: "staging_login",
          label: "Phase 1 — Staging login",
          complete: false,
          presentKeys: [],
          missingKeys: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"],
          docPath: "docs/GITHUB_E2E_STAGING_SECRETS.md",
          smokeScripts: ["smoke:staging-workflows-first-green"],
        },
        phases: [],
        childSmokes: [],
        recommendedNextSteps: [],
        secrets: [],
        honestyNote: "test",
      },
    );
    expect(slice?.missingCount).toBe(3);
    expect(slice?.nextPhase?.id).toBe("staging_login");
  });
});
