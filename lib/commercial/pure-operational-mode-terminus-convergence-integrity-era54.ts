/**
 * Pure operational mode terminus convergence era25 integrity — blocks terminus attestation without honest sustained ops.
 * Policy: era54-pure-operational-mode-terminus-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolvePureOperationalModeTerminusEra25MilestoneFromEnv,
  resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  evaluateSustainedOperationalExcellenceConvergenceIntegrity,
  type SustainedOperationalExcellenceConvergenceIntegrityBaseline,
} from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";
import { detectPureOperationalModeTerminusConvergenceEra25Started } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
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
import type { SeriesAPartnerExpansionConvergenceIntegrityBaseline } from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";
import type { MarketLeaderPositioningConvergenceIntegrityBaseline } from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";

export const PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID =
  "era54-pure-operational-mode-terminus-convergence-integrity-v1" as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/pure-operational-mode-terminus-convergence-integrity-baseline.json" as const;

export type PureOperationalModeTerminusConvergenceIntegrityViolationId =
  | "sustained_operational_excellence_convergence_prerequisite_not_complete"
  | "sustained_operational_excellence_convergence_integrity_fail"
  | "market_leader_positioning_convergence_integrity_fail"
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
  | "pure_ops_started_without_sustained_ops_convergence_ready"
  | "fake_pure_ops_convergence_attestation"
  | "fake_pure_ops_convergence_report_attestation"
  | "baseline_regression";

export type PureOperationalModeTerminusConvergenceIntegrityViolation = {
  id: PureOperationalModeTerminusConvergenceIntegrityViolationId;
  detail: string;
};

export type PureOperationalModeTerminusConvergenceIntegrityBaseline = {
  pureOperationalModeTerminusConvergenceExecutionHonest: true;
  recordedAt: string;
  sustainedOperationalExcellenceConvergenceReadyAttested: true;
  goDecision: "GO";
};

export type PureOperationalModeTerminusConvergenceIntegritySummary = {
  policyId: typeof PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID;
  integrityPassed: boolean;
  pureOperationalModeTerminusConvergenceExecutionStarted: boolean;
  pureOperationalModeTerminusConvergenceComplete: boolean;
  sustainedOperationalExcellenceConvergenceActive: boolean;
  sustainedOperationalExcellenceConvergenceIntegrityPassed: boolean;
  marketLeaderPositioningConvergenceIntegrityPassed: boolean;
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
  violations: readonly PureOperationalModeTerminusConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly PureOperationalModeTerminusConvergenceIntegrityViolationId[] =
  [
    "sustained_operational_excellence_convergence_prerequisite_not_complete",
    "sustained_operational_excellence_convergence_integrity_fail",
    "market_leader_positioning_convergence_integrity_fail",
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
    "pure_ops_started_without_sustained_ops_convergence_ready",
    "fake_pure_ops_convergence_attestation",
    "fake_pure_ops_convergence_report_attestation",
    "baseline_regression",
  ];

function readIntegrityBaseline(
  root: string,
): PureOperationalModeTerminusConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as PureOperationalModeTerminusConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamSustainedOpsIntegrityViolations(
  violations: PureOperationalModeTerminusConvergenceIntegrityViolation[],
  sustainedOpsIntegrity: ReturnType<typeof evaluateSustainedOperationalExcellenceConvergenceIntegrity>,
): void {
  if (!sustainedOpsIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase X before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase Y before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase Z before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase AA before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase AB before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.engineeringPathTerminusIntegrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.postTerminusSteadyStateIntegrityPassed) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.linearPathPermanentlyClosedIntegrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.linearChainTerminusGuardIntegrityPassed) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before pure operational mode terminus attestation.",
    });
  }
  if (!sustainedOpsIntegrity.era25FirstProductSliceBlueprintIntegrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before pure operational mode terminus.",
    });
  }
  if (!sustainedOpsIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before pure operational mode terminus.",
    });
  }
  if (!sustainedOpsIntegrity.paidPilotGoConvergenceIntegrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before pure operational mode terminus.",
    });
  }
  if (!sustainedOpsIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed) {
    violations.push({
      id: "pilot_week1_execution_convergence_integrity_fail",
      detail: "Pilot week 1 execution convergence integrity FAIL — complete Phase X before pure operational mode terminus.",
    });
  }
  if (!sustainedOpsIntegrity.month2MarketReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "month2_market_readiness_convergence_integrity_fail",
      detail: "Month 2 market readiness convergence integrity FAIL — complete Phase Y before pure operational mode terminus.",
    });
  }
  if (!sustainedOpsIntegrity.scaleReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "scale_readiness_convergence_integrity_fail",
      detail: "Scale readiness convergence integrity FAIL — complete Phase Z before pure operational mode terminus.",
    });
  }
  if (!sustainedOpsIntegrity.seriesAPartnerExpansionConvergenceIntegrityPassed) {
    violations.push({
      id: "series_a_partner_expansion_convergence_integrity_fail",
      detail: "Series A partner expansion convergence integrity FAIL — complete Phase AA before pure operational mode terminus.",
    });
  }
  if (!sustainedOpsIntegrity.marketLeaderPositioningConvergenceIntegrityPassed) {
    violations.push({
      id: "market_leader_positioning_convergence_integrity_fail",
      detail: "Market leader positioning convergence integrity FAIL — complete Phase AB before pure operational mode terminus.",
    });
  }
}

export function evaluatePureOperationalModeTerminusConvergenceIntegrity(
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
    marketLeaderPositioningConvergenceIntegrityBaselineOverride?: MarketLeaderPositioningConvergenceIntegrityBaseline | null;
    sustainedOperationalExcellenceConvergenceIntegrityBaselineOverride?: SustainedOperationalExcellenceConvergenceIntegrityBaseline | null;
    baselineOverride?: PureOperationalModeTerminusConvergenceIntegrityBaseline | null;
  },
): PureOperationalModeTerminusConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const sustainedOpsIntegrity = evaluateSustainedOperationalExcellenceConvergenceIntegrity(root, {
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
    seriesAPartnerExpansionConvergenceIntegrityBaselineOverride:
      options?.seriesAPartnerExpansionConvergenceIntegrityBaselineOverride,
    marketLeaderPositioningConvergenceIntegrityBaselineOverride:
      options?.marketLeaderPositioningConvergenceIntegrityBaselineOverride,
    baselineOverride: options?.sustainedOperationalExcellenceConvergenceIntegrityBaselineOverride,
  });

  const sustainedOpsMilestone = resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv(env);
  const pureOpsMilestone = resolvePureOperationalModeTerminusEra25MilestoneFromEnv(env);
  const sustainedOpsReadyHonest =
    sustainedOpsMilestone === "sustained_operational_excellence_convergence_era25_ready";
  const pureOpsActiveHonest = pureOpsMilestone === "pure_operational_mode_era25_active";

  const goDecision = sustainedOpsIntegrity.goDecision;
  const goHonest = goDecision === "GO" && sustainedOpsIntegrity.goIntegrityPassed;
  const pureOperationalModeTerminusConvergenceExecutionStarted =
    detectPureOperationalModeTerminusConvergenceEra25Started(env);
  const pureOpsAttested = parseEnvBoolean(env.PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_REVIEWED);
  const pureOperationalModeTerminusConvergenceHonest =
    sustainedOpsReadyHonest && sustainedOpsIntegrity.integrityPassed;

  const violations: PureOperationalModeTerminusConvergenceIntegrityViolation[] = [];

  if (pureOperationalModeTerminusConvergenceExecutionStarted) {
    pushUpstreamSustainedOpsIntegrityViolations(violations, sustainedOpsIntegrity);
  }

  if (pureOperationalModeTerminusConvergenceExecutionStarted && !sustainedOpsIntegrity.integrityPassed) {
    violations.push({
      id: "sustained_operational_excellence_convergence_integrity_fail",
      detail: "Sustained operational excellence convergence integrity FAIL — complete Phase AC before pure operational mode terminus.",
    });
  }

  if (
    pureOperationalModeTerminusConvergenceExecutionStarted &&
    !pureOperationalModeTerminusConvergenceHonest
  ) {
    violations.push({
      id: "pure_ops_started_without_sustained_ops_convergence_ready",
      detail: sustainedOpsReadyHonest
        ? "PURE_OPERATIONAL_MODE_TERMINUS_ERA25_* env present but sustained ops convergence integrity FAIL — fix Phase AC first."
        : "PURE_OPERATIONAL_MODE_TERMINUS_ERA25_* env present but sustained_operational_excellence_convergence_era25_ready is not achieved — finish sustained ops convergence orchestration first.",
    });
  }

  if (pureOperationalModeTerminusConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "sustained_operational_excellence_convergence_prerequisite_not_complete",
      detail: `Pure ops terminus started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    pureOpsAttested &&
    pureOperationalModeTerminusConvergenceExecutionStarted &&
    (!pureOperationalModeTerminusConvergenceHonest || !sustainedOpsIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_pure_ops_convergence_attestation",
      detail:
        "PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ATTESTED=1 before honest sustained ops convergence ready — never attest pure ops without ops:validate-sustained-operational-excellence-convergence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    pureOperationalModeTerminusConvergenceExecutionStarted &&
    (!pureOpsActiveHonest || !sustainedOpsIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_pure_ops_convergence_report_attestation",
      detail:
        "PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_REVIEWED=1 before pure ops integrity PASS — never attest pure ops report without ops:validate-pure-operational-mode-terminus-convergence-integrity PASS.",
    });
  }

  if (
    baseline?.pureOperationalModeTerminusConvergenceExecutionHonest &&
    (!goHonest || !pureOpsActiveHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest pure ops terminus at ${baseline.recordedAt} but GO/pure operational mode active is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID,
    integrityPassed,
    pureOperationalModeTerminusConvergenceExecutionStarted,
    pureOperationalModeTerminusConvergenceComplete:
      pureOpsActiveHonest && sustainedOpsIntegrity.integrityPassed,
    sustainedOperationalExcellenceConvergenceActive: sustainedOpsReadyHonest,
    sustainedOperationalExcellenceConvergenceIntegrityPassed: sustainedOpsIntegrity.integrityPassed,
    marketLeaderPositioningConvergenceIntegrityPassed:
      sustainedOpsIntegrity.marketLeaderPositioningConvergenceIntegrityPassed,
    seriesAPartnerExpansionConvergenceIntegrityPassed:
      sustainedOpsIntegrity.seriesAPartnerExpansionConvergenceIntegrityPassed,
    scaleReadinessConvergenceIntegrityPassed:
      sustainedOpsIntegrity.scaleReadinessConvergenceIntegrityPassed,
    month2MarketReadinessConvergenceIntegrityPassed:
      sustainedOpsIntegrity.month2MarketReadinessConvergenceIntegrityPassed,
    pilotWeek1ExecutionConvergenceIntegrityPassed:
      sustainedOpsIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed,
    paidPilotGoConvergenceIntegrityPassed: sustainedOpsIntegrity.paidPilotGoConvergenceIntegrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      sustainedOpsIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      sustainedOpsIntegrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: sustainedOpsIntegrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: sustainedOpsIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: sustainedOpsIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: sustainedOpsIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      sustainedOpsIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      sustainedOpsIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: sustainedOpsIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: sustainedOpsIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: sustainedOpsIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: sustainedOpsIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: sustainedOpsIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: sustainedOpsIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: sustainedOpsIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: sustainedOpsIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: sustainedOpsIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: sustainedOpsIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: sustainedOpsIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: sustainedOpsIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-pure-operational-mode-terminus-convergence-integrity -- --json",
      "npm run ops:validate-sustained-operational-excellence-convergence-integrity -- --json",
      "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
      "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
      "npm run ops:run-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25 -- --write",
      "npm run ops:sync-pure-operational-mode-terminus-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
