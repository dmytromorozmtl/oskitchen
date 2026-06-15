/**
 * Market leader positioning convergence era25 integrity — blocks market leader attestation without honest Series A.
 * Policy: era52-market-leader-positioning-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolveMarketLeaderPositioningConvergenceEra25MilestoneFromEnv,
  resolveSeriesAPartnerExpansionConvergenceEra25MilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  evaluateSeriesAPartnerExpansionConvergenceIntegrity,
  type SeriesAPartnerExpansionConvergenceIntegrityBaseline,
} from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";
import { detectMarketLeaderPositioningConvergenceEra25Started } from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
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
import type { ScaleReadinessConvergenceIntegrityBaseline } from "@/lib/commercial/scale-readiness-convergence-integrity-era50";

export const MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID =
  "era52-market-leader-positioning-convergence-integrity-v1" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/market-leader-positioning-convergence-integrity-baseline.json" as const;

export type MarketLeaderPositioningConvergenceIntegrityViolationId =
  | "series_a_partner_expansion_convergence_prerequisite_not_complete"
  | "series_a_partner_expansion_convergence_integrity_fail"
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
  | "market_leader_started_without_series_a_convergence_ready"
  | "fake_market_leader_convergence_attestation"
  | "fake_market_leader_convergence_report_attestation"
  | "baseline_regression";

export type MarketLeaderPositioningConvergenceIntegrityViolation = {
  id: MarketLeaderPositioningConvergenceIntegrityViolationId;
  detail: string;
};

export type MarketLeaderPositioningConvergenceIntegrityBaseline = {
  marketLeaderPositioningConvergenceExecutionHonest: true;
  recordedAt: string;
  seriesAPartnerExpansionConvergenceReadyAttested: true;
  goDecision: "GO";
};

export type MarketLeaderPositioningConvergenceIntegritySummary = {
  policyId: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID;
  integrityPassed: boolean;
  marketLeaderPositioningConvergenceExecutionStarted: boolean;
  marketLeaderPositioningConvergenceComplete: boolean;
  seriesAPartnerExpansionConvergenceActive: boolean;
  seriesAPartnerExpansionConvergenceIntegrityPassed: boolean;
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
  violations: readonly MarketLeaderPositioningConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly MarketLeaderPositioningConvergenceIntegrityViolationId[] = [
  "series_a_partner_expansion_convergence_prerequisite_not_complete",
  "series_a_partner_expansion_convergence_integrity_fail",
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
  "market_leader_started_without_series_a_convergence_ready",
  "fake_market_leader_convergence_attestation",
  "fake_market_leader_convergence_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): MarketLeaderPositioningConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as MarketLeaderPositioningConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamSeriesAIntegrityViolations(
  violations: MarketLeaderPositioningConvergenceIntegrityViolation[],
  seriesAIntegrity: ReturnType<typeof evaluateSeriesAPartnerExpansionConvergenceIntegrity>,
): void {
  if (!seriesAIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase X before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase Y before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase Z before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.engineeringPathTerminusIntegrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.postTerminusSteadyStateIntegrityPassed) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.linearPathPermanentlyClosedIntegrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.linearChainTerminusGuardIntegrityPassed) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before market leader convergence attestation.",
    });
  }
  if (!seriesAIntegrity.era25FirstProductSliceBlueprintIntegrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before market leader convergence.",
    });
  }
  if (!seriesAIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before market leader convergence.",
    });
  }
  if (!seriesAIntegrity.paidPilotGoConvergenceIntegrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before market leader positioning convergence.",
    });
  }
  if (!seriesAIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed) {
    violations.push({
      id: "pilot_week1_execution_convergence_integrity_fail",
      detail: "Pilot week 1 execution convergence integrity FAIL — complete Phase X before market leader positioning convergence.",
    });
  }
  if (!seriesAIntegrity.month2MarketReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "month2_market_readiness_convergence_integrity_fail",
      detail: "Month 2 market readiness convergence integrity FAIL — complete Phase Y before market leader positioning convergence.",
    });
  }
  if (!seriesAIntegrity.scaleReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "scale_readiness_convergence_integrity_fail",
      detail: "Scale readiness convergence integrity FAIL — complete Phase Z before market leader positioning convergence.",
    });
  }
}

export function evaluateMarketLeaderPositioningConvergenceIntegrity(
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
    seriesAPartnerExpansionConvergenceIntegrityBaselineOverride?: SeriesAPartnerExpansionConvergenceIntegrityBaseline | null;
    baselineOverride?: MarketLeaderPositioningConvergenceIntegrityBaseline | null;
  },
): MarketLeaderPositioningConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const seriesAIntegrity = evaluateSeriesAPartnerExpansionConvergenceIntegrity(root, {
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
    scaleReadinessConvergenceIntegrityBaselineOverride:
      options?.scaleReadinessConvergenceIntegrityBaselineOverride,
    baselineOverride: options?.seriesAPartnerExpansionConvergenceIntegrityBaselineOverride,
  });

  const seriesAMilestone = resolveSeriesAPartnerExpansionConvergenceEra25MilestoneFromEnv(env);
  const marketLeaderMilestone = resolveMarketLeaderPositioningConvergenceEra25MilestoneFromEnv(env);
  const seriesAReadyHonest =
    seriesAMilestone === "series_a_partner_expansion_convergence_era25_ready";
  const marketLeaderReadyHonest =
    marketLeaderMilestone === "market_leader_positioning_convergence_era25_ready";

  const goDecision = seriesAIntegrity.goDecision;
  const goHonest = goDecision === "GO" && seriesAIntegrity.goIntegrityPassed;
  const marketLeaderPositioningConvergenceExecutionStarted =
    detectMarketLeaderPositioningConvergenceEra25Started(env);
  const marketLeaderAttested = parseEnvBoolean(
    env.MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_REVIEWED,
  );
  const marketLeaderPositioningConvergenceHonest =
    seriesAReadyHonest && seriesAIntegrity.integrityPassed;

  const violations: MarketLeaderPositioningConvergenceIntegrityViolation[] = [];

  if (marketLeaderPositioningConvergenceExecutionStarted) {
    pushUpstreamSeriesAIntegrityViolations(violations, seriesAIntegrity);
  }

  if (marketLeaderPositioningConvergenceExecutionStarted && !seriesAIntegrity.integrityPassed) {
    violations.push({
      id: "series_a_partner_expansion_convergence_integrity_fail",
      detail: "Series A partner expansion convergence integrity FAIL — complete Phase AA before market leader positioning convergence.",
    });
  }

  if (marketLeaderPositioningConvergenceExecutionStarted && !marketLeaderPositioningConvergenceHonest) {
    violations.push({
      id: "market_leader_started_without_series_a_convergence_ready",
      detail: seriesAReadyHonest
        ? "MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_* env present but Series A convergence integrity FAIL — fix Phase AA first."
        : "MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_* env present but series_a_partner_expansion_convergence_era25_ready is not achieved — finish Series A convergence orchestration first.",
    });
  }

  if (marketLeaderPositioningConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "series_a_partner_expansion_convergence_prerequisite_not_complete",
      detail: `Market leader convergence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    marketLeaderAttested &&
    marketLeaderPositioningConvergenceExecutionStarted &&
    (!marketLeaderPositioningConvergenceHonest || !seriesAIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_market_leader_convergence_attestation",
      detail:
        "MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED=1 before honest Series A convergence ready — never attest market leader without ops:validate-series-a-partner-expansion-convergence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    marketLeaderPositioningConvergenceExecutionStarted &&
    (!marketLeaderReadyHonest || !seriesAIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_market_leader_convergence_report_attestation",
      detail:
        "MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_REVIEWED=1 before market leader integrity PASS — never attest market leader report without ops:validate-market-leader-positioning-convergence-integrity PASS.",
    });
  }

  if (
    baseline?.marketLeaderPositioningConvergenceExecutionHonest &&
    (!goHonest || !marketLeaderReadyHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest market leader convergence at ${baseline.recordedAt} but GO/market leader ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID,
    integrityPassed,
    marketLeaderPositioningConvergenceExecutionStarted,
    marketLeaderPositioningConvergenceComplete:
      marketLeaderReadyHonest && seriesAIntegrity.integrityPassed,
    seriesAPartnerExpansionConvergenceActive: seriesAReadyHonest,
    seriesAPartnerExpansionConvergenceIntegrityPassed: seriesAIntegrity.integrityPassed,
    scaleReadinessConvergenceIntegrityPassed: seriesAIntegrity.scaleReadinessConvergenceIntegrityPassed,
    month2MarketReadinessConvergenceIntegrityPassed:
      seriesAIntegrity.month2MarketReadinessConvergenceIntegrityPassed,
    pilotWeek1ExecutionConvergenceIntegrityPassed:
      seriesAIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed,
    paidPilotGoConvergenceIntegrityPassed: seriesAIntegrity.paidPilotGoConvergenceIntegrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      seriesAIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      seriesAIntegrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: seriesAIntegrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: seriesAIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: seriesAIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: seriesAIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      seriesAIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      seriesAIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: seriesAIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: seriesAIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: seriesAIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: seriesAIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: seriesAIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: seriesAIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: seriesAIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: seriesAIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: seriesAIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: seriesAIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: seriesAIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: seriesAIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-market-leader-positioning-convergence-integrity -- --json",
      "npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json",
      "npm run ops:validate-market-leader-positioning-convergence-era25 -- --json",
      "npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json",
      "npm run ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25 -- --write",
      "npm run ops:sync-market-leader-positioning-convergence-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
