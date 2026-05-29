/**
 * Continuous improvement loop execution orchestrator — Step 12 honest milestone + track truth.
 * Policy: era40-continuous-improvement-loop-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  detectContinuousImprovementLoopStarted,
  resolveNextContinuousImprovementLoopAttentionTrack,
  type ContinuousImprovementLoopTrackStatus,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { resolveEra25PureOperationalModeContext } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import type { SustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import type { SustainedProductEvolutionExecutionSummary } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";
import { buildSustainedProductEvolutionExecutionSummary } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";
import {
  evaluateContinuousImprovementLoop,
  readContinuousImprovementLoopArtifacts,
} from "@/scripts/ops/validate-continuous-improvement-loop";

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID =
  "era40-continuous-improvement-loop-execution-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_DOC =
  "docs/next-step-12-continuous-improvement-loop-execution-2026-05-29.md" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_STEP13_DOC =
  "docs/next-step-13-maintenance-mode-execution-2026-05-29.md" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/continuous-improvement-loop-execution-summary.json" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT =
  "artifacts/continuous-improvement-loop-execution-report.html" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-continuous-improvement-loop-execution" as const;

export type ContinuousImprovementLoopExecutionMilestone =
  | "sustained_product_evolution_blocked"
  | "awaiting_pure_operational_mode"
  | "awaiting_track_weekly_integration"
  | "awaiting_track_monthly_metrics"
  | "awaiting_track_quarterly_governance"
  | "awaiting_per_pilot_isolation"
  | "awaiting_release_cadence_review"
  | "awaiting_pure_ops_terminus"
  | "awaiting_maintenance_mode_readiness"
  | "awaiting_ci_loop_integrity"
  | "continuous_improvement_loop_passed";

export type ContinuousImprovementLoopExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type ContinuousImprovementLoopExecutionSummary = {
  version: "continuous-improvement-loop-execution-v1";
  policyId: typeof CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: ContinuousImprovementLoopExecutionMilestone;
  productEvolutionExecutionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  pureOperationalMode: boolean;
  sustainedOpsComplete: boolean;
  tracksHealthy: boolean;
  overdueCount: number;
  improvementLoopIntegrityPassed: boolean;
  pureOperationalModeEra25Active: boolean;
  maintenanceModeActive: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  tracks: readonly ContinuousImprovementLoopTrackStatus[];
  gates: readonly ContinuousImprovementLoopExecutionGateStatus[];
  nextAttentionTrack: ContinuousImprovementLoopTrackStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveContinuousImprovementLoopExecutionMilestone(input: {
  sustainedProductEvolutionPassed: boolean;
  pureOperationalMode: boolean;
  overdueCount: number;
  nextAttentionTrack: Pick<ContinuousImprovementLoopTrackStatus, "id"> | null;
  perCustomerIsolation: boolean;
  improvementLoopStarted: boolean;
  releaseCadenceReviewed: boolean;
  pureOperationalModeEra25Active: boolean;
  maintenanceModeActive: boolean;
  improvementLoopIntegrityPassed: boolean;
}): ContinuousImprovementLoopExecutionMilestone {
  if (!input.sustainedProductEvolutionPassed) {
    return "sustained_product_evolution_blocked";
  }

  if (!input.pureOperationalMode) {
    return "awaiting_pure_operational_mode";
  }

  if (input.overdueCount > 0 && input.nextAttentionTrack) {
    switch (input.nextAttentionTrack.id) {
      case "weekly_integration":
        return "awaiting_track_weekly_integration";
      case "monthly_metrics":
        return "awaiting_track_monthly_metrics";
      case "quarterly_governance":
        return "awaiting_track_quarterly_governance";
      default:
        break;
    }
  }

  if (!input.perCustomerIsolation) {
    return "awaiting_per_pilot_isolation";
  }

  if (input.improvementLoopStarted && !input.releaseCadenceReviewed) {
    return "awaiting_release_cadence_review";
  }

  if (!input.pureOperationalModeEra25Active) {
    return "awaiting_pure_ops_terminus";
  }

  if (!input.maintenanceModeActive) {
    return "awaiting_maintenance_mode_readiness";
  }

  if (!input.improvementLoopIntegrityPassed) {
    return "awaiting_ci_loop_integrity";
  }

  return "continuous_improvement_loop_passed";
}

export function buildContinuousImprovementLoopExecutionGates(input: {
  sustainedProductEvolutionPassed: boolean;
  productEvolutionExecutionMilestone: string | null;
  pureOperationalMode: boolean;
  sustainedOpsComplete: boolean;
  tracksHealthy: boolean;
  overdueCount: number;
  weeklyIntegrationHealthy: boolean;
  monthlyMetricsHealthy: boolean;
  quarterlyGovernanceHealthy: boolean;
  perCustomerIsolation: boolean;
  improvementLoopStarted: boolean;
  releaseCadenceReviewed: boolean;
  pureOperationalModeEra25Active: boolean;
  maintenanceModeActive: boolean;
  improvementLoopIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
  integrationHonest: boolean;
  metricsBaselinePassed: boolean;
  competitorAligned: boolean;
}): ContinuousImprovementLoopExecutionGateStatus[] {
  return [
    {
      id: "sustained_product_evolution",
      label: "Sustained product evolution complete (Step 11)",
      complete: input.sustainedProductEvolutionPassed,
      proofStatus: input.sustainedProductEvolutionPassed
        ? "sustained_product_evolution_passed"
        : input.productEvolutionExecutionMilestone,
      detail: input.sustainedProductEvolutionPassed
        ? "Six product-led growth tracks + era35 integrity passed."
        : "Complete Step 11 — sustained product evolution execution.",
      command: "npm run ops:run-sustained-product-evolution-execution -- --write",
    },
    {
      id: "pure_operational_mode",
      label: "Pure operational mode active (sustained ops prerequisite)",
      complete: input.pureOperationalMode,
      proofStatus: input.pureOperationalMode ? "pure_operational_mode" : "blocked",
      detail: input.pureOperationalMode
        ? "GO + sustained ops cadences complete — improvement loop tracks unlocked."
        : "Sustained ops must be complete before CI loop execution.",
      command: "npm run ops:validate-sustained-operational-excellence-env -- --json",
    },
    {
      id: "ci_loop_tracks",
      label: "CI loop measurable tracks healthy",
      complete: input.tracksHealthy,
      proofStatus: input.tracksHealthy ? "tracks_healthy" : `${input.overdueCount}_overdue`,
      detail: input.tracksHealthy
        ? "Weekly integration, monthly metrics, quarterly governance fresh."
        : "Refresh stale improvement loop evidence — guidance tracks do not block.",
      command: CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "weekly_integration",
      label: "Weekly integration smokes (channel live or Tier 2)",
      complete: input.weeklyIntegrationHealthy && input.integrationHonest,
      proofStatus: input.integrationHonest ? "integration_honest" : "pending",
      detail: "Requires smoke:woo-shopify-live PASS or Tier 2 proof_passed.",
      command: "npm run smoke:woo-shopify-live",
    },
    {
      id: "monthly_metrics",
      label: "Monthly pilot metrics baseline PASS",
      complete: input.monthlyMetricsHealthy && input.metricsBaselinePassed,
      proofStatus: input.metricsBaselinePassed ? "PASSED" : "pending",
      detail: "Per-customer metrics baseline — never shared across pilots.",
      command: "npm run smoke:pilot-metrics-baseline",
    },
    {
      id: "quarterly_governance",
      label: "Quarterly governance (competitor + claims)",
      complete: input.quarterlyGovernanceHealthy && input.competitorAligned,
      proofStatus: input.competitorAligned ? "evidence_aligned_era17" : "pending",
      detail: "Competitor matrix must remain evidence_aligned_era17.",
      command: "npm run smoke:competitor-feature-gap-matrix",
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
      id: "release_cadence",
      label: "Release cadence reviewed",
      complete: !input.improvementLoopStarted || input.releaseCadenceReviewed,
      proofStatus: input.releaseCadenceReviewed ? "reviewed" : "pending",
      detail: input.improvementLoopStarted
        ? "CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CADENCE_REVIEWED required after loop attestation."
        : "Optional until improvement loop env attestation started.",
      command: "npm run ops:export-continuous-improvement-loop-release-checklist -- --write",
    },
    {
      id: "pure_ops_terminus",
      label: "Pure operational mode era25 terminus active",
      complete: input.pureOperationalModeEra25Active,
      proofStatus: input.pureOperationalModeEra25Active ? "era25_active" : "pending",
      detail: "Era25 convergence train closure before maintenance mode.",
      command: "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
    },
    {
      id: "maintenance_mode_readiness",
      label: "Maintenance mode readiness (commercial pilot path)",
      complete: input.maintenanceModeActive,
      proofStatus: input.maintenanceModeActive ? "maintenance_ready" : "pending",
      detail: "GO + product evolution + sustained ops convergence — Step 13 entry.",
      command: "npm run ops:validate-maintenance-mode -- --json",
    },
    {
      id: "ci_loop_integrity",
      label: "Continuous improvement loop integrity (era34)",
      complete: input.improvementLoopIntegrityPassed,
      proofStatus: input.improvementLoopIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No improvement loop started without sustained ops or fake metrics PASS.",
      command: "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through CI loop — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildContinuousImprovementLoopExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  productEvolutionExecution?: SustainedProductEvolutionExecutionSummary | null;
  sustainedOpsExecution?: SustainedOperationalExcellenceExecutionSummary | null;
  marketLeaderExecution?: MarketLeaderPositioningExecutionSummary | null;
  seriesAExpansion?: SeriesAPartnerExpansionExecutionSummary | null;
  productionGa?: ProductionGaExecutionSummary | null;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): ContinuousImprovementLoopExecutionSummary {
  const env = input.env ?? process.env;
  const artifacts = readContinuousImprovementLoopArtifacts();
  const evaluation = evaluateContinuousImprovementLoop(env);
  const maintenanceMode = evaluateMaintenanceMode(env);
  const era25 = resolveEra25PureOperationalModeContext(env);
  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(process.cwd(), {
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

  const productEvolutionExecution =
    input.productEvolutionExecution ??
    buildSustainedProductEvolutionExecutionSummary({
      env,
      sustainedOpsExecution: input.sustainedOpsExecution ?? null,
      marketLeaderExecution: input.marketLeaderExecution ?? null,
      seriesAExpansion: input.seriesAExpansion ?? null,
      productionGa: input.productionGa ?? null,
      scaleExpansion: input.scaleExpansion ?? null,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? artifacts.goNoGoSummary,
    });

  const tracks = evaluation.tracks;
  const overdueCount = evaluation.health.overdueCount;
  const tracksHealthy = overdueCount === 0;
  const nextAttentionTrack = resolveNextContinuousImprovementLoopAttentionTrack(tracks);
  const sustainedProductEvolutionPassed =
    productEvolutionExecution.milestone === "sustained_product_evolution_passed";
  const improvementLoopStarted = detectContinuousImprovementLoopStarted(env);
  const releaseCadenceReviewed =
    parseEnvBoolean(env.CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CADENCE_REVIEWED) === true;
  const perCustomerIsolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;

  const weeklyTrack = tracks.find((track) => track.id === "weekly_integration");
  const monthlyTrack = tracks.find((track) => track.id === "monthly_metrics");
  const quarterlyTrack = tracks.find((track) => track.id === "quarterly_governance");
  const weeklyIntegrationHealthy =
    weeklyTrack?.status === "healthy" || weeklyTrack?.status === "guidance";
  const monthlyMetricsHealthy =
    monthlyTrack?.status === "healthy" || monthlyTrack?.status === "guidance";
  const quarterlyGovernanceHealthy =
    quarterlyTrack?.status === "healthy" || quarterlyTrack?.status === "guidance";
  const channelLivePassed =
    artifacts.p0Staging?.children.channelLive.overall === "PASSED";
  const tier2Passed = artifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const integrationHonest = channelLivePassed || tier2Passed;
  const metricsBaselinePassed = artifacts.metricsBaseline?.overall === "PASSED";
  const competitorAligned =
    artifacts.competitorMatrix?.overall === "PASSED" &&
    artifacts.competitorMatrix.matrixProofStatus === "evidence_aligned_era17";

  const milestone = resolveContinuousImprovementLoopExecutionMilestone({
    sustainedProductEvolutionPassed,
    pureOperationalMode: evaluation.pureOperationalMode,
    overdueCount,
    nextAttentionTrack,
    perCustomerIsolation,
    improvementLoopStarted,
    releaseCadenceReviewed,
    pureOperationalModeEra25Active: era25.pureOperationalModeEra25Active,
    maintenanceModeActive: maintenanceMode.maintenanceModeActive,
    improvementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
  });

  const gates = buildContinuousImprovementLoopExecutionGates({
    sustainedProductEvolutionPassed,
    productEvolutionExecutionMilestone: productEvolutionExecution.milestone,
    pureOperationalMode: evaluation.pureOperationalMode,
    sustainedOpsComplete: evaluation.sustainedOpsComplete,
    tracksHealthy,
    overdueCount,
    weeklyIntegrationHealthy,
    monthlyMetricsHealthy,
    quarterlyGovernanceHealthy,
    perCustomerIsolation,
    improvementLoopStarted,
    releaseCadenceReviewed,
    pureOperationalModeEra25Active: era25.pureOperationalModeEra25Active,
    maintenanceModeActive: maintenanceMode.maintenanceModeActive,
    improvementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? evaluation.goDecision,
    integrationHonest,
    metricsBaselinePassed,
    competitorAligned,
  });

  const recommendedCommands: string[] = [];
  if (!sustainedProductEvolutionPassed) {
    recommendedCommands.push("npm run ops:run-sustained-product-evolution-execution -- --write");
    recommendedCommands.push("npm run ops:run-sustained-product-evolution-execution -- --execute");
  } else if (!evaluation.pureOperationalMode) {
    recommendedCommands.push(
      "npm run ops:run-sustained-operational-excellence-execution -- --write",
    );
    recommendedCommands.push("npm run ops:validate-continuous-improvement-loop -- --json");
  } else if (overdueCount > 0 && nextAttentionTrack) {
    if (nextAttentionTrack.smokeScripts.length) {
      for (const script of nextAttentionTrack.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    }
    recommendedCommands.push(
      "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
    );
  } else if (!perCustomerIsolation) {
    recommendedCommands.push("npm run smoke:pilot-gono-go");
    recommendedCommands.push("npm run ops:validate-scale-readiness-env -- --json");
  } else if (improvementLoopStarted && !releaseCadenceReviewed) {
    recommendedCommands.push(
      "npm run ops:export-continuous-improvement-loop-release-checklist -- --write",
    );
  } else if (!era25.pureOperationalModeEra25Active) {
    recommendedCommands.push(
      "npm run ops:run-pure-operational-mode-terminus-era25-post-sustained-ops-convergence-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-pure-operational-mode-terminus-era25 -- --json");
  } else if (!maintenanceMode.maintenanceModeActive) {
    recommendedCommands.push("npm run ops:validate-maintenance-mode -- --json");
    recommendedCommands.push(
      "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
    );
  } else if (!improvementLoopIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    );
  }

  if (milestone === "continuous_improvement_loop_passed") {
    recommendedCommands.push(
      "npm run ops:run-maintenance-mode-execution -- --write",
    );
  }

  return {
    version: "continuous-improvement-loop-execution-v1",
    policyId: CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    productEvolutionExecutionMilestone: productEvolutionExecution.milestone,
    goDecision: input.goNoGo?.decision ?? evaluation.goDecision,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
    pureOperationalMode: evaluation.pureOperationalMode,
    sustainedOpsComplete: evaluation.sustainedOpsComplete,
    tracksHealthy,
    overdueCount,
    improvementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    pureOperationalModeEra25Active: era25.pureOperationalModeEra25Active,
    maintenanceModeActive: maintenanceMode.maintenanceModeActive,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    p0ProofStatus: artifacts.p0Staging?.p0ProofStatus ?? null,
    tier2ProofStatus: artifacts.tier2Summary?.tier2ProofStatus ?? null,
    tracks,
    gates,
    nextAttentionTrack,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/today",
      "/dashboard/order-hub",
      "/dashboard/production-calendar",
      "/dashboard/integration-health",
      "/dashboard/reports",
      "/platform/commercial-pilot-ops",
    ],
    honestyNote:
      "PASS > SKIPPED — daily shift ops requires real operator usage. Per-pilot GO isolation mandatory. Release cadence attestation only after honest loop start. ICP = all F&B formats.",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function formatContinuousImprovementLoopExecutionLines(
  summary: ContinuousImprovementLoopExecutionSummary,
): string[] {
  return [
    `Continuous improvement loop execution: ${summary.milestone}`,
    `Product evolution: ${summary.productEvolutionExecutionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Tracks: ${summary.tracksHealthy ? "healthy" : `${summary.overdueCount} overdue`}`,
    `Pure ops: ${summary.pureOperationalMode ? "active" : "blocked"} · era25 ${summary.pureOperationalModeEra25Active ? "active" : "pending"} · integrity ${summary.improvementLoopIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextAttentionTrack
      ? `Next track: ${summary.nextAttentionTrack.label} — ${summary.nextAttentionTrack.detail}`
      : "All measurable tracks fresh or blocked on product evolution",
  ];
}
