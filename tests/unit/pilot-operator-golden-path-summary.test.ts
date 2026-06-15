import { describe, expect, it } from "vitest";

import {
  buildPilotGoldenPathSummary,
  evaluatePilotGoldenPathManualPrerequisites,
  parsePhaseManualStatus,
  resolvePilotGoldenPathPhaseProofStatus,
  resolvePilotGoldenPathOverall,
} from "@/lib/commercial/pilot-operator-golden-path-summary";

describe("pilot operator golden path summary", () => {
  it("requires staging url and operator email for manual prerequisites", () => {
    expect(evaluatePilotGoldenPathManualPrerequisites({}).ok).toBe(false);
    expect(
      evaluatePilotGoldenPathManualPrerequisites({
        stagingUrl: "https://staging.example.com",
        operatorEmail: "ops@example.com",
      }).ok,
    ).toBe(true);
  });

  it("parses phase manual status env values", () => {
    expect(parsePhaseManualStatus("passed")).toBe("PASSED");
    expect(parsePhaseManualStatus("FAILED")).toBe("FAILED");
    expect(parsePhaseManualStatus("pending")).toBeNull();
  });

  it("marks phase proof partial when only some manual phases pass", () => {
    const steps = [
      {
        id: "onboarding_manual",
        phaseId: "onboarding",
        label: "Onboarding manual",
        kind: "manual_staging" as const,
        status: "PASSED" as const,
      },
      {
        id: "orders_manual",
        phaseId: "orders",
        label: "Orders manual",
        kind: "manual_staging" as const,
        status: "SKIPPED" as const,
        reason: "not run",
      },
    ];
    expect(resolvePilotGoldenPathPhaseProofStatus(steps)).toBe("proof_partial");
  });

  it("builds summary with sign-off template fields", () => {
    const summary = buildPilotGoldenPathSummary(
      [
        {
          id: "integrations_ci",
          phaseId: "integrations",
          label: "Integrations CI",
          kind: "ci_wiring",
          status: "PASSED",
        },
      ],
      {
        stagingUrl: "https://staging.example.com",
        operatorEmail: "ops@example.com",
        commitSha: "abc123",
        durationMinutes: 55,
        notes: null,
      },
      new Date("2026-05-28T14:00:00.000Z"),
    );
    expect(summary.signOffTemplate.durationMinutes).toBe(55);
    expect(resolvePilotGoldenPathOverall(summary.steps)).toBe("PASSED");
  });
});
