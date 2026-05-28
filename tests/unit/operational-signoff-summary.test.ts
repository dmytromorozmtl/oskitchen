import { describe, expect, it } from "vitest";

import {
  buildOperationalSignOffSummary,
  buildOperationalSignOffTemplate,
  evaluateOperationalSignOffManualPrerequisites,
  formatOperationalSignOffStepLine,
  resolveOperationalSignOffOverall,
} from "@/lib/operations/operational-signoff-summary";

describe("operational sign-off summary", () => {
  it("formats SKIPPED WITH REASON lines", () => {
    expect(
      formatOperationalSignOffStepLine({
        id: "kds_manual",
        label: "KDS manual staging",
        status: "SKIPPED",
        reason: "no staging URL",
      }),
    ).toBe("[SKIPPED WITH REASON] KDS manual staging: no staging URL");
  });

  it("resolves overall FAILED when any step failed", () => {
    expect(
      resolveOperationalSignOffOverall([
        { id: "a", label: "A", status: "PASSED" },
        { id: "b", label: "B", status: "FAILED" },
      ]),
    ).toBe("FAILED");
  });

  it("resolves overall PASSED when actionable steps pass", () => {
    expect(
      resolveOperationalSignOffOverall([
        { id: "a", label: "A", status: "PASSED" },
        { id: "b", label: "B", status: "SKIPPED", reason: "manual" },
      ]),
    ).toBe("PASSED");
  });

  it("requires staging URL and operator for manual prerequisites", () => {
    expect(evaluateOperationalSignOffManualPrerequisites({}).ok).toBe(false);
    expect(
      evaluateOperationalSignOffManualPrerequisites({
        stagingUrl: "https://staging.example.com",
        operatorEmail: "ops@example.com",
      }).ok,
    ).toBe(true);
  });

  it("builds summary with sign-off template", () => {
    const summary = buildOperationalSignOffSummary(
      [{ id: "kds_ci", label: "KDS CI", status: "PASSED" }],
      buildOperationalSignOffTemplate(
        { stagingUrl: "https://staging.example.com", operatorEmail: "ops@example.com" },
        true,
      ),
    );
    expect(summary.version).toBe("era16-operational-signoff-v1");
    expect(summary.signOffTemplate.kdsManualSignOff).toBe("pending");
    expect(summary.overall).toBe("PASSED");
  });
});
