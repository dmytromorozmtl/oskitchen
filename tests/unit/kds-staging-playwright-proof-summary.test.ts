import { describe, expect, it } from "vitest";

import {
  buildKdsStagingPlaywrightProofSummary,
  evaluateKdsStagingPlaywrightProofPrerequisites,
  listMissingKdsStagingPlaywrightProofEnvVars,
  resolveKdsStagingPlaywrightProofStatus,
} from "@/lib/kitchen/kds-staging-playwright-proof-summary";

describe("kds staging playwright proof summary", () => {
  it("lists missing prerequisite env vars", () => {
    expect(
      listMissingKdsStagingPlaywrightProofEnvVars({
        stagingBaseUrl: null,
        loginEmail: "ops@example.com",
        loginPassword: null,
      }),
    ).toEqual(["E2E_STAGING_BASE_URL", "E2E_LOGIN_PASSWORD (or E2E_PASSWORD)"]);
  });

  it("passes prerequisites when all env vars present", () => {
    expect(
      evaluateKdsStagingPlaywrightProofPrerequisites({
        stagingBaseUrl: "https://staging.example.com",
        loginEmail: "ops@example.com",
        loginPassword: "secret",
      }).ok,
    ).toBe(true);
  });

  it("resolves proof_passed only with github PASSED and wiring cert", () => {
    expect(
      resolveKdsStagingPlaywrightProofStatus({
        prerequisitesMet: true,
        wiringCertPassed: true,
        githubRun: {
          workflowId: "kds_staging",
          label: "Playwright KDS Staging",
          runUrl: "https://github.com/org/repo/actions/runs/1",
          outcome: "PASSED",
        },
        githubFailed: false,
      }),
    ).toBe("proof_passed");
  });

  it("skips when github evidence missing despite prerequisites", () => {
    const summary = buildKdsStagingPlaywrightProofSummary(
      [
        { id: "wiring_cert", label: "wiring", status: "PASSED" },
        { id: "staging_secrets", label: "secrets", status: "PASSED" },
        {
          id: "github_kds_run",
          label: "github",
          status: "SKIPPED",
          reason: "no url",
        },
      ],
      { missingEnvVars: [] },
    );
    expect(summary.playwrightProofStatus).toBe("proof_skipped_missing_github_run");
    expect(summary.overall).toBe("SKIPPED");
  });

  it("marks overall SKIPPED when wiring cert passes but prerequisites missing", () => {
    const summary = buildKdsStagingPlaywrightProofSummary(
      [
        { id: "wiring_cert", label: "wiring", status: "PASSED" },
        {
          id: "staging_secrets",
          label: "secrets",
          status: "SKIPPED",
          reason: "Missing env",
        },
        {
          id: "staging_health",
          label: "health",
          status: "SKIPPED",
          reason: "Missing env",
        },
        {
          id: "github_kds_run",
          label: "github",
          status: "SKIPPED",
          reason: "Missing env",
        },
      ],
      {
        missingEnvVars: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL"],
      },
    );
    expect(summary.playwrightProofStatus).toBe("proof_skipped_missing_prerequisites");
    expect(summary.overall).toBe("SKIPPED");
  });
});
