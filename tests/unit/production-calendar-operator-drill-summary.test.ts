import { describe, expect, it } from "vitest";

import {
  buildProductionCalendarOperatorDrillSummary,
  listMissingProductionCalendarOperatorDrillEnvVars,
  normalizeProductionCalendarDrillManualAttestation,
  resolveProductionCalendarOperatorDrillProofStatus,
} from "@/lib/production/production-calendar-operator-drill-summary";

describe("production calendar operator drill summary", () => {
  it("lists missing prerequisite env vars", () => {
    expect(
      listMissingProductionCalendarOperatorDrillEnvVars({
        stagingUrl: "https://staging.example.com",
        operatorEmail: null,
      }),
    ).toEqual(["PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL"]);
  });

  it("normalizes manual attestation", () => {
    expect(normalizeProductionCalendarDrillManualAttestation("passed")).toBe("passed");
    expect(normalizeProductionCalendarDrillManualAttestation(undefined)).toBe("pending");
  });

  it("resolves proof_passed when manual attestation passed", () => {
    expect(
      resolveProductionCalendarOperatorDrillProofStatus({
        prerequisitesMet: true,
        wiringCertPassed: true,
        stagingHealthPassed: true,
        stagingHealthSkipped: false,
        manualAttestation: "passed",
      }),
    ).toBe("proof_passed");
  });

  it("resolves proof_partial when manual pending", () => {
    const summary = buildProductionCalendarOperatorDrillSummary(
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
        manualAttestation: "pending",
      },
    );
    expect(summary.drillProofStatus).toBe("proof_partial");
    expect(summary.overall).toBe("PASSED");
  });
});
