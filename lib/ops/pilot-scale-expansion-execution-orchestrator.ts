/**
 * Pilot scale expansion execution orchestrator — Step 6 honest milestone + phase truth.
 * Policy: era34-pilot-scale-expansion-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import type { ScaleReadinessMilestone } from "@/lib/commercial/scale-readiness-post-month2-orchestrator-era21";
import { evaluateScaleReadinessIntegrity } from "@/lib/commercial/scale-readiness-integrity-era30";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildPilotScaleExpansionPhaseStatuses,
  resolveNextIncompletePilotScaleExpansionPhase,
  resolvePilotScaleExpansionWeekPhasesComplete,
  type PilotScaleExpansionPhaseStatus,
} from "@/lib/ops/pilot-scale-expansion-execution-phases";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import { evaluateScaleReadinessEnv, readScaleReadinessArtifacts } from "@/scripts/ops/validate-scale-readiness-env";

export const PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID =
  "era34-pilot-scale-expansion-execution-v1" as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_DOC =
  "docs/next-step-6-pilot-scale-expansion-2026-05-29.md" as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_STEP7_DOC =
  "docs/next-step-7-production-ga-readiness-2026-05-29.md" as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/pilot-scale-expansion-execution-summary.json" as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT =
  "artifacts/pilot-scale-expansion-execution-report.html" as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-pilot-scale-expansion-execution" as const;

export type PilotScaleExpansionExecutionMilestone =
  | "week1_execution_blocked"
  | "awaiting_week2_daily_ops"
  | "awaiting_week3_metrics_trend"
  | "awaiting_week4_expansion_readiness"
  | "awaiting_expansion_loi"
  | "awaiting_maturity_matrix_review"
  | "awaiting_scale_readiness"
  | ScaleReadinessMilestone
  | "awaiting_scale_integrity"
  | "pilot_scale_expansion_passed";

export type PilotScaleExpansionExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type PilotScaleExpansionExecutionSummary = {
  version: "pilot-scale-expansion-execution-v1";
  policyId: typeof PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: PilotScaleExpansionExecutionMilestone;
  week1ExecutionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  weekPhasesComplete: boolean;
  scaleComplete: boolean;
  month2Complete: boolean;
  scaleIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  phases: readonly PilotScaleExpansionPhaseStatus[];
  scalePhases: ReturnType<typeof evaluateScaleReadinessEnv>["phases"];
  gates: readonly PilotScaleExpansionExecutionGateStatus[];
  nextPhase: PilotScaleExpansionPhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolvePilotScaleExpansionExecutionMilestone(input: {
  week1ExecutionPassed: boolean;
  weekPhases: readonly PilotScaleExpansionPhaseStatus[];
  scaleEvaluation: ReturnType<typeof evaluateScaleReadinessEnv>;
  scaleIntegrityPassed: boolean;
}): PilotScaleExpansionExecutionMilestone {
  if (!input.week1ExecutionPassed) return "week1_execution_blocked";

  const nextWeek = resolveNextIncompletePilotScaleExpansionPhase(input.weekPhases);
  if (nextWeek?.optional === false) {
    switch (nextWeek.id) {
      case "week2_daily_ops":
        return "awaiting_week2_daily_ops";
      case "week3_metrics_trend":
        return "awaiting_week3_metrics_trend";
      case "week4_expansion_readiness":
        return "awaiting_week4_expansion_readiness";
      case "expansion_loi":
        return "awaiting_expansion_loi";
      case "maturity_matrix_review":
        return "awaiting_maturity_matrix_review";
      default:
        break;
    }
  }

  if (!resolvePilotScaleExpansionWeekPhasesComplete(input.weekPhases)) {
    return "awaiting_week2_daily_ops";
  }

  if (!input.scaleEvaluation.scaleComplete) {
    if (input.scaleEvaluation.scaleMilestone === "month2_blocked") {
      return "awaiting_scale_readiness";
    }
    return input.scaleEvaluation.scaleMilestone;
  }

  if (!input.scaleIntegrityPassed) return "awaiting_scale_integrity";
  return "pilot_scale_expansion_passed";
}

export function buildPilotScaleExpansionExecutionGates(input: {
  week1ExecutionPassed: boolean;
  week1ExecutionMilestone: string | null;
  weekPhasesComplete: boolean;
  metricsBaselinePassed: boolean;
  scaleComplete: boolean;
  scaleIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
}): PilotScaleExpansionExecutionGateStatus[] {
  return [
    {
      id: "week1_execution",
      label: "Pilot Week 1 execution complete",
      complete: input.week1ExecutionPassed,
      proofStatus: input.week1ExecutionPassed ? "week1_execution_passed" : input.week1ExecutionMilestone,
      detail: input.week1ExecutionPassed
        ? "pilot-week1-execution milestone week1_execution_passed."
        : "Complete Step 5 — production pilot Week 1 checkpoint.",
      command: "npm run ops:run-pilot-week1-execution -- --write",
    },
    {
      id: "week2_4_phases",
      label: "Week 2–4 usage review phases",
      complete: input.weekPhasesComplete,
      proofStatus: input.weekPhasesComplete ? "week_phases_complete" : "in_progress",
      detail: input.weekPhasesComplete
        ? "Week 2 ops, Week 3 metrics, Week 4 expansion, expansion LOI, maturity matrix reviewed."
        : "Record Week 2–4 milestones with real operator usage — all F&B formats.",
      command: "npm run ops:validate-scale-readiness-env -- --json",
    },
    {
      id: "metrics_baseline",
      label: "Pilot metrics baseline PASS",
      complete: input.metricsBaselinePassed,
      proofStatus: input.metricsBaselinePassed ? "PASSED" : "pending",
      detail: "Week 3 metrics trend requires honest pilot-metrics-baseline artifact.",
      command: "npm run smoke:pilot-metrics-baseline",
    },
    {
      id: "scale_readiness",
      label: "Scale readiness gates (enterprise expansion)",
      complete: input.scaleComplete,
      proofStatus: input.scaleComplete ? "scale_complete" : "in_progress",
      detail: input.scaleComplete
        ? "All blocking scale readiness gates passed."
        : "Complete scale readiness gates after Week 2–4 review.",
      command: "npm run ops:run-scale-readiness-post-month2-orchestrator -- --write",
    },
    {
      id: "scale_integrity",
      label: "Scale readiness integrity",
      complete: input.scaleIntegrityPassed,
      proofStatus: input.scaleIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake scale PASS or shared GO across customers.",
      command: "npm run ops:validate-scale-readiness-integrity -- --json",
    },
    {
      id: "commercial_inflection",
      label: "Commercial inflection readiness",
      complete: input.commercialInflectionMilestone === "commercial_inflection_ready",
      proofStatus: input.commercialInflectionMilestone,
      detail:
        input.commercialInflectionMilestone === "commercial_inflection_ready"
          ? "Pilot executable score meets inflection gate."
          : "Resolve remaining commercial inflection blockers.",
      command: "npm run ops:run-commercial-inflection-readiness-orchestrator -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through scale phase — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildPilotScaleExpansionExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): PilotScaleExpansionExecutionSummary {
  const env = input.env ?? process.env;
  const scaleArtifacts = readScaleReadinessArtifacts();
  const scaleEvaluation = evaluateScaleReadinessEnv(env);
  const scaleIntegrity = evaluateScaleReadinessIntegrity(process.cwd());
  const inflection = evaluateCommercialInflectionReadiness(env);
  const metricsBaselinePassed = scaleArtifacts.metricsBaseline?.overall === "PASSED";

  const weekPhases = buildPilotScaleExpansionPhaseStatuses({
    metricsBaselinePassed,
    env,
  });

  const week1ExecutionPassed = input.week1Execution?.milestone === "week1_execution_passed";
  const weekPhasesComplete = resolvePilotScaleExpansionWeekPhasesComplete(weekPhases);

  const milestone = resolvePilotScaleExpansionExecutionMilestone({
    week1ExecutionPassed,
    weekPhases,
    scaleEvaluation,
    scaleIntegrityPassed: scaleIntegrity.integrityPassed,
  });

  const gates = buildPilotScaleExpansionExecutionGates({
    week1ExecutionPassed,
    week1ExecutionMilestone: input.week1Execution?.milestone ?? null,
    weekPhasesComplete,
    metricsBaselinePassed,
    scaleComplete: scaleEvaluation.scaleComplete,
    scaleIntegrityPassed: scaleIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? scaleEvaluation.goDecision,
  });

  const nextPhase = week1ExecutionPassed
    ? resolveNextIncompletePilotScaleExpansionPhase(weekPhases)
    : null;

  const recommendedCommands: string[] = [];
  if (!week1ExecutionPassed) {
    recommendedCommands.push("npm run ops:run-pilot-week1-execution -- --write");
    recommendedCommands.push("npm run ops:run-pilot-week1-execution -- --execute");
  } else if (!weekPhasesComplete) {
    recommendedCommands.push("npm run ops:run-scale-readiness-post-month2-orchestrator -- --write");
    if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    }
    recommendedCommands.push(
      "npm run ops:run-commercial-inflection-readiness-orchestrator -- --json",
    );
    recommendedCommands.push(PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute");
  } else if (!scaleEvaluation.scaleComplete) {
    recommendedCommands.push("npm run ops:run-scale-readiness-post-month2-orchestrator -- --write");
    recommendedCommands.push("npm run ops:validate-scale-readiness-env -- --json");
    const nextScale = scaleEvaluation.phases.find((p) => !p.optional && !p.complete);
    if (nextScale?.smokeScripts.length) {
      recommendedCommands.push(`npm run ${nextScale.smokeScripts[0]}`);
    }
    recommendedCommands.push(PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute");
  } else if (!scaleIntegrity.integrityPassed) {
    recommendedCommands.push("npm run ops:validate-scale-readiness-integrity -- --json");
  }

  if (milestone === "pilot_scale_expansion_passed") {
    recommendedCommands.push("npm run ops:run-production-ga-execution -- --write");
  }

  return {
    version: "pilot-scale-expansion-execution-v1",
    policyId: PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    week1ExecutionMilestone: input.week1Execution?.milestone ?? null,
    goDecision: input.goNoGo?.decision ?? scaleEvaluation.goDecision,
    customerName: input.goNoGo?.customerName ?? null,
    weekPhasesComplete,
    scaleComplete: scaleEvaluation.scaleComplete,
    month2Complete: scaleEvaluation.month2Complete,
    scaleIntegrityPassed: scaleIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    phases: weekPhases,
    scalePhases: scaleEvaluation.phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/today",
      "/dashboard/reports",
      "/dashboard/integration-health",
      "/platform/commercial-pilot-ops",
      "/dashboard/implementation",
    ],
    honestyNote:
      "PASS > SKIPPED — expansion LOI requires signed documents; multi-location LIVE per channel only. All F&B formats supported.",
  };
}

export function formatPilotScaleExpansionExecutionLines(
  summary: PilotScaleExpansionExecutionSummary,
): string[] {
  return [
    `Pilot scale expansion execution: ${summary.milestone}`,
    `Week 1 execution: ${summary.week1ExecutionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Week 2–4 phases: ${summary.weekPhasesComplete ? "complete" : "in progress"}`,
    `Scale readiness: ${summary.scaleComplete ? "complete" : summary.month2Complete ? "month2 done" : "blocked"} · integrity ${summary.scaleIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextPhase
      ? `Next phase: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All week phases complete or blocked on Week 1",
  ];
}
