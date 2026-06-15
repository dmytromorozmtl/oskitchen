/**
 * Scale readiness convergence era25 integrity — blocks scale attestation without honest month 2.
 * Policy: era50-scale-readiness-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolveMonth2MarketReadinessConvergenceEra25MilestoneFromEnv,
  resolveScaleReadinessConvergenceEra25MilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  evaluateMonth2MarketReadinessConvergenceIntegrity,
  type Month2MarketReadinessConvergenceIntegrityBaseline,
} from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";
import { detectScaleReadinessConvergenceEra25Started } from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { MaintenanceModeIntegrityBaseline } from "@/lib/commercial/maintenance-mode-integrity-era36";
import type { EngineeringPathTerminusIntegrityBaseline } from "@/lib/commercial/engineering-path-terminus-integrity-era37";
import type { PostTerminusSteadyStateIntegrityBaseline } from "@/lib/commercial/post-terminus-steady-state-integrity-era38";
import type { CommercialPilotPathAbsoluteEndIntegrityBaseline } from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";
import type { LinearPathPermanentlyClosedIntegrityBaseline } from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";
import type { LinearChainTerminusGuardIntegrityBaseline } from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";
import type { Era25CharterExitOutsideLinearPathIntegrityBaseline } from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";
import type { Era25FirstCharterSliceReadinessIntegrityBaseline } from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";
import type { Era25EngineeringGatesIntegrityBaseline } from "@/lib/commercial/era25-engineering-gates-integrity-era44";
import type { Era25FirstProductSliceBlueprintIntegrityBaseline } from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";
import type { OwnerDailyBriefingBreakthroughIntegrityBaseline } from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";
import type { PaidPilotGoConvergenceIntegrityBaseline } from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";
import type { PilotWeek1ExecutionConvergenceIntegrityBaseline } from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";

export const SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID =
  "era50-scale-readiness-convergence-integrity-v1" as const;

export const SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/scale-readiness-convergence-integrity-baseline.json" as const;

export type ScaleReadinessConvergenceIntegrityViolationId =
  | "month2_market_readiness_convergence_prerequisite_not_complete"
  | "month2_market_readiness_convergence_integrity_fail"
  | "pilot_week1_execution_convergence_integrity_fail"
  | "paid_pilot_go_convergence_integrity_fail"
  | "owner_daily_briefing_breakthrough_integrity_fail"
  | "era25_first_product_slice_blueprint_integrity_fail"
  | "era25_engineering_gates_integrity_fail"
  | "era25_first_charter_slice_integrity_fail"
  | "era25_charter_exit_integrity_fail"
  | "linear_chain_terminus_guard_integrity_fail"
  | "linear_path_permanently_closed_integrity_fail"
  | "commercial_pilot_path_absolute_end_integrity_fail"
  | "post_terminus_steady_state_integrity_fail"
  | "engineering_path_terminus_integrity_fail"
  | "maintenance_mode_integrity_fail"
  | "product_evolution_integrity_fail"
  | "improvement_loop_integrity_fail"
  | "sustained_ops_integrity_fail"
  | "market_leader_integrity_fail"
  | "series_a_integrity_fail"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "scale_started_without_month2_convergence_ready"
  | "fake_scale_convergence_attestation"
  | "fake_scale_convergence_report_attestation"
  | "baseline_regression";

export type ScaleReadinessConvergenceIntegrityViolation = {
  id: ScaleReadinessConvergenceIntegrityViolationId;
  detail: string;
};

export type ScaleReadinessConvergenceIntegrityBaseline = {
  scaleReadinessConvergenceExecutionHonest: true;
  recordedAt: string;
  month2MarketReadinessConvergenceReadyAttested: true;
  goDecision: "GO";
};

export type ScaleReadinessConvergenceIntegritySummary = {
  policyId: typeof SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID;
  integrityPassed: boolean;
  scaleReadinessConvergenceExecutionStarted: boolean;
  scaleReadinessConvergenceComplete: boolean;
  month2MarketReadinessConvergenceActive: boolean;
  month2MarketReadinessConvergenceIntegrityPassed: boolean;
  pilotWeek1ExecutionConvergenceIntegrityPassed: boolean;
  paidPilotGoConvergenceIntegrityPassed: boolean;
  ownerDailyBriefingBreakthroughIntegrityPassed: boolean;
  era25FirstProductSliceBlueprintIntegrityPassed: boolean;
  era25EngineeringGatesIntegrityPassed: boolean;
  era25FirstCharterSliceIntegrityPassed: boolean;
  era25CharterExitIntegrityPassed: boolean;
  linearChainTerminusGuardIntegrityPassed: boolean;
  linearPathPermanentlyClosedIntegrityPassed: boolean;
  commercialPilotPathAbsoluteEndIntegrityPassed: boolean;
  postTerminusSteadyStateIntegrityPassed: boolean;
  engineeringPathTerminusIntegrityPassed: boolean;
  maintenanceModeIntegrityPassed: boolean;
  productEvolutionIntegrityPassed: boolean;
  improvementLoopIntegrityPassed: boolean;
  sustainedOpsIntegrityPassed: boolean;
  marketLeaderIntegrityPassed: boolean;
  seriesAIntegrityPassed: boolean;
  scaleIntegrityPassed: boolean;
  month2IntegrityPassed: boolean;
  week1IntegrityPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly ScaleReadinessConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly ScaleReadinessConvergenceIntegrityViolationId[] = [
  "month2_market_readiness_convergence_prerequisite_not_complete",
  "month2_market_readiness_convergence_integrity_fail",
  "pilot_week1_execution_convergence_integrity_fail",
  "paid_pilot_go_convergence_integrity_fail",
  "owner_daily_briefing_breakthrough_integrity_fail",
  "era25_first_product_slice_blueprint_integrity_fail",
  "era25_engineering_gates_integrity_fail",
  "era25_first_charter_slice_integrity_fail",
  "era25_charter_exit_integrity_fail",
  "linear_chain_terminus_guard_integrity_fail",
  "linear_path_permanently_closed_integrity_fail",
  "commercial_pilot_path_absolute_end_integrity_fail",
  "post_terminus_steady_state_integrity_fail",
  "engineering_path_terminus_integrity_fail",
  "maintenance_mode_integrity_fail",
  "product_evolution_integrity_fail",
  "improvement_loop_integrity_fail",
  "sustained_ops_integrity_fail",
  "market_leader_integrity_fail",
  "series_a_integrity_fail",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "scale_started_without_month2_convergence_ready",
  "fake_scale_convergence_attestation",
  "fake_scale_convergence_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(root: string): ScaleReadinessConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as ScaleReadinessConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamMonth2IntegrityViolations(
  violations: ScaleReadinessConvergenceIntegrityViolation[],
  month2Integrity: ReturnType<typeof evaluateMonth2MarketReadinessConvergenceIntegrity>,
): void {
  if (!month2Integrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before scale convergence attestation.",
    });
  }
  if (!month2Integrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before scale convergence attestation.",
    });
  }
  if (!month2Integrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before scale convergence attestation.",
    });
  }
  if (!month2Integrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before scale convergence attestation.",
    });
  }
  if (!month2Integrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before scale convergence attestation.",
    });
  }
  if (!month2Integrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before scale convergence attestation.",
    });
  }
  if (!month2Integrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before scale convergence attestation.",
    });
  }
  if (!month2Integrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before scale convergence attestation.",
    });
  }
  if (!month2Integrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before scale convergence attestation.",
    });
  }
  if (!month2Integrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before scale convergence attestation.",
    });
  }
  if (!month2Integrity.engineeringPathTerminusIntegrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before scale convergence attestation.",
    });
  }
  if (!month2Integrity.postTerminusSteadyStateIntegrityPassed) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before scale convergence attestation.",
    });
  }
  if (!month2Integrity.commercialPilotPathAbsoluteEndIntegrityPassed) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before scale convergence attestation.",
    });
  }
  if (!month2Integrity.linearPathPermanentlyClosedIntegrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before scale convergence attestation.",
    });
  }
  if (!month2Integrity.linearChainTerminusGuardIntegrityPassed) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before scale convergence attestation.",
    });
  }
  if (!month2Integrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before scale convergence attestation.",
    });
  }
  if (!month2Integrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before scale convergence attestation.",
    });
  }
  if (!month2Integrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before scale convergence attestation.",
    });
  }
  if (!month2Integrity.era25FirstProductSliceBlueprintIntegrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before scale convergence.",
    });
  }
  if (!month2Integrity.ownerDailyBriefingBreakthroughIntegrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before scale convergence.",
    });
  }
  if (!month2Integrity.paidPilotGoConvergenceIntegrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before scale readiness convergence.",
    });
  }
  if (!month2Integrity.pilotWeek1ExecutionConvergenceIntegrityPassed) {
    violations.push({
      id: "pilot_week1_execution_convergence_integrity_fail",
      detail: "Pilot week 1 execution convergence integrity FAIL — complete Phase X before scale readiness convergence.",
    });
  }
}

export function evaluateScaleReadinessConvergenceIntegrity(
  root: string = process.cwd(),
  options?: {
    env?: NodeJS.ProcessEnv;
    goNoGoOverride?: PilotGoNoGoSummary | null;
    p0StagingOverride?: P0StagingProofUnblockSummary | null;
    tier2SummaryOverride?: Tier2StagingGoldenPathSummary | null;
    metricsBaselineOverride?: PilotMetricsBaselineSummary | null;
    caseStudyDraftOverride?: PilotCaseStudyDraftSummary | null;
    investorOnepagerOverride?: InvestorNarrativeOnepagerSummary | null;
    rollbackDrillOverride?: PilotRollbackDrillSummary | null;
    competitorMatrixOverride?: CompetitorFeatureGapMatrixSummary | null;
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    maintenanceModeIntegrityBaselineOverride?: MaintenanceModeIntegrityBaseline | null;
    engineeringPathTerminusIntegrityBaselineOverride?: EngineeringPathTerminusIntegrityBaseline | null;
    postTerminusSteadyStateIntegrityBaselineOverride?: PostTerminusSteadyStateIntegrityBaseline | null;
    commercialPilotPathAbsoluteEndIntegrityBaselineOverride?: CommercialPilotPathAbsoluteEndIntegrityBaseline | null;
    linearPathPermanentlyClosedIntegrityBaselineOverride?: LinearPathPermanentlyClosedIntegrityBaseline | null;
    linearChainTerminusGuardIntegrityBaselineOverride?: LinearChainTerminusGuardIntegrityBaseline | null;
    era25CharterExitIntegrityBaselineOverride?: Era25CharterExitOutsideLinearPathIntegrityBaseline | null;
    era25FirstCharterSliceIntegrityBaselineOverride?: Era25FirstCharterSliceReadinessIntegrityBaseline | null;
    era25EngineeringGatesIntegrityBaselineOverride?: Era25EngineeringGatesIntegrityBaseline | null;
    era25FirstProductSliceBlueprintIntegrityBaselineOverride?: Era25FirstProductSliceBlueprintIntegrityBaseline | null;
    ownerDailyBriefingBreakthroughIntegrityBaselineOverride?: OwnerDailyBriefingBreakthroughIntegrityBaseline | null;
    paidPilotGoConvergenceIntegrityBaselineOverride?: PaidPilotGoConvergenceIntegrityBaseline | null;
    pilotWeek1ExecutionConvergenceIntegrityBaselineOverride?: PilotWeek1ExecutionConvergenceIntegrityBaseline | null;
    month2MarketReadinessConvergenceIntegrityBaselineOverride?: Month2MarketReadinessConvergenceIntegrityBaseline | null;
    baselineOverride?: ScaleReadinessConvergenceIntegrityBaseline | null;
  },
): ScaleReadinessConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const month2Integrity = evaluateMonth2MarketReadinessConvergenceIntegrity(root, {
    env,
    goNoGoOverride: options?.goNoGoOverride,
    p0StagingOverride: options?.p0StagingOverride,
    tier2SummaryOverride: options?.tier2SummaryOverride,
    metricsBaselineOverride: options?.metricsBaselineOverride,
    caseStudyDraftOverride: options?.caseStudyDraftOverride,
    investorOnepagerOverride: options?.investorOnepagerOverride,
    rollbackDrillOverride: options?.rollbackDrillOverride,
    competitorMatrixOverride: options?.competitorMatrixOverride,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
    maintenanceModeIntegrityBaselineOverride: options?.maintenanceModeIntegrityBaselineOverride,
    engineeringPathTerminusIntegrityBaselineOverride:
      options?.engineeringPathTerminusIntegrityBaselineOverride,
    postTerminusSteadyStateIntegrityBaselineOverride:
      options?.postTerminusSteadyStateIntegrityBaselineOverride,
    commercialPilotPathAbsoluteEndIntegrityBaselineOverride:
      options?.commercialPilotPathAbsoluteEndIntegrityBaselineOverride,
    linearPathPermanentlyClosedIntegrityBaselineOverride:
      options?.linearPathPermanentlyClosedIntegrityBaselineOverride,
    linearChainTerminusGuardIntegrityBaselineOverride:
      options?.linearChainTerminusGuardIntegrityBaselineOverride,
    era25CharterExitIntegrityBaselineOverride: options?.era25CharterExitIntegrityBaselineOverride,
    era25FirstCharterSliceIntegrityBaselineOverride:
      options?.era25FirstCharterSliceIntegrityBaselineOverride,
    era25EngineeringGatesIntegrityBaselineOverride:
      options?.era25EngineeringGatesIntegrityBaselineOverride,
    era25FirstProductSliceBlueprintIntegrityBaselineOverride:
      options?.era25FirstProductSliceBlueprintIntegrityBaselineOverride,
    ownerDailyBriefingBreakthroughIntegrityBaselineOverride:
      options?.ownerDailyBriefingBreakthroughIntegrityBaselineOverride,
    paidPilotGoConvergenceIntegrityBaselineOverride:
      options?.paidPilotGoConvergenceIntegrityBaselineOverride,
    pilotWeek1ExecutionConvergenceIntegrityBaselineOverride:
      options?.pilotWeek1ExecutionConvergenceIntegrityBaselineOverride,
    baselineOverride: options?.month2MarketReadinessConvergenceIntegrityBaselineOverride,
  });

  const month2Milestone = resolveMonth2MarketReadinessConvergenceEra25MilestoneFromEnv(env);
  const scaleMilestone = resolveScaleReadinessConvergenceEra25MilestoneFromEnv(env);
  const month2ReadyHonest =
    month2Milestone === "month2_market_readiness_convergence_era25_ready";
  const scaleReadyHonest = scaleMilestone === "scale_readiness_convergence_era25_ready";

  const goDecision = month2Integrity.goDecision;
  const goHonest = goDecision === "GO" && month2Integrity.goIntegrityPassed;
  const scaleReadinessConvergenceExecutionStarted = detectScaleReadinessConvergenceEra25Started(env);
  const scaleAttested = parseEnvBoolean(env.SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.SCALE_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED);
  const scaleReadinessConvergenceHonest = month2ReadyHonest && month2Integrity.integrityPassed;

  const violations: ScaleReadinessConvergenceIntegrityViolation[] = [];

  if (scaleReadinessConvergenceExecutionStarted) {
    pushUpstreamMonth2IntegrityViolations(violations, month2Integrity);
  }

  if (scaleReadinessConvergenceExecutionStarted && !month2Integrity.integrityPassed) {
    violations.push({
      id: "month2_market_readiness_convergence_integrity_fail",
      detail: "Month 2 market readiness convergence integrity FAIL — complete Phase Y before scale readiness convergence.",
    });
  }

  if (scaleReadinessConvergenceExecutionStarted && !scaleReadinessConvergenceHonest) {
    violations.push({
      id: "scale_started_without_month2_convergence_ready",
      detail: month2ReadyHonest
        ? "SCALE_READINESS_CONVERGENCE_ERA25_* env present but month 2 convergence integrity FAIL — fix Phase Y first."
        : "SCALE_READINESS_CONVERGENCE_ERA25_* env present but month2_market_readiness_convergence_era25_ready is not achieved — finish month 2 convergence orchestration first.",
    });
  }

  if (scaleReadinessConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "month2_market_readiness_convergence_prerequisite_not_complete",
      detail: `Scale convergence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    scaleAttested &&
    scaleReadinessConvergenceExecutionStarted &&
    (!scaleReadinessConvergenceHonest || !month2Integrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_scale_convergence_attestation",
      detail:
        "SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED=1 before honest month 2 convergence ready — never attest scale without ops:validate-month2-market-readiness-convergence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    scaleReadinessConvergenceExecutionStarted &&
    (!scaleReadyHonest || !month2Integrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_scale_convergence_report_attestation",
      detail:
        "SCALE_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED=1 before scale integrity PASS — never attest scale report without ops:validate-scale-readiness-convergence-integrity PASS.",
    });
  }

  if (baseline?.scaleReadinessConvergenceExecutionHonest && (!goHonest || !scaleReadyHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest scale convergence at ${baseline.recordedAt} but GO/scale ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID,
    integrityPassed,
    scaleReadinessConvergenceExecutionStarted,
    scaleReadinessConvergenceComplete: scaleReadyHonest && month2Integrity.integrityPassed,
    month2MarketReadinessConvergenceActive: month2ReadyHonest,
    month2MarketReadinessConvergenceIntegrityPassed: month2Integrity.integrityPassed,
    pilotWeek1ExecutionConvergenceIntegrityPassed:
      month2Integrity.pilotWeek1ExecutionConvergenceIntegrityPassed,
    paidPilotGoConvergenceIntegrityPassed: month2Integrity.paidPilotGoConvergenceIntegrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      month2Integrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      month2Integrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: month2Integrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: month2Integrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: month2Integrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: month2Integrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      month2Integrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      month2Integrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: month2Integrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: month2Integrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: month2Integrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: month2Integrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: month2Integrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: month2Integrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: month2Integrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: month2Integrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: month2Integrity.scaleIntegrityPassed,
    month2IntegrityPassed: month2Integrity.month2IntegrityPassed,
    week1IntegrityPassed: month2Integrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: month2Integrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-scale-readiness-convergence-integrity -- --json",
      "npm run ops:validate-month2-market-readiness-convergence-integrity -- --json",
      "npm run ops:validate-scale-readiness-convergence-era25 -- --json",
      "npm run ops:validate-month2-market-readiness-convergence-era25 -- --json",
      "npm run ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25 -- --write",
      "npm run ops:sync-scale-readiness-convergence-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
