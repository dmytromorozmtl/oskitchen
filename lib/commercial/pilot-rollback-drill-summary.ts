/**
 * Pilot rollback drill summary — Evolution Era 17 Cycle 20.
 */

import { COMMERCIAL_PILOT_ROLLBACK_STEPS } from "@/lib/commercial/commercial-pilot-evidence-pack";
import { PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID } from "@/lib/commercial/pilot-rollback-drill-era17-policy";

export const PILOT_ROLLBACK_DRILL_SUMMARY_VERSION = "era17-pilot-rollback-drill-v1" as const;

export type PilotRollbackStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type PilotRollbackDrillMode = "tabletop" | "staging" | "unset";

export type PilotRollbackDrillStep = {
  order: number;
  action: string;
  owner: string;
  status: PilotRollbackStepStatus;
  reason?: string;
};

export type PilotRollbackProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites"
  | "proof_partial";

export type PilotRetrospectiveRecord = {
  outcome: string | null;
  lessons: string | null;
  recorded: boolean;
};

export type PilotRollbackDrillSummary = {
  version: typeof PILOT_ROLLBACK_DRILL_SUMMARY_VERSION;
  policyId: typeof PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID;
  runAt: string;
  drillMode: PilotRollbackDrillMode;
  rollbackProofStatus: PilotRollbackProofStatus;
  stagingUrl: string | null;
  operatorEmail: string | null;
  rollbackReason: string | null;
  commitSha: string | null;
  retrospective: PilotRetrospectiveRecord;
  steps: PilotRollbackDrillStep[];
  passedStepCount: number;
  totalSteps: number;
};

export type PilotRollbackDrillInput = {
  drillMode?: PilotRollbackDrillMode;
  stagingUrl?: string | null;
  operatorEmail?: string | null;
  rollbackReason?: string | null;
  commitSha?: string | null;
  stepStatuses?: Record<number, PilotRollbackStepStatus | undefined>;
  retrospectiveOutcome?: string | null;
  retrospectiveLessons?: string | null;
};

export function parseRollbackStepStatus(
  raw: string | undefined,
): PilotRollbackStepStatus | null {
  const value = raw?.trim().toUpperCase();
  if (value === "PASSED") return "PASSED";
  if (value === "FAILED") return "FAILED";
  if (value === "SKIPPED") return "SKIPPED";
  return null;
}

export function evaluateRollbackDrillPrerequisites(
  input: PilotRollbackDrillInput,
): { ok: true } | { ok: false; reason: string } {
  if (!input.operatorEmail?.trim()) {
    return {
      ok: false,
      reason:
        "PILOT_ROLLBACK_DRILL_OPERATOR_EMAIL is not set — record drill facilitator before step sign-off.",
    };
  }
  if (input.drillMode === "staging" && !input.stagingUrl?.trim()) {
    return {
      ok: false,
      reason:
        "PILOT_ROLLBACK_DRILL_STAGING_URL is required when PILOT_ROLLBACK_DRILL_MODE=staging.",
    };
  }
  return { ok: true };
}

export function buildPilotRollbackDrillSteps(
  input: PilotRollbackDrillInput,
  prerequisitesOk: boolean,
  prerequisiteReason: string,
): PilotRollbackDrillStep[] {
  return COMMERCIAL_PILOT_ROLLBACK_STEPS.map((step) => {
    const statusFromInput = input.stepStatuses?.[step.order];
    if (statusFromInput) {
      return {
        order: step.order,
        action: step.action,
        owner: step.owner,
        status: statusFromInput,
        reason: `PILOT_ROLLBACK_STEP_${step.order}_STATUS=${statusFromInput}`,
      };
    }
    if (!prerequisitesOk) {
      return {
        order: step.order,
        action: step.action,
        owner: step.owner,
        status: "SKIPPED",
        reason: prerequisiteReason,
      };
    }
    return {
      order: step.order,
      action: step.action,
      owner: step.owner,
      status: "SKIPPED",
      reason: `Set PILOT_ROLLBACK_STEP_${step.order}_STATUS=PASSED|FAILED after drill step`,
    };
  });
}

export function recomputePilotRollbackProofStatusFromSummary(
  summary: PilotRollbackDrillSummary,
): PilotRollbackProofStatus {
  return resolvePilotRollbackProofStatus(summary.steps);
}

export function resolvePilotRollbackProofStatus(
  steps: readonly PilotRollbackDrillStep[],
): PilotRollbackProofStatus {
  if (steps.some((step) => step.status === "FAILED")) return "proof_failed";
  const passed = steps.filter((step) => step.status === "PASSED").length;
  if (passed === 0) return "proof_skipped_missing_prerequisites";
  if (passed === steps.length) return "proof_passed";
  return "proof_partial";
}

export function buildPilotRetrospectiveRecord(input: {
  outcome?: string | null;
  lessons?: string | null;
}): PilotRetrospectiveRecord {
  const outcome = input.outcome?.trim() || null;
  const lessons = input.lessons?.trim() || null;
  return {
    outcome,
    lessons,
    recorded: Boolean(outcome || lessons),
  };
}

export function buildPilotRollbackDrillSummary(
  input: PilotRollbackDrillInput,
  runAt: Date = new Date(),
): PilotRollbackDrillSummary {
  const prereq = evaluateRollbackDrillPrerequisites(input);
  const steps = buildPilotRollbackDrillSteps(
    input,
    prereq.ok,
    prereq.ok ? "" : prereq.reason,
  );
  const passedStepCount = steps.filter((step) => step.status === "PASSED").length;

  return {
    version: PILOT_ROLLBACK_DRILL_SUMMARY_VERSION,
    policyId: PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID,
    runAt: runAt.toISOString(),
    drillMode: input.drillMode ?? "unset",
    rollbackProofStatus: resolvePilotRollbackProofStatus(steps),
    stagingUrl: input.stagingUrl?.trim() || null,
    operatorEmail: input.operatorEmail?.trim() || null,
    rollbackReason: input.rollbackReason?.trim() || null,
    commitSha: input.commitSha?.trim() || null,
    retrospective: buildPilotRetrospectiveRecord({
      outcome: input.retrospectiveOutcome,
      lessons: input.retrospectiveLessons,
    }),
    steps,
    passedStepCount,
    totalSteps: steps.length,
  };
}

export function formatPilotRollbackDrillReportLines(
  summary: PilotRollbackDrillSummary,
): string[] {
  return [
    `Pilot rollback drill (${summary.version}) — proof: ${summary.rollbackProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Drill mode: ${summary.drillMode}`,
    `Operator: ${summary.operatorEmail ?? "not recorded"}`,
    `Steps passed: ${summary.passedStepCount}/${summary.totalSteps}`,
    `Retrospective recorded: ${summary.retrospective.recorded ? "yes" : "no"}`,
    "",
    ...summary.steps.map((step) =>
      step.status === "SKIPPED"
        ? `[SKIPPED WITH REASON] Step ${step.order} — ${step.action}: ${step.reason ?? "skipped"}`
        : `[${step.status}] Step ${step.order} — ${step.action} (${step.owner})`,
    ),
  ];
}

export function buildPilotRollbackDrillInputFromEnv(): PilotRollbackDrillInput {
  const modeRaw = process.env.PILOT_ROLLBACK_DRILL_MODE?.trim().toLowerCase();
  const drillMode: PilotRollbackDrillMode =
    modeRaw === "staging" ? "staging" : modeRaw === "tabletop" ? "tabletop" : "unset";

  const stepStatuses: Record<number, PilotRollbackStepStatus | undefined> = {};
  for (let order = 1; order <= COMMERCIAL_PILOT_ROLLBACK_STEPS.length; order += 1) {
    const parsed = parseRollbackStepStatus(process.env[`PILOT_ROLLBACK_STEP_${order}_STATUS`]);
    if (parsed) stepStatuses[order] = parsed;
  }

  return {
    drillMode,
    stagingUrl: process.env.PILOT_ROLLBACK_DRILL_STAGING_URL ?? null,
    operatorEmail: process.env.PILOT_ROLLBACK_DRILL_OPERATOR_EMAIL ?? null,
    rollbackReason: process.env.PILOT_ROLLBACK_DRILL_REASON ?? null,
    commitSha: process.env.PILOT_ROLLBACK_DRILL_COMMIT_SHA ?? null,
    stepStatuses,
    retrospectiveOutcome: process.env.PILOT_RETROSPECTIVE_OUTCOME ?? null,
    retrospectiveLessons: process.env.PILOT_RETROSPECTIVE_LESSONS ?? null,
  };
}
