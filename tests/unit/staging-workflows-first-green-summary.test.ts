import { describe, expect, it } from "vitest";

import {
  buildStagingWorkflowFirstGreenSummary,
  evaluateStagingWorkflowFirstGreenPrerequisites,
  formatStagingWorkflowFirstGreenStepLine,
  resolveStagingWorkflowFirstGreenOverall,
} from "@/lib/ci/staging-workflows-first-green-summary";

describe("staging workflows first green summary", () => {
  it("evaluates staging E2E prerequisites with explicit skip reasons", () => {
    expect(evaluateStagingWorkflowFirstGreenPrerequisites({})).toEqual({
      ok: false,
      reason:
        "E2E_STAGING_BASE_URL is not set — first green GitHub staging run requires staging URL secrets.",
    });
    expect(
      evaluateStagingWorkflowFirstGreenPrerequisites({
        stagingBaseUrl: "https://staging.example.com",
      }),
    ).toEqual({
      ok: false,
      reason: "E2E_LOGIN_EMAIL is not set — staging E2E workflows require login credentials.",
    });
    expect(
      evaluateStagingWorkflowFirstGreenPrerequisites({
        stagingBaseUrl: "https://staging.example.com",
        loginEmail: "ops@example.com",
      }),
    ).toEqual({
      ok: false,
      reason:
        "E2E_LOGIN_PASSWORD (or legacy E2E_PASSWORD) is not set — staging E2E workflows require login credentials.",
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
        { id: "github", label: "GitHub first green", status: "SKIPPED", reason: "ops" },
      ]),
    ).toBe("FAILED");
    expect(
      resolveStagingWorkflowFirstGreenOverall([
        { id: "github", label: "GitHub first green", status: "SKIPPED", reason: "ops" },
      ]),
    ).toBe("SKIPPED");
  });

  it("builds summary artifact shape", () => {
    const summary = buildStagingWorkflowFirstGreenSummary([
      { id: "wiring_cert", label: "Wiring cert", status: "PASSED" },
    ]);
    expect(summary.version).toBe("era16-staging-workflows-first-green-v1");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.overall).toBe("PASSED");
  });
});
