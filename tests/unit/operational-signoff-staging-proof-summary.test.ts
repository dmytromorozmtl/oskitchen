import { describe, expect, it } from "vitest";

import {
  buildOperationalSignOffStagingProofSummary,
  listMissingOperationalSignOffStagingProofEnvVars,
  normalizeManualSignOffState,
  resolveOperationalSignOffStagingProofStatus,
} from "@/lib/operations/operational-signoff-staging-proof-summary";

describe("operational signoff staging proof summary", () => {
  it("lists missing prerequisite env vars", () => {
    expect(
      listMissingOperationalSignOffStagingProofEnvVars({
        stagingUrl: null,
        operatorEmail: "ops@example.com",
        kdsManual: null,
        productionCalendarManual: null,
      }),
    ).toEqual(["OPERATIONAL_SIGNOFF_STAGING_URL"]);
  });

  it("normalizes manual sign-off states", () => {
    expect(normalizeManualSignOffState("passed")).toBe("passed");
    expect(normalizeManualSignOffState("PASS")).toBe("passed");
    expect(normalizeManualSignOffState(undefined)).toBe("pending");
  });

  it("resolves proof_passed when both manual checklists attested", () => {
    expect(
      resolveOperationalSignOffStagingProofStatus({
        prerequisitesMet: true,
        wiringCertPassed: true,
        stagingHealthPassed: true,
        stagingHealthSkipped: false,
        kdsManual: "passed",
        productionCalendarManual: "passed",
        githubFailed: false,
      }),
    ).toBe("proof_passed");
  });

  it("resolves proof_partial when manual checklists pending", () => {
    const summary = buildOperationalSignOffStagingProofSummary(
      [
        { id: "wiring_cert", label: "wiring", status: "PASSED" },
        { id: "staging_secrets", label: "secrets", status: "PASSED" },
        { id: "staging_health", label: "health", status: "PASSED" },
        { id: "manual_attestation", label: "manual", status: "SKIPPED", reason: "pending" },
      ],
      {
        missingEnvVars: [],
        stagingUrl: "https://staging.example.com",
        operatorEmail: "ops@example.com",
        kdsManual: "pending",
        productionCalendarManual: "pending",
      },
    );
    expect(summary.stagingProofStatus).toBe("proof_partial");
    expect(summary.overall).toBe("PASSED");
  });
});
