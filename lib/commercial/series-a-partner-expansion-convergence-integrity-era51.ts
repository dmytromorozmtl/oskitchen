/**
 * Series A partner expansion convergence era25 integrity — blocks Series A attestation without honest scale.
 * Policy: era51-series-a-partner-expansion-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolveScaleReadinessConvergenceEra25MilestoneFromEnv,
  resolveSeriesAPartnerExpansionConvergenceEra25MilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  evaluateScaleReadinessConvergenceIntegrity,
  type ScaleReadinessConvergenceIntegrityBaseline,
} from "@/lib/commercial/scale-readiness-convergence-integrity-era50";
import { detectSeriesAPartnerExpansionConvergenceEra25Started } from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
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
import type { Month2MarketReadinessConvergenceIntegrityBaseline } from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID =
  "era51-series-a-partner-expansion-convergence-integrity-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/series-a-partner-expansion-convergence-integrity-baseline.json" as const;

export type SeriesAPartnerExpansionConvergenceIntegrityViolationId =
  | "scale_readiness_convergence_prerequisite_not_complete"
  | "scale_readiness_convergence_integrity_fail"
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
  | "series_a_started_without_scale_convergence_ready"
  | "fake_series_a_convergence_attestation"
  | "fake_series_a_convergence_report_attestation"
  | "baseline_regression";

export type SeriesAPartnerExpansionConvergenceIntegrityViolation = {
  id: SeriesAPartnerExpansionConvergenceIntegrityViolationId;
  detail: string;
};

export type SeriesAPartnerExpansionConvergenceIntegrityBaseline = {
  seriesAPartnerExpansionConvergenceExecutionHonest: true;
  recordedAt: string;
  scaleReadinessConvergenceReadyAttested: true;
  goDecision: "GO";
};

export type SeriesAPartnerExpansionConvergenceIntegritySummary = {
  policyId: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID;
  integrityPassed: boolean;
  seriesAPartnerExpansionConvergenceExecutionStarted: boolean;
  seriesAPartnerExpansionConvergenceComplete: boolean;
  scaleReadinessConvergenceActive: boolean;
  scaleReadinessConvergenceIntegrityPassed: boolean;
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
  violations: readonly SeriesAPartnerExpansionConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly SeriesAPartnerExpansionConvergenceIntegrityViolationId[] = [
  "scale_readiness_convergence_prerequisite_not_complete",
  "scale_readiness_convergence_integrity_fail",
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
  "series_a_started_without_scale_convergence_ready",
  "fake_series_a_convergence_attestation",
  "fake_series_a_convergence_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): SeriesAPartnerExpansionConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as SeriesAPartnerExpansionConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamScaleIntegrityViolations(
  violations: SeriesAPartnerExpansionConvergenceIntegrityViolation[],
  scaleIntegrity: ReturnType<typeof evaluateScaleReadinessConvergenceIntegrity>,
): void {
  if (!scaleIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.engineeringPathTerminusIntegrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.postTerminusSteadyStateIntegrityPassed) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.linearPathPermanentlyClosedIntegrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.linearChainTerminusGuardIntegrityPassed) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before Series A convergence attestation.",
    });
  }
  if (!scaleIntegrity.era25FirstProductSliceBlueprintIntegrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before Series A convergence.",
    });
  }
  if (!scaleIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before Series A convergence.",
    });
  }
  if (!scaleIntegrity.paidPilotGoConvergenceIntegrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before Series A partner expansion convergence.",
    });
  }
  if (!scaleIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed) {
    violations.push({
      id: "pilot_week1_execution_convergence_integrity_fail",
      detail: "Pilot week 1 execution convergence integrity FAIL — complete Phase X before Series A partner expansion convergence.",
    });
  }
  if (!scaleIntegrity.month2MarketReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "month2_market_readiness_convergence_integrity_fail",
      detail: "Month 2 market readiness convergence integrity FAIL — complete Phase Y before Series A partner expansion convergence.",
    });
  }
}

export function evaluateSeriesAPartnerExpansionConvergenceIntegrity(
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
    scaleReadinessConvergenceIntegrityBaselineOverride?: ScaleReadinessConvergenceIntegrityBaseline | null;
    baselineOverride?: SeriesAPartnerExpansionConvergenceIntegrityBaseline | null;
  },
): SeriesAPartnerExpansionConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const scaleIntegrity = evaluateScaleReadinessConvergenceIntegrity(root, {
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
    month2MarketReadinessConvergenceIntegrityBaselineOverride:
      options?.month2MarketReadinessConvergenceIntegrityBaselineOverride,
    baselineOverride: options?.scaleReadinessConvergenceIntegrityBaselineOverride,
  });

  const scaleMilestone = resolveScaleReadinessConvergenceEra25MilestoneFromEnv(env);
  const seriesAMilestone = resolveSeriesAPartnerExpansionConvergenceEra25MilestoneFromEnv(env);
  const scaleReadyHonest = scaleMilestone === "scale_readiness_convergence_era25_ready";
  const seriesAReadyHonest =
    seriesAMilestone === "series_a_partner_expansion_convergence_era25_ready";

  const goDecision = scaleIntegrity.goDecision;
  const goHonest = goDecision === "GO" && scaleIntegrity.goIntegrityPassed;
  const seriesAPartnerExpansionConvergenceExecutionStarted =
    detectSeriesAPartnerExpansionConvergenceEra25Started(env);
  const seriesAAttested = parseEnvBoolean(env.SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(
    env.SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_REVIEWED,
  );
  const seriesAPartnerExpansionConvergenceHonest =
    scaleReadyHonest && scaleIntegrity.integrityPassed;

  const violations: SeriesAPartnerExpansionConvergenceIntegrityViolation[] = [];

  if (seriesAPartnerExpansionConvergenceExecutionStarted) {
    pushUpstreamScaleIntegrityViolations(violations, scaleIntegrity);
  }

  if (seriesAPartnerExpansionConvergenceExecutionStarted && !scaleIntegrity.integrityPassed) {
    violations.push({
      id: "scale_readiness_convergence_integrity_fail",
      detail: "Scale readiness convergence integrity FAIL — complete Phase Z before Series A partner expansion convergence.",
    });
  }

  if (seriesAPartnerExpansionConvergenceExecutionStarted && !seriesAPartnerExpansionConvergenceHonest) {
    violations.push({
      id: "series_a_started_without_scale_convergence_ready",
      detail: scaleReadyHonest
        ? "SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_* env present but scale convergence integrity FAIL — fix Phase Z first."
        : "SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_* env present but scale_readiness_convergence_era25_ready is not achieved — finish scale convergence orchestration first.",
    });
  }

  if (seriesAPartnerExpansionConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "scale_readiness_convergence_prerequisite_not_complete",
      detail: `Series A convergence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    seriesAAttested &&
    seriesAPartnerExpansionConvergenceExecutionStarted &&
    (!seriesAPartnerExpansionConvergenceHonest || !scaleIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_series_a_convergence_attestation",
      detail:
        "SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED=1 before honest scale convergence ready — never attest Series A without ops:validate-scale-readiness-convergence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    seriesAPartnerExpansionConvergenceExecutionStarted &&
    (!seriesAReadyHonest || !scaleIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_series_a_convergence_report_attestation",
      detail:
        "SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_REVIEWED=1 before Series A integrity PASS — never attest Series A report without ops:validate-series-a-partner-expansion-convergence-integrity PASS.",
    });
  }

  if (
    baseline?.seriesAPartnerExpansionConvergenceExecutionHonest &&
    (!goHonest || !seriesAReadyHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Series A convergence at ${baseline.recordedAt} but GO/Series A ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID,
    integrityPassed,
    seriesAPartnerExpansionConvergenceExecutionStarted,
    seriesAPartnerExpansionConvergenceComplete:
      seriesAReadyHonest && scaleIntegrity.integrityPassed,
    scaleReadinessConvergenceActive: scaleReadyHonest,
    scaleReadinessConvergenceIntegrityPassed: scaleIntegrity.integrityPassed,
    month2MarketReadinessConvergenceIntegrityPassed:
      scaleIntegrity.month2MarketReadinessConvergenceIntegrityPassed,
    pilotWeek1ExecutionConvergenceIntegrityPassed:
      scaleIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed,
    paidPilotGoConvergenceIntegrityPassed: scaleIntegrity.paidPilotGoConvergenceIntegrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      scaleIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      scaleIntegrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: scaleIntegrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: scaleIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: scaleIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: scaleIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      scaleIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      scaleIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: scaleIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: scaleIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: scaleIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: scaleIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: scaleIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: scaleIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: scaleIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: scaleIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: scaleIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: scaleIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: scaleIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: scaleIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json",
      "npm run ops:validate-scale-readiness-convergence-integrity -- --json",
      "npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json",
      "npm run ops:validate-scale-readiness-convergence-era25 -- --json",
      "npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --write",
      "npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
