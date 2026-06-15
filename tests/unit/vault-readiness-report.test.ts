import { describe, expect, it } from "vitest";

import {
  buildVaultReadinessChildSnapshots,
  buildVaultReadinessReport,
  formatVaultReadinessReportLines,
  isVaultReadinessReport,
  loadVaultReadinessReport,
  resolveVaultReadinessReport,
  VAULT_READINESS_REPORT_ARTIFACT,
} from "@/lib/ops/vault-readiness-report";
import { renderVaultReadinessHtml } from "@/lib/ops/vault-readiness-html";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

describe("vault-readiness-report", () => {
  it("lists all 11 canonical secrets", () => {
    const report = buildVaultReadinessReport({ env: {} });
    expect(report.secrets).toHaveLength(11);
    expect(report.secrets.map((row) => row.key)).toEqual(
      P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG.map((entry) => entry.key),
    );
    expect(report.vaultReady).toBe(false);
    expect(report.missingKeys).toHaveLength(11);
    expect(report.version).toBe("vault-readiness-v2");
  });

  it("marks vault ready when all secrets present", () => {
    const env = Object.fromEntries(
      P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG.map((entry) => [entry.key, "set"]),
    ) as NodeJS.ProcessEnv;
    const report = buildVaultReadinessReport({ env });
    expect(report.vaultReady).toBe(true);
    expect(report.presentCount).toBe(11);
    expect(report.missingKeys).toHaveLength(0);
    expect(report.day0Milestone).toBe("env_complete");
  });

  it("surfaces p0 artifact and child smoke truth without faking pass", () => {
    const report = buildVaultReadinessReport({
      env: {},
      p0Artifact: {
        version: "era17-p0-staging-proof-unblock-v1",
        runAt: "2026-05-28T00:00:00.000Z",
        commitSha: null,
        overall: "SKIPPED",
        p0ProofStatus: "awaiting_ops_credentials",
        defaultProofStatus: "awaiting_ops_credentials",
        allMissingEnvVars: ["DATABASE_URL"],
        children: {
          ssoIdpStaging: {
            smokeScript: "smoke:enterprise-sso-idp-staging",
            artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
            overall: "SKIPPED",
            proofStatus: "proof_skipped_missing_prerequisites",
            missingEnvVars: ["E2E_STAGING_BASE_URL"],
          },
          stagingWorkflowsFirstGreen: {
            smokeScript: "smoke:staging-workflows-first-green",
            artifactPath: "artifacts/staging-workflows-first-green-summary.json",
            overall: "SKIPPED",
            proofStatus: "proof_skipped_missing_prerequisites",
            missingEnvVars: ["E2E_LOGIN_EMAIL"],
          },
          channelLive: {
            smokeScript: "smoke:woo-shopify-live",
            artifactPath: "artifacts/channel-live-smoke-summary.json",
            overall: "SKIPPED",
            proofStatus: "proof_skipped_missing_prerequisites",
            missingEnvVars: ["DATABASE_URL"],
          },
        },
      },
    });
    expect(report.p0ProofStatus).toBe("awaiting_ops_credentials");
    expect(report.p0ArtifactOverall).toBe("SKIPPED");
    expect(report.childSmokes).toHaveLength(3);
    expect(report.childSmokes.every((child) => child.overall === "SKIPPED")).toBe(true);
    expect(report.nextPhase).not.toBeNull();
    expect(report.phases).toHaveLength(4);
  });

  it("builds child snapshots from standalone artifacts", () => {
    const snapshots = buildVaultReadinessChildSnapshots({
      ssoArtifact: {
        overall: "SKIPPED",
        loginProofStatus: "proof_skipped_missing_prerequisites",
        missingEnvVars: ["SSO_STAGING_TEST_EMAIL"],
      },
      workflowsArtifact: {
        overall: "PASSED",
        firstGreenProofStatus: "proof_passed",
        missingEnvVars: [],
      },
    });
    expect(snapshots[0]?.proofStatus).toBe("proof_skipped_missing_prerequisites");
    expect(snapshots[1]?.proofStatus).toBe("proof_passed");
  });

  it("renders HTML and report lines", () => {
    const report = buildVaultReadinessReport({ env: {} });
    const html = renderVaultReadinessHtml(report);
    expect(html).toContain("Ops Vault Readiness");
    expect(html).toContain("fabricates proof_passed");
    const lines = formatVaultReadinessReportLines(report);
    expect(lines[0]).toContain("NOT READY");
  });

  it("loads committed vault-readiness artifact when present", () => {
    const report = loadVaultReadinessReport(process.cwd());
    expect(isVaultReadinessReport(report)).toBe(true);
    expect(report.version).toBe("vault-readiness-v2");
    expect(report.secrets).toHaveLength(11);
  });

  it("resolveVaultReadinessReport always recomputes from env", () => {
    const report = resolveVaultReadinessReport(process.cwd(), { env: {} });
    expect(report.vaultReady).toBe(false);
    expect(report.missingKeys).toHaveLength(11);
  });

  it("loadVaultReadinessReport honors explicit override", () => {
    const custom = buildVaultReadinessReport({
      env: Object.fromEntries(
        P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG.map((entry) => [entry.key, "x"]),
      ) as NodeJS.ProcessEnv,
    });
    expect(loadVaultReadinessReport(process.cwd(), custom).vaultReady).toBe(true);
  });

  it("exports canonical artifact path", () => {
    expect(VAULT_READINESS_REPORT_ARTIFACT).toBe("artifacts/vault-readiness-report.json");
  });
});
