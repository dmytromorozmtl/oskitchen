import { describe, expect, it } from "vitest";

import {
  buildStagingWorkflowFirstGreenSummary,
  buildStagingWorkflowGitHubRunRecords,
  countGitHubPassedRuns,
  evaluateStagingWorkflowFirstGreenPrerequisites,
  formatMissingStagingWorkflowFirstGreenEnvVarsReason,
  formatStagingWorkflowFirstGreenStepLine,
  listMissingStagingWorkflowFirstGreenEnvVars,
  resolveStagingWorkflowFirstGreenOverall,
  resolveStagingWorkflowFirstGreenProofStatus,
} from "@/lib/ci/staging-workflows-first-green-summary";

describe("staging workflows first green summary", () => {
  it("evaluates staging E2E prerequisites with explicit missing env list", () => {
    const missing = listMissingStagingWorkflowFirstGreenEnvVars({});
    expect(missing).toEqual([
      "E2E_STAGING_BASE_URL",
      "E2E_LOGIN_EMAIL",
      "E2E_LOGIN_PASSWORD",
    ]);
    expect(evaluateStagingWorkflowFirstGreenPrerequisites({})).toEqual({
      ok: false,
      reason: formatMissingStagingWorkflowFirstGreenEnvVarsReason(missing),
    });
    expect(
      evaluateStagingWorkflowFirstGreenPrerequisites({
        stagingBaseUrl: "https://staging.example.com",
        loginEmail: "ops@example.com",
        loginPassword: "secret",
      }),
    ).toEqual({ ok: true });
  });

  it("formats step lines with SKIPPED WITH REASON", () => {
    expect(
      formatStagingWorkflowFirstGreenStepLine({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: "SKIPPED",
        reason: "E2E_STAGING_BASE_URL is not set",
      }),
    ).toBe(
      "[SKIPPED WITH REASON] Staging /api/health reachable: E2E_STAGING_BASE_URL is not set",
    );
  });

  it("resolves overall PASSED, FAILED, and SKIPPED", () => {
    expect(
      resolveStagingWorkflowFirstGreenOverall([
        { id: "wiring_cert", label: "Wiring cert", status: "PASSED" },
        { id: "github", label: "GitHub first green", status: "SKIPPED", reason: "ops" },
      ]),
    ).toBe("PASSED");
    expect(
      resolveStagingWorkflowFirstGreenOverall([
        { id: "wiring_cert", label: "Wiring cert", status: "FAILED" },
      ]),
    ).toBe("FAILED");
  });

  it("builds summary artifact shape with first green proof status", () => {
    const summary = buildStagingWorkflowFirstGreenSummary(
      [{ id: "wiring_cert", label: "Wiring cert", status: "PASSED" }],
      { missingEnvVars: ["E2E_STAGING_BASE_URL"] },
    );
    expect(summary.version).toBe("era17-staging-workflows-first-green-v1");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.firstGreenProofStatus).toBe("proof_skipped_missing_prerequisites");
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.githubPassedCount).toBe(0);
  });

  it("counts GitHub PASSED runs and resolves proof_passed at two or more", () => {
    const runs = buildStagingWorkflowGitHubRunRecords([
      { workflowId: "e2e", label: "E2E", runUrl: "https://github.com/r/1", outcome: "PASSED" },
      { workflowId: "kds", label: "KDS", runUrl: "https://github.com/r/2", outcome: "PASSED" },
    ]);
    expect(countGitHubPassedRuns(runs)).toBe(2);
    expect(
      resolveStagingWorkflowFirstGreenProofStatus({
        prerequisitesMet: true,
        githubPassedCount: 2,
        githubFailed: false,
      }),
    ).toBe("proof_passed");
  });
});
