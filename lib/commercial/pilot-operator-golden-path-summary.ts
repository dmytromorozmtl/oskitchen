/**
 * Pilot operator golden path summary — Evolution Era 17 Cycle 17.
 */

export const PILOT_OPERATOR_GOLDEN_PATH_SUMMARY_VERSION =
  "era17-pilot-operator-golden-path-v1" as const;

export type PilotGoldenPathStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type PilotGoldenPathStep = {
  id: string;
  phaseId: string;
  label: string;
  kind: "ci_wiring" | "manual_staging" | "tier_preflight_gate";
  status: PilotGoldenPathStepStatus;
  reason?: string;
};

export type PilotGoldenPathOverall = "PASSED" | "FAILED" | "SKIPPED";

export type PilotGoldenPathProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites"
  | "proof_partial";

export type PilotGoldenPathSignOffTemplate = {
  stagingUrl: string | null;
  operatorEmail: string | null;
  commitSha: string | null;
  durationMinutes: number | null;
  notes: string | null;
};

export type PilotGoldenPathSummary = {
  version: typeof PILOT_OPERATOR_GOLDEN_PATH_SUMMARY_VERSION;
  runAt: string;
  overall: PilotGoldenPathOverall;
  phaseProofStatus: PilotGoldenPathProofStatus;
  signOffTemplate: PilotGoldenPathSignOffTemplate;
  steps: PilotGoldenPathStep[];
};

export type PilotGoldenPathManualInput = {
  stagingUrl?: string | null;
  operatorEmail?: string | null;
  commitSha?: string | null;
  durationMinutes?: number | null;
  notes?: string | null;
};

export function evaluatePilotGoldenPathManualPrerequisites(
  input: PilotGoldenPathManualInput,
): { ok: true } | { ok: false; reason: string } {
  if (!input.stagingUrl?.trim()) {
    return {
      ok: false,
      reason:
        "PILOT_GOLDEN_PATH_STAGING_URL is not set — manual staging phases require staging URL.",
    };
  }
  if (!input.operatorEmail?.trim()) {
    return {
      ok: false,
      reason:
        "PILOT_GOLDEN_PATH_OPERATOR_EMAIL is not set — record operator identity before manual sign-off.",
    };
  }
  return { ok: true };
}

export function parsePhaseManualStatus(
  raw: string | undefined,
): PilotGoldenPathStepStatus | null {
  const value = raw?.trim().toUpperCase();
  if (value === "PASSED") return "PASSED";
  if (value === "FAILED") return "FAILED";
  return null;
}

export function formatPilotGoldenPathStepLine(step: PilotGoldenPathStep): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolvePilotGoldenPathOverall(
  steps: readonly PilotGoldenPathStep[],
): PilotGoldenPathOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function resolvePilotGoldenPathPhaseProofStatus(
  steps: readonly PilotGoldenPathStep[],
): PilotGoldenPathProofStatus {
  const phaseSteps = steps.filter((step) => step.kind !== "tier_preflight_gate");
  if (phaseSteps.length === 0) return "proof_skipped_missing_prerequisites";
  if (phaseSteps.some((step) => step.status === "FAILED")) return "proof_failed";
  const manualSteps = phaseSteps.filter((step) => step.kind === "manual_staging");
  const manualPassed = manualSteps.filter((step) => step.status === "PASSED").length;
  if (manualPassed === 0) return "proof_skipped_missing_prerequisites";
  if (manualSteps.some((step) => step.status === "SKIPPED") && manualPassed > 0) {
    return "proof_partial";
  }
  if (phaseSteps.every((step) => step.status === "SKIPPED")) {
    return "proof_skipped_missing_prerequisites";
  }
  if (phaseSteps.every((step) => step.status === "PASSED" || step.status === "SKIPPED")) {
    const allManualPassed =
      manualSteps.length > 0 && manualSteps.every((step) => step.status === "PASSED");
    return allManualPassed ? "proof_passed" : "proof_partial";
  }
  return "proof_partial";
}

export function buildPilotGoldenPathSignOffTemplate(
  input: PilotGoldenPathManualInput,
): PilotGoldenPathSignOffTemplate {
  const durationRaw = input.durationMinutes;
  return {
    stagingUrl: input.stagingUrl?.trim() || null,
    operatorEmail: input.operatorEmail?.trim() || null,
    commitSha: input.commitSha?.trim() || null,
    durationMinutes:
      typeof durationRaw === "number" && Number.isFinite(durationRaw) ? durationRaw : null,
    notes: input.notes?.trim() || null,
  };
}

export function buildPilotGoldenPathSummary(
  steps: readonly PilotGoldenPathStep[],
  signOffTemplate: PilotGoldenPathSignOffTemplate,
  runAt: Date = new Date(),
): PilotGoldenPathSummary {
  return {
    version: PILOT_OPERATOR_GOLDEN_PATH_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    overall: resolvePilotGoldenPathOverall(steps),
    phaseProofStatus: resolvePilotGoldenPathPhaseProofStatus(steps),
    signOffTemplate,
    steps: [...steps],
  };
}

export function formatPilotGoldenPathReportLines(summary: PilotGoldenPathSummary): string[] {
  return [
    `Pilot operator golden path (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Phase proof status: ${summary.phaseProofStatus}`,
    `Staging URL: ${summary.signOffTemplate.stagingUrl ?? "not recorded"}`,
    `Operator email: ${summary.signOffTemplate.operatorEmail ?? "not recorded"}`,
    `Commit SHA: ${summary.signOffTemplate.commitSha ?? "not recorded"}`,
    "",
    ...summary.steps.map((step) => formatPilotGoldenPathStepLine(step)),
  ];
}
