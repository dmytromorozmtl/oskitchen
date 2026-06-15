/**
 * Steady-state operator loop lock execution orchestrator — Step 15 honest milestone.
 * Policy: era43-steady-state-operator-loop-lock-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateEra25SteadyStateOperatorLoopLockIntegrity } from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";
import { evaluateEngineeringPathTerminusIntegrity } from "@/lib/commercial/engineering-path-terminus-integrity-era37";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import {
  buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary,
  POST_TERMINUS_STEADY_STATE_BLOCKED_MILESTONES,
  resolvePostTerminusSteadyStateMilestone,
  STEADY_STATE_MEASURABLE_TRACK_IDS,
} from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { evaluatePostTerminusSteadyStateIntegrity } from "@/lib/commercial/post-terminus-steady-state-integrity-era38";
import {
  detectPostTerminusSteadyStateStarted,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
  POST_TERMINUS_STEADY_STATE_REPORT_PATH,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import type { SteadyStateTrackStatus } from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildProductionPilotReadyClosureExecutionSummary,
  type ProductionPilotReadyClosureExecutionSummary,
} from "@/lib/ops/production-pilot-ready-closure-execution-orchestrator";
import { evaluateCommercialPilotPathWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID =
  "era43-steady-state-operator-loop-lock-execution-v1" as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_DOC =
  "docs/next-step-15-steady-state-operator-loop-lock-execution-2026-05-29.md" as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_STEP16_DOC =
  "docs/next-step-16-commercial-pilot-path-absolute-end-lock-execution-2026-05-29.md" as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/steady-state-operator-loop-lock-execution-summary.json" as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT =
  "artifacts/steady-state-operator-loop-lock-execution-report.html" as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-steady-state-operator-loop-lock-execution" as const;

export type SteadyStateOperatorLoopLockExecutionMilestone =
  | "production_pilot_ready_blocked"
  | "awaiting_post_terminus_steady_state"
  | "awaiting_steady_state_track_attention"
  | "awaiting_post_terminus_steady_state_integrity"
  | "awaiting_per_pilot_isolation"
  | "awaiting_era_charter_checklist"
  | "awaiting_era25_operator_loop_lock_integrity"
  | "steady_state_operator_loop_passed";

export type SteadyStateOperatorLoopLockExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type SteadyStateOperatorLoopLockExecutionSummary = {
  version: "steady-state-operator-loop-lock-execution-v1";
  policyId: typeof STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: SteadyStateOperatorLoopLockExecutionMilestone;
  productionPilotReadyClosureMilestone: string | null;
  postTerminusSteadyStateMilestone: string;
  goDecision: string | null;
  customerName: string | null;
  steadyStateActive: boolean;
  engineeringTerminusActive: boolean;
  engineeringPathTerminusMilestone: string;
  engineeringPathTerminusIntegrityPassed: boolean;
  postTerminusSteadyStateIntegrityPassed: boolean;
  era25OperatorLoopLockIntegrityPassed: boolean;
  eraCharterReviewed: boolean;
  steadyStateReportPresent: boolean;
  perCustomerIsolation: boolean;
  tracksHealthy: boolean;
  overdueCount: number;
  nextAttentionTrackId: string | null;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  tracks: readonly SteadyStateTrackStatus[];
  gates: readonly SteadyStateOperatorLoopLockExecutionGateStatus[];
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

function measurableTrackNeedsAttention(
  tracks: readonly Pick<SteadyStateTrackStatus, "id" | "status">[],
): boolean {
  const measurable = new Set(STEADY_STATE_MEASURABLE_TRACK_IDS);
  return tracks.some(
    (track) =>
      measurable.has(track.id as (typeof STEADY_STATE_MEASURABLE_TRACK_IDS)[number]) &&
      track.status === "overdue",
  );
}

export function resolveSteadyStateOperatorLoopLockExecutionMilestone(input: {
  productionPilotReadyPassed: boolean;
  steadyStateActive: boolean;
  postTerminusSteadyStateMilestone: string;
  overdueCount: number;
  measurableTracksNeedAttention: boolean;
  postTerminusSteadyStateIntegrityPassed: boolean;
  perCustomerIsolation: boolean;
  eraCharterReviewed: boolean;
  era25OperatorLoopLockIntegrityPassed: boolean;
}): SteadyStateOperatorLoopLockExecutionMilestone {
  if (!input.productionPilotReadyPassed) {
    return "production_pilot_ready_blocked";
  }

  if (
    !input.steadyStateActive ||
    (POST_TERMINUS_STEADY_STATE_BLOCKED_MILESTONES as readonly string[]).includes(
      input.postTerminusSteadyStateMilestone,
    )
  ) {
    return "awaiting_post_terminus_steady_state";
  }

  if (input.measurableTracksNeedAttention || input.overdueCount > 0) {
    return "awaiting_steady_state_track_attention";
  }

  if (input.postTerminusSteadyStateMilestone !== "steady_state_healthy") {
    return "awaiting_steady_state_track_attention";
  }

  if (!input.perCustomerIsolation) {
    return "awaiting_per_pilot_isolation";
  }

  if (!input.postTerminusSteadyStateIntegrityPassed) {
    return "awaiting_post_terminus_steady_state_integrity";
  }

  if (!input.eraCharterReviewed) {
    return "awaiting_era_charter_checklist";
  }

  if (!input.era25OperatorLoopLockIntegrityPassed) {
    return "awaiting_era25_operator_loop_lock_integrity";
  }

  return "steady_state_operator_loop_passed";
}

export function buildSteadyStateOperatorLoopLockExecutionGates(input: {
  productionPilotReadyPassed: boolean;
  productionPilotReadyClosureMilestone: string | null;
  steadyStateActive: boolean;
  postTerminusSteadyStateMilestone: string;
  tracksHealthy: boolean;
  overdueCount: number;
  postTerminusSteadyStateIntegrityPassed: boolean;
  engineeringPathTerminusIntegrityPassed: boolean;
  era25OperatorLoopLockIntegrityPassed: boolean;
  eraCharterReviewed: boolean;
  perCustomerIsolation: boolean;
  goDecision: string | null;
  commercialInflectionMilestone: string;
  steadyStateReportPresent: boolean;
}): SteadyStateOperatorLoopLockExecutionGateStatus[] {
  return [
    {
      id: "production_pilot_ready_closure",
      label: "Production pilot ready closure (Step 14)",
      complete: input.productionPilotReadyPassed,
      proofStatus: input.productionPilotReadyPassed
        ? "production_pilot_ready_passed"
        : input.productionPilotReadyClosureMilestone,
      detail: input.productionPilotReadyPassed
        ? "Full execution chain + investor bundle closure passed."
        : "Complete Step 14 — production pilot ready closure execution.",
      command: "npm run ops:run-production-pilot-ready-closure-execution -- --write",
    },
    {
      id: "post_terminus_steady_state",
      label: "Post-terminus steady state active",
      complete: input.steadyStateActive,
      proofStatus: input.postTerminusSteadyStateMilestone,
      detail: input.steadyStateActive
        ? "Engineering path terminus healthy — steady-state operator loop unlocked."
        : "Run post-terminus steady-state post-engineering-terminus orchestrator.",
      command:
        "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
    },
    {
      id: "steady_state_tracks",
      label: "Steady-state release train tracks healthy",
      complete: input.tracksHealthy && input.overdueCount === 0,
      proofStatus: input.tracksHealthy ? "tracks_healthy" : `${input.overdueCount}_overdue`,
      detail: "Weekly maintenance, improvement loop, and product evolution rhythms must be current.",
      command: "npm run ops:validate-steady-state-operator-loop -- --json",
    },
    {
      id: "post_terminus_steady_state_milestone",
      label: "Post-terminus steady state milestone healthy",
      complete: input.postTerminusSteadyStateMilestone === "steady_state_healthy",
      proofStatus: input.postTerminusSteadyStateMilestone,
      detail: "No blocked upstream convergence or attention rhythms.",
      command:
        "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
    },
    {
      id: "post_terminus_steady_state_integrity",
      label: "Post-terminus steady state integrity (era38)",
      complete: input.postTerminusSteadyStateIntegrityPassed,
      proofStatus: input.postTerminusSteadyStateIntegrityPassed
        ? "integrity_passed"
        : "integrity_pending",
      detail: "No steady-state attestation without honest engineering path terminus chain.",
      command: "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
    },
    {
      id: "engineering_path_terminus_integrity",
      label: "Engineering path terminus integrity (era37)",
      complete: input.engineeringPathTerminusIntegrityPassed,
      proofStatus: input.engineeringPathTerminusIntegrityPassed
        ? "integrity_passed"
        : "integrity_pending",
      detail: "Terminus integrity must remain PASS through steady-state lock.",
      command: "npm run ops:validate-engineering-path-terminus-integrity -- --json",
    },
    {
      id: "era_charter_checklist",
      label: "Era charter readiness checklist",
      complete: input.eraCharterReviewed,
      proofStatus: input.eraCharterReviewed ? "charter_reviewed" : "pending",
      detail: "Export checklist and attest POST_TERMINUS_STEADY_STATE_ERA_CHARTER_REVIEWED.",
      command: "npm run ops:export-era-charter-readiness-checklist -- --write",
    },
    {
      id: "per_pilot_isolation",
      label: "Per-pilot GO isolation (Scale Gate 1)",
      complete: input.perCustomerIsolation,
      proofStatus: input.perCustomerIsolation ? "isolation_maintained" : "pending",
      detail: "SCALE_PER_CUSTOMER_GO_ISOLATION=1 before steady-state operator loop lock.",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "go_recertification",
      label: "GO decision maintained",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "Honest GO/NO-GO after production pilot ready closure.",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "era25_operator_loop_lock_integrity",
      label: "Era25 steady-state operator loop lock integrity (era58)",
      complete: input.era25OperatorLoopLockIntegrityPassed,
      proofStatus: input.era25OperatorLoopLockIntegrityPassed
        ? "integrity_passed"
        : "integrity_pending",
      detail: "Charter lock + improvement-loop cadence frozen after honest lock baseline.",
      command: "npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json",
    },
    {
      id: "steady_state_report",
      label: "Steady-state operator loop report",
      complete: input.steadyStateReportPresent,
      proofStatus: input.steadyStateReportPresent ? "report_present" : "missing",
      detail: "ops:sync-steady-state-operator-loop-report documents honest operator rhythms.",
      command: "npm run ops:sync-steady-state-operator-loop-report -- --write",
    },
    {
      id: "commercial_pilot_runbook",
      label: "Commercial pilot runbook cert chain",
      complete: input.productionPilotReadyPassed && input.steadyStateActive,
      proofStatus: input.steadyStateActive ? "cert_ready" : "blocked",
      detail: "test:ci:commercial-pilot-runbook:cert on every release train.",
      command: "npm run test:ci:commercial-pilot-runbook:cert",
    },
  ];
}

export function buildSteadyStateOperatorLoopLockExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  productionPilotReadyClosure?: ProductionPilotReadyClosureExecutionSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
  root?: string;
}): SteadyStateOperatorLoopLockExecutionSummary {
  const env = input.env ?? process.env;
  const root = input.root ?? process.cwd();
  const artifacts = readContinuousImprovementLoopArtifacts();
  const inflection = evaluateCommercialInflectionReadiness(env);
  const steadyStateEvaluation = evaluateSteadyStateOperatorLoop(env);
  const pathEvaluation = evaluateCommercialPilotPathWithMilestones(env);
  const postTerminusSteadyStateMilestone = resolvePostTerminusSteadyStateMilestone({
    steadyStateActive: steadyStateEvaluation.steadyStateActive,
    engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
    tracks: steadyStateEvaluation.tracks,
  });
  const postTerminusOrchestrator = buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary(
    {
      evaluation: steadyStateEvaluation,
      engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
      artifacts: {
        steadyStateReportPresent: existsSync(join(root, POST_TERMINUS_STEADY_STATE_REPORT_PATH)),
      },
    },
  );

  const productionPilotReadyClosure =
    input.productionPilotReadyClosure ??
    buildProductionPilotReadyClosureExecutionSummary({
      env,
      goNoGo: input.goNoGo ?? artifacts.goNoGoSummary,
    });
  const productionPilotReadyPassed =
    productionPilotReadyClosure.milestone === "production_pilot_ready_passed";

  const engineeringPathTerminusIntegrity = evaluateEngineeringPathTerminusIntegrity(root, {
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
  const era25OperatorLoopLockIntegrity = evaluateEra25SteadyStateOperatorLoopLockIntegrity(root, {
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
  const eraCharterReviewed =
    parseEnvBoolean(env.POST_TERMINUS_STEADY_STATE_ERA_CHARTER_REVIEWED) === true ||
    existsSync(join(root, ERA_CHARTER_READINESS_CHECKLIST_PATH));
  const goDecision = input.goNoGo?.decision ?? steadyStateEvaluation.goDecision;
  const tracksHealthy = steadyStateEvaluation.health.overdueCount === 0;
  const measurableTracksNeedAttention = measurableTrackNeedsAttention(steadyStateEvaluation.tracks);
  const steadyStateReportPresent = existsSync(join(root, POST_TERMINUS_STEADY_STATE_REPORT_PATH));
  const steadyStateExecutionStarted = detectPostTerminusSteadyStateStarted(env);

  const milestone = resolveSteadyStateOperatorLoopLockExecutionMilestone({
    productionPilotReadyPassed,
    steadyStateActive: steadyStateEvaluation.steadyStateActive || steadyStateExecutionStarted,
    postTerminusSteadyStateMilestone,
    overdueCount: steadyStateEvaluation.health.overdueCount,
    measurableTracksNeedAttention,
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    perCustomerIsolation,
    eraCharterReviewed,
    era25OperatorLoopLockIntegrityPassed: era25OperatorLoopLockIntegrity.integrityPassed,
  });

  const gates = buildSteadyStateOperatorLoopLockExecutionGates({
    productionPilotReadyPassed,
    productionPilotReadyClosureMilestone: productionPilotReadyClosure.milestone,
    steadyStateActive: steadyStateEvaluation.steadyStateActive,
    postTerminusSteadyStateMilestone,
    tracksHealthy,
    overdueCount: steadyStateEvaluation.health.overdueCount,
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    engineeringPathTerminusIntegrityPassed: engineeringPathTerminusIntegrity.integrityPassed,
    era25OperatorLoopLockIntegrityPassed: era25OperatorLoopLockIntegrity.integrityPassed,
    eraCharterReviewed,
    perCustomerIsolation,
    goDecision,
    commercialInflectionMilestone: inflection.milestone,
    steadyStateReportPresent,
  });

  const nextAttentionTrack =
    steadyStateEvaluation.tracks.find((track) => track.status === "overdue") ?? null;

  const recommendedCommands: string[] = [];
  if (!productionPilotReadyPassed) {
    recommendedCommands.push("npm run ops:run-production-pilot-ready-closure-execution -- --write");
    recommendedCommands.push("npm run run:production-pilot-ready");
  } else if (!steadyStateEvaluation.steadyStateActive) {
    recommendedCommands.push(
      "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-commercial-pilot-path -- --json");
  } else if (measurableTracksNeedAttention || steadyStateEvaluation.health.overdueCount > 0) {
    if (nextAttentionTrack?.commands.length) {
      recommendedCommands.push(`npm run ${nextAttentionTrack.commands[0]!}`);
    }
    recommendedCommands.push("npm run ops:validate-steady-state-operator-loop -- --json");
    recommendedCommands.push(...postTerminusOrchestrator.recommendedCommands.slice(0, 3));
  } else if (!perCustomerIsolation || goDecision !== "GO") {
    recommendedCommands.push("npm run smoke:pilot-gono-go");
  } else if (!postTerminusSteadyStateIntegrity.integrityPassed) {
    recommendedCommands.push("npm run ops:validate-post-terminus-steady-state-integrity -- --json");
  } else if (!eraCharterReviewed) {
    recommendedCommands.push("npm run ops:export-era-charter-readiness-checklist -- --write");
  } else if (!era25OperatorLoopLockIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json",
    );
  }

  if (milestone === "steady_state_operator_loop_passed") {
    recommendedCommands.push(
      "npm run ops:run-commercial-pilot-path-absolute-end-lock-execution -- --write",
    );
    recommendedCommands.push(
      "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
    );
  }

  return {
    version: "steady-state-operator-loop-lock-execution-v1",
    policyId: STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    productionPilotReadyClosureMilestone: productionPilotReadyClosure.milestone,
    postTerminusSteadyStateMilestone,
    goDecision,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
    steadyStateActive: steadyStateEvaluation.steadyStateActive,
    engineeringTerminusActive: steadyStateEvaluation.engineeringTerminusActive,
    engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
    engineeringPathTerminusIntegrityPassed: engineeringPathTerminusIntegrity.integrityPassed,
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    era25OperatorLoopLockIntegrityPassed: era25OperatorLoopLockIntegrity.integrityPassed,
    eraCharterReviewed,
    steadyStateReportPresent,
    perCustomerIsolation,
    tracksHealthy,
    overdueCount: steadyStateEvaluation.health.overdueCount,
    nextAttentionTrackId: nextAttentionTrack?.id ?? null,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    tracks: steadyStateEvaluation.tracks,
    gates,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/launch-wizard",
      "/platform/commercial-pilot-ops#post-terminus-steady-state",
      "/platform/commercial-pilot-ops#era25-steady-state-operator-loop-lock",
      "/dashboard/today",
    ],
    honestyNote:
      "PASS > SKIPPED — Step 15 requires production_pilot_ready_passed. Steady-state rhythms need real operator usage. Never fabricate era charter or era58 lock attestations. ICP = all F&B formats.",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function formatSteadyStateOperatorLoopLockExecutionLines(
  summary: SteadyStateOperatorLoopLockExecutionSummary,
): string[] {
  return [
    `Steady-state operator loop lock: ${summary.milestone}`,
    `Production pilot ready: ${summary.productionPilotReadyClosureMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Post-terminus steady state: ${summary.postTerminusSteadyStateMilestone} · tracks ${summary.tracksHealthy ? "healthy" : `${summary.overdueCount} overdue`}`,
    `Integrity era38 ${summary.postTerminusSteadyStateIntegrityPassed ? "PASS" : "FAIL"} · era58 ${summary.era25OperatorLoopLockIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextAttentionTrackId
      ? `Next attention track: ${summary.nextAttentionTrackId}`
      : "No overdue steady-state tracks",
  ];
}
