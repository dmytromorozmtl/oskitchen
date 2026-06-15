/**
 * Commercial pilot path absolute end lock execution orchestrator — Step 16 honest milestone.
 * Policy: era44-commercial-pilot-path-absolute-end-lock-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import {
  buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BLOCKED_MILESTONES,
  resolveCommercialPilotPathAbsoluteEndMilestone,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import { evaluateCommercialPilotPathAbsoluteEndIntegrity } from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";
import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH,
  detectCommercialPilotPathAbsoluteEndStarted,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { evaluateLinearPathPermanentlyClosedIntegrity } from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";
import { evaluatePostTerminusSteadyStateIntegrity } from "@/lib/commercial/post-terminus-steady-state-integrity-era38";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildSteadyStateOperatorLoopLockExecutionSummary,
  type SteadyStateOperatorLoopLockExecutionSummary,
} from "@/lib/ops/steady-state-operator-loop-lock-execution-orchestrator";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_POLICY_ID =
  "era44-commercial-pilot-path-absolute-end-lock-execution-v1" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_DOC =
  "docs/next-step-16-commercial-pilot-path-absolute-end-lock-execution-2026-05-29.md" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_STEP17_DOC =
  "docs/next-step-17-linear-path-permanently-closed-lock-execution-2026-05-29.md" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/commercial-pilot-path-absolute-end-lock-execution-summary.json" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_HTML_ARTIFACT =
  "artifacts/commercial-pilot-path-absolute-end-lock-execution-report.html" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-commercial-pilot-path-absolute-end-lock-execution" as const;

export type CommercialPilotPathAbsoluteEndLockExecutionMilestone =
  | "steady_state_operator_loop_blocked"
  | "awaiting_absolute_end_active"
  | "awaiting_absolute_end_path_closure"
  | "awaiting_absolute_end_integrity"
  | "awaiting_per_pilot_isolation"
  | "awaiting_absolute_end_report"
  | "awaiting_linear_path_permanently_closed_integrity"
  | "commercial_pilot_path_absolute_end_lock_passed";

export type CommercialPilotPathAbsoluteEndLockExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type CommercialPilotPathAbsoluteEndLockExecutionSummary = {
  version: "commercial-pilot-path-absolute-end-lock-execution-v1";
  policyId: typeof COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: CommercialPilotPathAbsoluteEndLockExecutionMilestone;
  steadyStateOperatorLoopLockMilestone: string | null;
  absoluteEndMilestone: string;
  goDecision: string | null;
  customerName: string | null;
  absoluteEndActive: boolean;
  pathEngineeringClosed: boolean;
  pathComplete: boolean;
  gateStepsComplete: boolean;
  completedSteps: number;
  totalSteps: number;
  firstBlockedStepNumber: number | null;
  postTerminusSteadyStateIntegrityPassed: boolean;
  commercialPilotPathAbsoluteEndIntegrityPassed: boolean;
  linearPathPermanentlyClosedIntegrityPassed: boolean;
  absoluteEndReportPresent: boolean;
  perCustomerIsolation: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  pathLayers: readonly { step: number; label: string; policyId: string; role: string }[];
  gates: readonly CommercialPilotPathAbsoluteEndLockExecutionGateStatus[];
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveCommercialPilotPathAbsoluteEndLockExecutionMilestone(input: {
  steadyStateOperatorLoopPassed: boolean;
  absoluteEndActive: boolean;
  absoluteEndMilestone: string;
  pathComplete: boolean;
  gateStepsComplete: boolean;
  postTerminusSteadyStateIntegrityPassed: boolean;
  commercialPilotPathAbsoluteEndIntegrityPassed: boolean;
  linearPathPermanentlyClosedIntegrityPassed: boolean;
  perCustomerIsolation: boolean;
  absoluteEndReportPresent: boolean;
}): CommercialPilotPathAbsoluteEndLockExecutionMilestone {
  if (!input.steadyStateOperatorLoopPassed) {
    return "steady_state_operator_loop_blocked";
  }

  if (
    !input.absoluteEndActive ||
    (COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BLOCKED_MILESTONES as readonly string[]).includes(
      input.absoluteEndMilestone,
    )
  ) {
    return "awaiting_absolute_end_active";
  }

  if (
    input.absoluteEndMilestone === "attention_path_closure" ||
    !input.pathComplete ||
    !input.gateStepsComplete
  ) {
    return "awaiting_absolute_end_path_closure";
  }

  if (input.absoluteEndMilestone !== "absolute_end_healthy") {
    return "awaiting_absolute_end_path_closure";
  }

  if (!input.perCustomerIsolation) {
    return "awaiting_per_pilot_isolation";
  }

  if (!input.postTerminusSteadyStateIntegrityPassed) {
    return "awaiting_absolute_end_integrity";
  }

  if (!input.commercialPilotPathAbsoluteEndIntegrityPassed) {
    return "awaiting_absolute_end_integrity";
  }

  if (!input.absoluteEndReportPresent) {
    return "awaiting_absolute_end_report";
  }

  if (!input.linearPathPermanentlyClosedIntegrityPassed) {
    return "awaiting_linear_path_permanently_closed_integrity";
  }

  return "commercial_pilot_path_absolute_end_lock_passed";
}

export function buildCommercialPilotPathAbsoluteEndLockExecutionGates(input: {
  steadyStateOperatorLoopPassed: boolean;
  steadyStateOperatorLoopLockMilestone: string | null;
  absoluteEndActive: boolean;
  absoluteEndMilestone: string;
  pathComplete: boolean;
  gateStepsComplete: boolean;
  completedSteps: number;
  totalSteps: number;
  postTerminusSteadyStateIntegrityPassed: boolean;
  commercialPilotPathAbsoluteEndIntegrityPassed: boolean;
  linearPathPermanentlyClosedIntegrityPassed: boolean;
  absoluteEndReportPresent: boolean;
  perCustomerIsolation: boolean;
  goDecision: string | null;
  commercialInflectionMilestone: string;
}): CommercialPilotPathAbsoluteEndLockExecutionGateStatus[] {
  return [
    {
      id: "steady_state_operator_loop_lock",
      label: "Steady-state operator loop lock (Step 15)",
      complete: input.steadyStateOperatorLoopPassed,
      proofStatus: input.steadyStateOperatorLoopPassed
        ? "steady_state_operator_loop_passed"
        : input.steadyStateOperatorLoopLockMilestone,
      detail: input.steadyStateOperatorLoopPassed
        ? "Post-terminus steady-state rhythms locked after production pilot ready closure."
        : "Complete Step 15 — steady-state operator loop lock execution.",
      command: "npm run ops:run-steady-state-operator-loop-lock-execution -- --write",
    },
    {
      id: "absolute_end_active",
      label: "Commercial pilot path absolute end active",
      complete: input.absoluteEndActive,
      proofStatus: input.absoluteEndMilestone,
      detail: input.absoluteEndActive
        ? "Linear engineering closure path unlocked after steady-state lock."
        : "Run absolute end post-steady-state orchestrator.",
      command:
        "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
    },
    {
      id: "path_layers_complete",
      label: "Commercial pilot path layers complete",
      complete: input.pathComplete && input.gateStepsComplete,
      proofStatus: input.pathComplete
        ? `${input.completedSteps}/${input.totalSteps}_steps`
        : "path_blocked",
      detail: "Steps 1–11 gate validators and path catalog must be complete.",
      command: "npm run ops:validate-commercial-pilot-path-absolute-end -- --json",
    },
    {
      id: "absolute_end_milestone",
      label: "Absolute end milestone healthy",
      complete: input.absoluteEndMilestone === "absolute_end_healthy",
      proofStatus: input.absoluteEndMilestone,
      detail: "No upstream steady-state or path closure blockers.",
      command:
        "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
    },
    {
      id: "post_terminus_steady_state_integrity",
      label: "Post-terminus steady state integrity (era38)",
      complete: input.postTerminusSteadyStateIntegrityPassed,
      proofStatus: input.postTerminusSteadyStateIntegrityPassed
        ? "integrity_passed"
        : "integrity_pending",
      detail: "Absolute end lock requires honest post-terminus steady state chain.",
      command: "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
    },
    {
      id: "absolute_end_integrity",
      label: "Commercial pilot path absolute end integrity (era39)",
      complete: input.commercialPilotPathAbsoluteEndIntegrityPassed,
      proofStatus: input.commercialPilotPathAbsoluteEndIntegrityPassed
        ? "integrity_passed"
        : "integrity_pending",
      detail: "No absolute end attestation without honest steady-state integrity.",
      command: "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
    },
    {
      id: "absolute_end_report",
      label: "Absolute end closure report",
      complete: input.absoluteEndReportPresent,
      proofStatus: input.absoluteEndReportPresent ? "report_present" : "missing",
      detail: "ops:sync-commercial-pilot-path-absolute-end-report documents honest closure.",
      command: "npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write",
    },
    {
      id: "per_pilot_isolation",
      label: "Per-pilot GO isolation (Scale Gate 1)",
      complete: input.perCustomerIsolation,
      proofStatus: input.perCustomerIsolation ? "isolation_maintained" : "pending",
      detail: "SCALE_PER_CUSTOMER_GO_ISOLATION=1 before absolute end lock sign-off.",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "go_recertification",
      label: "GO decision maintained",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "Honest GO/NO-GO after steady-state operator loop lock.",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "linear_path_permanently_closed_integrity",
      label: "Linear path permanently closed integrity (era40)",
      complete: input.linearPathPermanentlyClosedIntegrityPassed,
      proofStatus: input.linearPathPermanentlyClosedIntegrityPassed
        ? "integrity_passed"
        : "integrity_pending",
      detail: "No fake linear path closure before absolute end lock baseline.",
      command: "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
    },
    {
      id: "path_engineering_closed",
      label: "Linear engineering path closed",
      complete: input.absoluteEndActive && input.absoluteEndMilestone === "absolute_end_healthy",
      proofStatus: input.absoluteEndMilestone,
      detail: "Commercial pilot path absolute end marks linear engineering closure.",
      command: "npm run ops:validate-commercial-pilot-path-absolute-end -- --json",
    },
    {
      id: "commercial_pilot_runbook",
      label: "Commercial pilot runbook cert chain",
      complete: input.steadyStateOperatorLoopPassed && input.absoluteEndActive,
      proofStatus: input.absoluteEndActive ? "cert_ready" : "blocked",
      detail: "test:ci:commercial-pilot-runbook:cert on every release train.",
      command: "npm run test:ci:commercial-pilot-runbook:cert",
    },
  ];
}

export function buildCommercialPilotPathAbsoluteEndLockExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  steadyStateOperatorLoopLock?: SteadyStateOperatorLoopLockExecutionSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
  root?: string;
}): CommercialPilotPathAbsoluteEndLockExecutionSummary {
  const env = input.env ?? process.env;
  const root = input.root ?? process.cwd();
  const artifacts = readContinuousImprovementLoopArtifacts();
  const inflection = evaluateCommercialInflectionReadiness(env);
  const absoluteEndEvaluation = evaluateCommercialPilotPathAbsoluteEnd(env);
  const steadyStateWithMilestones = evaluateSteadyStateOperatorLoopWithMilestones(env);

  const steadyStateOperatorLoopLock =
    input.steadyStateOperatorLoopLock ??
    buildSteadyStateOperatorLoopLockExecutionSummary({
      env,
      goNoGo: input.goNoGo ?? artifacts.goNoGoSummary,
    });
  const steadyStateOperatorLoopPassed =
    steadyStateOperatorLoopLock.milestone === "steady_state_operator_loop_passed";

  const absoluteEndMilestone = resolveCommercialPilotPathAbsoluteEndMilestone({
    absoluteEndActive: absoluteEndEvaluation.absoluteEndActive,
    steadyStateMilestone: steadyStateWithMilestones.steadyStateMilestone,
    firstBlockedStep: absoluteEndEvaluation.path.summary.firstBlockedStep,
    firstBlockedGateStep: absoluteEndEvaluation.path.summary.firstBlockedGateStep,
  });

  const absoluteEndOrchestrator = buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary(
    {
      evaluation: absoluteEndEvaluation,
      steadyStateMilestone: steadyStateWithMilestones.steadyStateMilestone,
      engineeringPathTerminusMilestone:
        steadyStateWithMilestones.pathEvaluation.engineeringPathTerminusMilestone,
      sustainedOpsConvergenceReady:
        steadyStateWithMilestones.pathEvaluation.maintenanceMode.prerequisites
          .sustainedOpsConvergenceReady,
      pureOperationalModeEra25Active:
        steadyStateWithMilestones.pathEvaluation.maintenanceMode.prerequisites
          .pureOperationalModeEra25Active,
      productEvolutionReady:
        steadyStateWithMilestones.pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady,
      maintenanceModeMilestone:
        steadyStateWithMilestones.pathEvaluation.maintenanceMode.maintenanceModeMilestone,
      artifacts: {
        absoluteEndReportPresent: existsSync(
          join(root, COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH),
        ),
      },
    },
  );

  const postTerminusSteadyStateIntegrity = evaluatePostTerminusSteadyStateIntegrity(root, {
    env,
    goNoGoOverride: input.goNoGo ?? artifacts.goNoGoSummary,
    p0StagingOverride: artifacts.p0Staging,
    tier2SummaryOverride: artifacts.tier2Summary,
    metricsBaselineOverride: artifacts.metricsBaseline,
    caseStudyDraftOverride: artifacts.caseStudyDraft,
    investorOnepagerOverride: artifacts.investorOnepager,
    rollbackDrillOverride: artifacts.rollbackDrill,
    competitorMatrixOverride: artifacts.competitorMatrix,
  });
  const absoluteEndIntegrity = evaluateCommercialPilotPathAbsoluteEndIntegrity(root, {
    env,
    goNoGoOverride: input.goNoGo ?? artifacts.goNoGoSummary,
    p0StagingOverride: artifacts.p0Staging,
    tier2SummaryOverride: artifacts.tier2Summary,
    metricsBaselineOverride: artifacts.metricsBaseline,
    caseStudyDraftOverride: artifacts.caseStudyDraft,
    investorOnepagerOverride: artifacts.investorOnepager,
    rollbackDrillOverride: artifacts.rollbackDrill,
    competitorMatrixOverride: artifacts.competitorMatrix,
  });
  const linearPathIntegrity = evaluateLinearPathPermanentlyClosedIntegrity(root, {
    env,
    goNoGoOverride: input.goNoGo ?? artifacts.goNoGoSummary,
    p0StagingOverride: artifacts.p0Staging,
    tier2SummaryOverride: artifacts.tier2Summary,
    metricsBaselineOverride: artifacts.metricsBaseline,
    caseStudyDraftOverride: artifacts.caseStudyDraft,
    investorOnepagerOverride: artifacts.investorOnepager,
    rollbackDrillOverride: artifacts.rollbackDrill,
    competitorMatrixOverride: artifacts.competitorMatrix,
  });

  const perCustomerIsolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
  const goDecision = input.goNoGo?.decision ?? absoluteEndEvaluation.goDecision;
  const absoluteEndReportPresent = existsSync(join(root, COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH));
  const absoluteEndExecutionStarted = detectCommercialPilotPathAbsoluteEndStarted(env);
  const pathComplete = absoluteEndEvaluation.path.summary.pathComplete;
  const gateStepsComplete = absoluteEndEvaluation.path.summary.gateStepsComplete;

  const milestone = resolveCommercialPilotPathAbsoluteEndLockExecutionMilestone({
    steadyStateOperatorLoopPassed,
    absoluteEndActive: absoluteEndEvaluation.absoluteEndActive || absoluteEndExecutionStarted,
    absoluteEndMilestone,
    pathComplete,
    gateStepsComplete,
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed: absoluteEndIntegrity.integrityPassed,
    linearPathPermanentlyClosedIntegrityPassed: linearPathIntegrity.integrityPassed,
    perCustomerIsolation,
    absoluteEndReportPresent,
  });

  const gates = buildCommercialPilotPathAbsoluteEndLockExecutionGates({
    steadyStateOperatorLoopPassed,
    steadyStateOperatorLoopLockMilestone: steadyStateOperatorLoopLock.milestone,
    absoluteEndActive: absoluteEndEvaluation.absoluteEndActive,
    absoluteEndMilestone,
    pathComplete,
    gateStepsComplete,
    completedSteps: absoluteEndEvaluation.completedSteps,
    totalSteps: absoluteEndEvaluation.totalSteps,
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed: absoluteEndIntegrity.integrityPassed,
    linearPathPermanentlyClosedIntegrityPassed: linearPathIntegrity.integrityPassed,
    absoluteEndReportPresent,
    perCustomerIsolation,
    goDecision,
    commercialInflectionMilestone: inflection.milestone,
  });

  const recommendedCommands: string[] = [];
  if (!steadyStateOperatorLoopPassed) {
    recommendedCommands.push("npm run ops:run-steady-state-operator-loop-lock-execution -- --write");
    recommendedCommands.push("npm run ops:run-production-pilot-ready-closure-execution -- --write");
  } else if (!absoluteEndEvaluation.absoluteEndActive) {
    recommendedCommands.push(
      "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-steady-state-operator-loop -- --json");
  } else if (
    absoluteEndMilestone === "attention_path_closure" ||
    !pathComplete ||
    !gateStepsComplete
  ) {
    recommendedCommands.push("npm run ops:validate-commercial-pilot-path-absolute-end -- --json");
    recommendedCommands.push("npm run ops:validate-commercial-pilot-path -- --json");
    recommendedCommands.push(...absoluteEndOrchestrator.recommendedCommands.slice(0, 3));
  } else if (!perCustomerIsolation || goDecision !== "GO") {
    recommendedCommands.push("npm run smoke:pilot-gono-go");
  } else if (!absoluteEndIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
    );
  } else if (!absoluteEndReportPresent) {
    recommendedCommands.push("npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write");
  } else if (!linearPathIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
    );
  }

  if (milestone === "commercial_pilot_path_absolute_end_lock_passed") {
    recommendedCommands.push(
      "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
    );
  }

  return {
    version: "commercial-pilot-path-absolute-end-lock-execution-v1",
    policyId: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    steadyStateOperatorLoopLockMilestone: steadyStateOperatorLoopLock.milestone,
    absoluteEndMilestone,
    goDecision,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
    absoluteEndActive: absoluteEndEvaluation.absoluteEndActive,
    pathEngineeringClosed: absoluteEndEvaluation.pathEngineeringClosed,
    pathComplete,
    gateStepsComplete,
    completedSteps: absoluteEndEvaluation.completedSteps,
    totalSteps: absoluteEndEvaluation.totalSteps,
    firstBlockedStepNumber:
      absoluteEndEvaluation.path.summary.firstBlockedStep?.step ?? null,
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed: absoluteEndIntegrity.integrityPassed,
    linearPathPermanentlyClosedIntegrityPassed: linearPathIntegrity.integrityPassed,
    absoluteEndReportPresent,
    perCustomerIsolation,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    pathLayers: absoluteEndEvaluation.pathLayers,
    gates,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/launch-wizard",
      "/platform/commercial-pilot-ops#commercial-pilot-path-absolute-end",
      "/platform/commercial-pilot-ops#post-terminus-steady-state",
      "/platform/commercial-pilot-ops#linear-path-permanently-closed",
    ],
    honestyNote:
      "PASS > SKIPPED — Step 16 requires steady_state_operator_loop_passed. Never fabricate absolute end or linear path closure artifacts. Per-pilot GO isolation mandatory. ICP = all F&B formats.",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function formatCommercialPilotPathAbsoluteEndLockExecutionLines(
  summary: CommercialPilotPathAbsoluteEndLockExecutionSummary,
): string[] {
  return [
    `Commercial pilot path absolute end lock: ${summary.milestone}`,
    `Steady-state loop lock: ${summary.steadyStateOperatorLoopLockMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Absolute end: ${summary.absoluteEndMilestone} · path ${summary.completedSteps}/${summary.totalSteps}`,
    `Integrity era39 ${summary.commercialPilotPathAbsoluteEndIntegrityPassed ? "PASS" : "FAIL"} · era40 ${summary.linearPathPermanentlyClosedIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.firstBlockedStepNumber
      ? `First blocked step: S${summary.firstBlockedStepNumber}`
      : "Path catalog complete or awaiting closure artifacts",
  ];
}
