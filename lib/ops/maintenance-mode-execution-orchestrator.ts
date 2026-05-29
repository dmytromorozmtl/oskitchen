/**
 * Maintenance mode execution orchestrator — Step 13 honest milestone + rhythm truth.
 * Policy: era41-maintenance-mode-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateEra25PostReentrantCharterLockIntegrity } from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";
import { evaluateMaintenanceModeIntegrity } from "@/lib/commercial/maintenance-mode-integrity-era36";
import {
  detectMaintenanceModeStarted,
  resolveNextMaintenanceModeAttentionRhythm,
  type MaintenanceModeRhythmStatus,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import {
  MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS,
  MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS,
} from "@/lib/commercial/maintenance-mode-post-product-evolution-orchestrator-era24";
import { evaluateSustainedProductEvolutionReentrantIntegrity } from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { ContinuousImprovementLoopExecutionSummary } from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";
import { buildContinuousImprovementLoopExecutionSummary } from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import type { SustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import type { SustainedProductEvolutionExecutionSummary } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";

export const MAINTENANCE_MODE_EXECUTION_POLICY_ID =
  "era41-maintenance-mode-execution-v1" as const;

export const MAINTENANCE_MODE_EXECUTION_DOC =
  "docs/next-step-13-maintenance-mode-execution-2026-05-29.md" as const;

export const MAINTENANCE_MODE_EXECUTION_STEP14_DOC =
  "docs/next-step-14-production-pilot-ready-closure-2026-05-29.md" as const;

export const MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/maintenance-mode-execution-summary.json" as const;

export const MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT =
  "artifacts/maintenance-mode-execution-report.html" as const;

export const MAINTENANCE_MODE_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-maintenance-mode-execution" as const;

export type MaintenanceModeExecutionMilestone =
  | "continuous_improvement_loop_blocked"
  | "awaiting_maintenance_mode_active"
  | "awaiting_rhythm_weekly"
  | "awaiting_rhythm_monthly"
  | "awaiting_rhythm_calendar_review"
  | "awaiting_per_pilot_isolation"
  | "awaiting_maintenance_mode_integrity"
  | "awaiting_reentrant_integrity"
  | "awaiting_charter_lock_integrity"
  | "maintenance_mode_passed";

export type MaintenanceModeExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type MaintenanceModeExecutionSummary = {
  version: "maintenance-mode-execution-v1";
  policyId: typeof MAINTENANCE_MODE_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: MaintenanceModeExecutionMilestone;
  ciLoopExecutionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  maintenanceModeActive: boolean;
  commercialPilotPathComplete: boolean;
  rhythmsHealthy: boolean;
  overdueCount: number;
  maintenanceModeIntegrityPassed: boolean;
  reentrantIntegrityPassed: boolean;
  charterLockIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  improvementLoopOverdue: number;
  productEvolutionOverdue: number;
  rhythms: readonly MaintenanceModeRhythmStatus[];
  gates: readonly MaintenanceModeExecutionGateStatus[];
  nextAttentionRhythm: MaintenanceModeRhythmStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

function rhythmNeedsAttention(
  rhythms: readonly Pick<MaintenanceModeRhythmStatus, "id" | "status">[],
  ids: readonly string[],
): boolean {
  const idSet = new Set(ids);
  return rhythms.some(
    (rhythm) =>
      idSet.has(rhythm.id) &&
      (rhythm.status === "overdue" || rhythm.status === "due_soon"),
  );
}

export function resolveMaintenanceModeExecutionMilestone(input: {
  continuousImprovementLoopPassed: boolean;
  maintenanceModeActive: boolean;
  overdueCount: number;
  nextAttentionRhythm: Pick<MaintenanceModeRhythmStatus, "id"> | null;
  weeklyRhythmNeedsAttention: boolean;
  monthlyCadenceNeedsAttention: boolean;
  maintenanceModeStarted: boolean;
  rhythmCalendarReviewed: boolean;
  perCustomerIsolation: boolean;
  maintenanceModeIntegrityPassed: boolean;
  reentrantIntegrityPassed: boolean;
  charterLockIntegrityPassed: boolean;
}): MaintenanceModeExecutionMilestone {
  if (!input.continuousImprovementLoopPassed) {
    return "continuous_improvement_loop_blocked";
  }

  if (!input.maintenanceModeActive) {
    return "awaiting_maintenance_mode_active";
  }

  if (input.weeklyRhythmNeedsAttention) {
    return "awaiting_rhythm_weekly";
  }

  if (input.monthlyCadenceNeedsAttention) {
    return "awaiting_rhythm_monthly";
  }

  if (input.overdueCount > 0 && input.nextAttentionRhythm) {
    if (MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS.includes(
      input.nextAttentionRhythm.id as (typeof MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS)[number],
    )) {
      return "awaiting_rhythm_weekly";
    }
    if (MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS.includes(
      input.nextAttentionRhythm.id as (typeof MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS)[number],
    )) {
      return "awaiting_rhythm_monthly";
    }
  }

  if (!input.perCustomerIsolation) {
    return "awaiting_per_pilot_isolation";
  }

  if (input.maintenanceModeStarted && !input.rhythmCalendarReviewed) {
    return "awaiting_rhythm_calendar_review";
  }

  if (!input.maintenanceModeIntegrityPassed) {
    return "awaiting_maintenance_mode_integrity";
  }

  if (!input.reentrantIntegrityPassed) {
    return "awaiting_reentrant_integrity";
  }

  if (!input.charterLockIntegrityPassed) {
    return "awaiting_charter_lock_integrity";
  }

  return "maintenance_mode_passed";
}

export function buildMaintenanceModeExecutionGates(input: {
  continuousImprovementLoopPassed: boolean;
  ciLoopExecutionMilestone: string | null;
  maintenanceModeActive: boolean;
  commercialPilotPathComplete: boolean;
  rhythmsHealthy: boolean;
  overdueCount: number;
  weeklyRhythmHealthy: boolean;
  monthlyCadenceHealthy: boolean;
  perCustomerIsolation: boolean;
  maintenanceModeStarted: boolean;
  rhythmCalendarReviewed: boolean;
  maintenanceModeIntegrityPassed: boolean;
  productEvolutionIntegrityPassed: boolean;
  reentrantIntegrityPassed: boolean;
  charterLockIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
  metricsBaselinePassed: boolean;
  integrationHonest: boolean;
}): MaintenanceModeExecutionGateStatus[] {
  return [
    {
      id: "continuous_improvement_loop",
      label: "Continuous improvement loop complete (Step 12)",
      complete: input.continuousImprovementLoopPassed,
      proofStatus: input.continuousImprovementLoopPassed
        ? "continuous_improvement_loop_passed"
        : input.ciLoopExecutionMilestone,
      detail: input.continuousImprovementLoopPassed
        ? "Seven recurring tracks + era34 integrity passed."
        : "Complete Step 12 — continuous improvement loop execution.",
      command: "npm run ops:run-continuous-improvement-loop-execution -- --write",
    },
    {
      id: "maintenance_mode_active",
      label: "Maintenance mode active (commercial pilot path)",
      complete: input.maintenanceModeActive,
      proofStatus: input.maintenanceModeActive ? "maintenance_active" : "blocked",
      detail: input.maintenanceModeActive
        ? "GO + product evolution + sustained ops convergence ready."
        : "Product evolution and era25 convergence must be complete.",
      command: "npm run ops:validate-maintenance-mode -- --json",
    },
    {
      id: "maintenance_rhythms",
      label: "Operator rhythms healthy (weekly + monthly)",
      complete: input.rhythmsHealthy,
      proofStatus: input.rhythmsHealthy ? "rhythms_healthy" : `${input.overdueCount}_overdue`,
      detail: input.rhythmsHealthy
        ? "No overdue weekly or monthly cadence rhythms."
        : "Refresh stale operator rhythm evidence — guidance rhythms do not block.",
      command: MAINTENANCE_MODE_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "weekly_rhythm",
      label: "Weekly rhythm bundle (Mon/Wed/Fri)",
      complete: input.weeklyRhythmHealthy,
      proofStatus: input.weeklyRhythmHealthy ? "weekly_fresh" : "stale",
      detail: "Wed integration requires smoke:woo-shopify-live or commerce-webhook-drill evidence.",
      command: "npm run smoke:woo-shopify-live",
    },
    {
      id: "monthly_cadence",
      label: "Monthly cadence bundle (W1–W4)",
      complete: input.monthlyCadenceHealthy,
      proofStatus: input.monthlyCadenceHealthy ? "monthly_fresh" : "stale",
      detail: "W1 metrics + W2 feedback triage require pilot-metrics-baseline PASS.",
      command: "npm run smoke:pilot-metrics-baseline",
    },
    {
      id: "per_pilot_isolation",
      label: "Per-pilot GO isolation (Scale Gate 1)",
      complete: input.perCustomerIsolation,
      proofStatus: input.perCustomerIsolation ? "isolation_maintained" : "pending",
      detail: "SCALE_PER_CUSTOMER_GO_ISOLATION=1 before each smoke:pilot-gono-go.",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "rhythm_calendar",
      label: "Rhythm calendar quarterly review",
      complete: !input.maintenanceModeStarted || input.rhythmCalendarReviewed,
      proofStatus: input.rhythmCalendarReviewed ? "reviewed" : "pending",
      detail: input.maintenanceModeStarted
        ? "MAINTENANCE_MODE_RHYTHM_CALENDAR_REVIEWED required after maintenance attestation."
        : "Optional until maintenance mode env attestation started.",
      command: "npm run ops:export-maintenance-mode-rhythm-calendar -- --write",
    },
    {
      id: "maintenance_mode_integrity",
      label: "Maintenance mode integrity (era36)",
      complete: input.maintenanceModeIntegrityPassed,
      proofStatus: input.maintenanceModeIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No maintenance started without product evolution or fake rhythm calendar attestation.",
      command: "npm run ops:validate-maintenance-mode-integrity -- --json",
    },
    {
      id: "product_evolution_integrity",
      label: "Product evolution integrity prerequisite (era35)",
      complete: input.productEvolutionIntegrityPassed,
      proofStatus: input.productEvolutionIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "Maintenance mode requires honest product evolution integrity chain.",
      command: "npm run ops:validate-sustained-product-evolution-integrity -- --json",
    },
    {
      id: "reentrant_integrity",
      label: "Era25 re-entrant product evolution integrity (era56)",
      complete: input.reentrantIntegrityPassed,
      proofStatus: input.reentrantIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "Re-entrant train closure before charter lock phase.",
      command: "npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json",
    },
    {
      id: "charter_lock_integrity",
      label: "Era25 post-re-entrant charter lock integrity (era57)",
      complete: input.charterLockIntegrityPassed,
      proofStatus: input.charterLockIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "Charter lock phase after re-entrant integrity PASS.",
      command: "npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through maintenance mode — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildMaintenanceModeExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  ciLoopExecution?: ContinuousImprovementLoopExecutionSummary | null;
  productEvolutionExecution?: SustainedProductEvolutionExecutionSummary | null;
  sustainedOpsExecution?: SustainedOperationalExcellenceExecutionSummary | null;
  marketLeaderExecution?: MarketLeaderPositioningExecutionSummary | null;
  seriesAExpansion?: SeriesAPartnerExpansionExecutionSummary | null;
  productionGa?: ProductionGaExecutionSummary | null;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): MaintenanceModeExecutionSummary {
  const env = input.env ?? process.env;
  const artifacts = readContinuousImprovementLoopArtifacts();
  const maintenanceEvaluation = evaluateMaintenanceMode(env);
  const maintenanceIntegrity = evaluateMaintenanceModeIntegrity(process.cwd(), {
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
  const reentrantIntegrity = evaluateSustainedProductEvolutionReentrantIntegrity(process.cwd(), {
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
  const charterLockIntegrity = evaluateEra25PostReentrantCharterLockIntegrity(process.cwd(), {
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
  const inflection = evaluateCommercialInflectionReadiness(env);

  const ciLoopExecution =
    input.ciLoopExecution ??
    buildContinuousImprovementLoopExecutionSummary({
      env,
      productEvolutionExecution: input.productEvolutionExecution ?? null,
      sustainedOpsExecution: input.sustainedOpsExecution ?? null,
      marketLeaderExecution: input.marketLeaderExecution ?? null,
      seriesAExpansion: input.seriesAExpansion ?? null,
      productionGa: input.productionGa ?? null,
      scaleExpansion: input.scaleExpansion ?? null,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? artifacts.goNoGoSummary,
    });

  const rhythms = maintenanceEvaluation.rhythms;
  const overdueCount = maintenanceEvaluation.health.overdueCount;
  const rhythmsHealthy = overdueCount === 0;
  const nextAttentionRhythm = resolveNextMaintenanceModeAttentionRhythm(rhythms);
  const continuousImprovementLoopPassed =
    ciLoopExecution.milestone === "continuous_improvement_loop_passed";
  const maintenanceModeStarted = detectMaintenanceModeStarted(env);
  const rhythmCalendarReviewed =
    parseEnvBoolean(env.MAINTENANCE_MODE_RHYTHM_CALENDAR_REVIEWED) === true;
  const perCustomerIsolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;

  const weeklyRhythmNeedsAttention = rhythmNeedsAttention(rhythms, MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS);
  const monthlyCadenceNeedsAttention = rhythmNeedsAttention(
    rhythms,
    MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS,
  );
  const weeklyRhythmHealthy = !weeklyRhythmNeedsAttention;
  const monthlyCadenceHealthy = !monthlyCadenceNeedsAttention;

  const channelLivePassed =
    artifacts.p0Staging?.children.channelLive.overall === "PASSED";
  const tier2Passed = artifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const integrationHonest = channelLivePassed || tier2Passed;
  const metricsBaselinePassed = artifacts.metricsBaseline?.overall === "PASSED";

  const milestone = resolveMaintenanceModeExecutionMilestone({
    continuousImprovementLoopPassed,
    maintenanceModeActive: maintenanceEvaluation.maintenanceModeActive,
    overdueCount,
    nextAttentionRhythm,
    weeklyRhythmNeedsAttention,
    monthlyCadenceNeedsAttention,
    maintenanceModeStarted,
    rhythmCalendarReviewed,
    perCustomerIsolation,
    maintenanceModeIntegrityPassed: maintenanceIntegrity.integrityPassed,
    reentrantIntegrityPassed: reentrantIntegrity.integrityPassed,
    charterLockIntegrityPassed: charterLockIntegrity.integrityPassed,
  });

  const gates = buildMaintenanceModeExecutionGates({
    continuousImprovementLoopPassed,
    ciLoopExecutionMilestone: ciLoopExecution.milestone,
    maintenanceModeActive: maintenanceEvaluation.maintenanceModeActive,
    commercialPilotPathComplete: maintenanceEvaluation.commercialPilotPathComplete,
    rhythmsHealthy,
    overdueCount,
    weeklyRhythmHealthy,
    monthlyCadenceHealthy,
    perCustomerIsolation,
    maintenanceModeStarted,
    rhythmCalendarReviewed,
    maintenanceModeIntegrityPassed: maintenanceIntegrity.integrityPassed,
    productEvolutionIntegrityPassed: maintenanceIntegrity.productEvolutionIntegrityPassed,
    reentrantIntegrityPassed: reentrantIntegrity.integrityPassed,
    charterLockIntegrityPassed: charterLockIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? maintenanceEvaluation.goDecision,
    metricsBaselinePassed,
    integrationHonest,
  });

  const recommendedCommands: string[] = [];
  if (!continuousImprovementLoopPassed) {
    recommendedCommands.push("npm run ops:run-continuous-improvement-loop-execution -- --write");
    recommendedCommands.push("npm run ops:run-continuous-improvement-loop-execution -- --execute");
  } else if (!maintenanceEvaluation.maintenanceModeActive) {
    recommendedCommands.push(
      "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-maintenance-mode -- --json");
  } else if (weeklyRhythmNeedsAttention || monthlyCadenceNeedsAttention) {
    const wed = rhythms.find((rhythm) => rhythm.id === "weekly_wed_integration_health");
    if (wed?.commands.length) {
      for (const script of wed.commands) {
        recommendedCommands.push(`npm run ${script}`);
      }
    }
    const monthlyW1 = rhythms.find((rhythm) => rhythm.id === "monthly_w1_metrics_baseline");
    if (monthlyW1?.commands.length) {
      recommendedCommands.push(`npm run ${monthlyW1.commands[0]!}`);
    }
    recommendedCommands.push(
      "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
    );
  } else if (!perCustomerIsolation) {
    recommendedCommands.push("npm run smoke:pilot-gono-go");
    recommendedCommands.push("npm run ops:validate-scale-readiness-env -- --json");
  } else if (maintenanceModeStarted && !rhythmCalendarReviewed) {
    recommendedCommands.push("npm run ops:export-maintenance-mode-rhythm-calendar -- --write");
  } else if (!maintenanceIntegrity.integrityPassed) {
    recommendedCommands.push("npm run ops:validate-maintenance-mode-integrity -- --json");
  } else if (!reentrantIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json",
    );
  } else if (!charterLockIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json",
    );
  }

  if (milestone === "maintenance_mode_passed") {
    recommendedCommands.push(
      "npm run ops:run-production-pilot-ready-closure-execution -- --write",
    );
    recommendedCommands.push(
      "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
    );
  }

  return {
    version: "maintenance-mode-execution-v1",
    policyId: MAINTENANCE_MODE_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    ciLoopExecutionMilestone: ciLoopExecution.milestone,
    goDecision: input.goNoGo?.decision ?? maintenanceEvaluation.goDecision,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
    maintenanceModeActive: maintenanceEvaluation.maintenanceModeActive,
    commercialPilotPathComplete: maintenanceEvaluation.commercialPilotPathComplete,
    rhythmsHealthy,
    overdueCount,
    maintenanceModeIntegrityPassed: maintenanceIntegrity.integrityPassed,
    reentrantIntegrityPassed: reentrantIntegrity.integrityPassed,
    charterLockIntegrityPassed: charterLockIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    improvementLoopOverdue: maintenanceEvaluation.improvementLoop.health.overdueCount,
    productEvolutionOverdue: maintenanceEvaluation.productEvolution.health.overdueCount,
    rhythms,
    gates,
    nextAttentionRhythm,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/today",
      "/dashboard/order-hub",
      "/dashboard/integration-health",
      "/dashboard/reports",
      "/dashboard/launch-wizard",
      "/platform/commercial-pilot-ops",
    ],
    honestyNote:
      "PASS > SKIPPED — weekly rhythms require real operator usage. Rhythm calendar attestation only after product evolution integrity PASS. Per-pilot GO isolation mandatory. ICP = all F&B formats.",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function formatMaintenanceModeExecutionLines(
  summary: MaintenanceModeExecutionSummary,
): string[] {
  return [
    `Maintenance mode execution: ${summary.milestone}`,
    `CI loop: ${summary.ciLoopExecutionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Rhythms: ${summary.rhythmsHealthy ? "healthy" : `${summary.overdueCount} overdue`}`,
    `Maintenance active: ${summary.maintenanceModeActive ? "yes" : "no"} · reentrant ${summary.reentrantIntegrityPassed ? "PASS" : "FAIL"} · charter ${summary.charterLockIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextAttentionRhythm
      ? `Next rhythm: ${summary.nextAttentionRhythm.label} — ${summary.nextAttentionRhythm.detail}`
      : "All measurable rhythms fresh or blocked on CI loop",
  ];
}
