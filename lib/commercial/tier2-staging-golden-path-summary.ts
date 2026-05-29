/**
 * Tier 2 staging golden path summary — honest SKIPPED/PASSED aggregation.
 */
import {
  TIER2_STAGING_GOLDEN_PATH_ERA20_MANUAL_PHASES,
  TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID,
  TIER2_STAGING_GOLDEN_PATH_ERA20_PROOF_STATUS,
} from "@/lib/commercial/tier2-staging-golden-path-era20-policy";

export type Tier2ManualPhaseStatus = "PASSED" | "FAILED" | "SKIPPED";

export type Tier2StagingGoldenPathStep = {
  id: string;
  label: string;
  kind: "p0_gate" | "child_smoke" | "manual_phase" | "github_evidence";
  status: Tier2ManualPhaseStatus;
  reason: string;
};

export type Tier2StagingGoldenPathSummary = {
  version: typeof TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID;
  runAt: string;
  commitSha: string | null;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  tier2ProofStatus:
    | typeof TIER2_STAGING_GOLDEN_PATH_ERA20_PROOF_STATUS
    | "awaiting_manual_phases"
    | "proof_passed";
  p0ProofStatus: string | null;
  steps: Tier2StagingGoldenPathStep[];
  missingManualEnvVars: string[];
  playbookDoc: string;
};

function parseManualStatus(raw: string | undefined): Tier2ManualPhaseStatus | null {
  const v = raw?.trim().toUpperCase();
  if (v === "PASSED" || v === "FAILED") return v;
  return null;
}

export function buildTier2StagingGoldenPathSummary(input: {
  commitSha?: string | null;
  p0ProofStatus?: string | null;
  p0GateStep: Tier2StagingGoldenPathStep;
  childSteps: Tier2StagingGoldenPathStep[];
}): Tier2StagingGoldenPathSummary {
  const manualSteps: Tier2StagingGoldenPathStep[] = TIER2_STAGING_GOLDEN_PATH_ERA20_MANUAL_PHASES.map(
    (phase) => {
      const raw = process.env[phase.manualEnvKey];
      const parsed = parseManualStatus(raw);
      if (parsed) {
        return {
          id: phase.id,
          label: phase.label,
          kind: "manual_phase" as const,
          status: parsed,
          reason: `${phase.manualEnvKey}=${raw?.trim()}`,
        };
      }
      return {
        id: phase.id,
        label: phase.label,
        kind: "manual_phase" as const,
        status: "SKIPPED" as const,
        reason: `Set ${phase.manualEnvKey}=PASSED after ${phase.route} on staging`,
      };
    },
  );

  const githubOutcome = process.env.GITHUB_KDS_STAGING_RUN_OUTCOME?.trim().toUpperCase();
  const githubUrl = process.env.GITHUB_KDS_STAGING_RUN_URL?.trim();
  const githubStep: Tier2StagingGoldenPathStep = {
    id: "github_kds_playwright",
    label: "KDS Playwright staging workflow URL",
    kind: "github_evidence",
    status:
      githubOutcome === "PASSED" && githubUrl
        ? "PASSED"
        : githubOutcome === "FAILED"
          ? "FAILED"
          : "SKIPPED",
    reason:
      githubOutcome === "PASSED" && githubUrl
        ? githubUrl
        : "Set GITHUB_KDS_STAGING_RUN_URL + GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED",
  };

  const steps = [input.p0GateStep, ...input.childSteps, ...manualSteps, githubStep];
  const anyFailed = steps.some((s) => s.status === "FAILED");
  const p0Passed = input.p0ProofStatus === "proof_passed";

  const missingManualEnvVars = manualSteps
    .filter((s) => s.status === "SKIPPED")
    .map((s) => s.reason.match(/^Set ([A-Z0-9_]+)=/)?.[1])
    .filter((v): v is string => Boolean(v));

  let tier2ProofStatus: Tier2StagingGoldenPathSummary["tier2ProofStatus"] =
    TIER2_STAGING_GOLDEN_PATH_ERA20_PROOF_STATUS;
  if (p0Passed && !anyFailed) {
    const allManualPassed = manualSteps.every((s) => s.status === "PASSED");
    const githubPassed = githubStep.status === "PASSED";
    if (allManualPassed && githubPassed) {
      tier2ProofStatus = "proof_passed";
    } else if (missingManualEnvVars.length || githubStep.status === "SKIPPED") {
      tier2ProofStatus = "awaiting_manual_phases";
    }
  }

  let overall: Tier2StagingGoldenPathSummary["overall"] = "SKIPPED";
  if (anyFailed) overall = "FAILED";
  else if (tier2ProofStatus === "proof_passed") overall = "PASSED";

  return {
    version: TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID,
    runAt: new Date().toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    tier2ProofStatus,
    p0ProofStatus: input.p0ProofStatus ?? null,
    steps,
    missingManualEnvVars,
    playbookDoc: "docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md",
  };
}

export function recomputeTier2ProofStatusFromSummary(
  summary: Tier2StagingGoldenPathSummary,
): Tier2StagingGoldenPathSummary["tier2ProofStatus"] {
  const anyFailed = summary.steps.some((step) => step.status === "FAILED");
  if (summary.p0ProofStatus !== "proof_passed") {
    return TIER2_STAGING_GOLDEN_PATH_ERA20_PROOF_STATUS;
  }
  if (anyFailed) {
    return "awaiting_manual_phases";
  }

  const manualSteps = summary.steps.filter((step) => step.kind === "manual_phase");
  const githubStep = summary.steps.find((step) => step.kind === "github_evidence");
  const allManualPassed =
    manualSteps.length > 0 && manualSteps.every((step) => step.status === "PASSED");
  const githubPassed = githubStep?.status === "PASSED";

  if (allManualPassed && githubPassed) {
    return "proof_passed";
  }

  return "awaiting_manual_phases";
}

export function formatTier2StagingGoldenPathReportLines(
  summary: Tier2StagingGoldenPathSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `tier2ProofStatus: ${summary.tier2ProofStatus}`,
    `p0ProofStatus: ${summary.p0ProofStatus ?? "unknown"}`,
    ...summary.steps.map((s) => `  [${s.status}] ${s.label} — ${s.reason}`),
  ];
}
