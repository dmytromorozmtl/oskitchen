/**
 * Sustained operational excellence convergence era25 integrity — blocks sustained ops attestation without honest market leader.
 * Policy: era53-sustained-operational-excellence-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolveMarketLeaderPositioningConvergenceEra25MilestoneFromEnv,
  resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  evaluateMarketLeaderPositioningConvergenceIntegrity,
  type MarketLeaderPositioningConvergenceIntegrityBaseline,
} from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";
import { detectSustainedOperationalExcellenceConvergenceEra25Started } from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
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

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID =
  "era53-sustained-operational-excellence-convergence-integrity-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/sustained-operational-excellence-convergence-integrity-baseline.json" as const;

export type SustainedOperationalExcellenceConvergenceIntegrityViolationId =
  | "market_leader_positioning_convergence_prerequisite_not_complete"
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
  | "sustained_ops_started_without_market_leader_convergence_ready"
  | "fake_sustained_ops_convergence_attestation"
  | "fake_sustained_ops_convergence_report_attestation"
  | "baseline_regression";

export type SustainedOperationalExcellenceConvergenceIntegrityViolation = {
  id: SustainedOperationalExcellenceConvergenceIntegrityViolationId;
  detail: string;
};

export type SustainedOperationalExcellenceConvergenceIntegrityBaseline = {
  sustainedOperationalExcellenceConvergenceExecutionHonest: true;
  recordedAt: string;
  marketLeaderPositioningConvergenceReadyAttested: true;
  goDecision: "GO";
};

export type SustainedOperationalExcellenceConvergenceIntegritySummary = {
  policyId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID;
  integrityPassed: boolean;
  sustainedOperationalExcellenceConvergenceExecutionStarted: boolean;
  sustainedOperationalExcellenceConvergenceComplete: boolean;
  marketLeaderPositioningConvergenceActive: boolean;
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
  violations: readonly SustainedOperationalExcellenceConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly SustainedOperationalExcellenceConvergenceIntegrityViolationId[] =
  [
    "market_leader_positioning_convergence_prerequisite_not_complete",
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
    "sustained_ops_started_without_market_leader_convergence_ready",
    "fake_sustained_ops_convergence_attestation",
    "fake_sustained_ops_convergence_report_attestation",
    "baseline_regression",
  ];

function readIntegrityBaseline(
  root: string,
): SustainedOperationalExcellenceConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as SustainedOperationalExcellenceConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamMarketLeaderIntegrityViolations(
  violations: SustainedOperationalExcellenceConvergenceIntegrityViolation[],
  marketLeaderIntegrity: ReturnType<typeof evaluateMarketLeaderPositioningConvergenceIntegrity>,
): void {
  if (!marketLeaderIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase X before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase Y before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase Z before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.engineeringPathTerminusIntegrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.postTerminusSteadyStateIntegrityPassed) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.linearPathPermanentlyClosedIntegrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.linearChainTerminusGuardIntegrityPassed) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before sustained ops convergence attestation.",
    });
  }
  if (!marketLeaderIntegrity.era25FirstProductSliceBlueprintIntegrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before sustained ops convergence.",
    });
  }
  if (!marketLeaderIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before sustained ops convergence.",
    });
  }
  if (!marketLeaderIntegrity.paidPilotGoConvergenceIntegrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before sustained operational excellence convergence.",
    });
  }
  if (!marketLeaderIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed) {
    violations.push({
      id: "pilot_week1_execution_convergence_integrity_fail",
      detail: "Pilot week 1 execution convergence integrity FAIL — complete Phase X before sustained operational excellence convergence.",
    });
  }
  if (!marketLeaderIntegrity.month2MarketReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "month2_market_readiness_convergence_integrity_fail",
      detail: "Month 2 market readiness convergence integrity FAIL — complete Phase Y before sustained operational excellence convergence.",
    });
  }
  if (!marketLeaderIntegrity.scaleReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "scale_readiness_convergence_integrity_fail",
      detail: "Scale readiness convergence integrity FAIL — complete Phase Z before sustained operational excellence convergence.",
    });
  }
  if (!marketLeaderIntegrity.seriesAPartnerExpansionConvergenceIntegrityPassed) {
    violations.push({
      id: "series_a_partner_expansion_convergence_integrity_fail",
      detail: "Series A partner expansion convergence integrity FAIL — complete Phase AA before sustained operational excellence convergence.",
    });
  }
  if (!marketLeaderIntegrity.marketLeaderPositioningConvergenceIntegrityPassed) {
    violations.push({
      id: "market_leader_positioning_convergence_integrity_fail",
      detail: "Market leader positioning convergence integrity FAIL — complete Phase AB before sustained operational excellence convergence.",
    });
  }
}

export function evaluateSustainedOperationalExcellenceConvergenceIntegrity(
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
    baselineOverride?: SustainedOperationalExcellenceConvergenceIntegrityBaseline | null;
  },
): SustainedOperationalExcellenceConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const marketLeaderIntegrity = evaluateMarketLeaderPositioningConvergenceIntegrity(root, {
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
    baselineOverride: options?.marketLeaderPositioningConvergenceIntegrityBaselineOverride,
  });

  const marketLeaderMilestone = resolveMarketLeaderPositioningConvergenceEra25MilestoneFromEnv(env);
  const sustainedOpsMilestone = resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv(env);
  const marketLeaderReadyHonest =
    marketLeaderMilestone === "market_leader_positioning_convergence_era25_ready";
  const sustainedOpsReadyHonest =
    sustainedOpsMilestone === "sustained_operational_excellence_convergence_era25_ready";

  const goDecision = marketLeaderIntegrity.goDecision;
  const goHonest = goDecision === "GO" && marketLeaderIntegrity.goIntegrityPassed;
  const sustainedOperationalExcellenceConvergenceExecutionStarted =
    detectSustainedOperationalExcellenceConvergenceEra25Started(env);
  const sustainedOpsAttested = parseEnvBoolean(
    env.SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_REVIEWED,
  );
  const sustainedOperationalExcellenceConvergenceHonest =
    marketLeaderReadyHonest && marketLeaderIntegrity.integrityPassed;

  const violations: SustainedOperationalExcellenceConvergenceIntegrityViolation[] = [];

  if (sustainedOperationalExcellenceConvergenceExecutionStarted) {
    pushUpstreamMarketLeaderIntegrityViolations(violations, marketLeaderIntegrity);
  }

  if (sustainedOperationalExcellenceConvergenceExecutionStarted && !marketLeaderIntegrity.integrityPassed) {
    violations.push({
      id: "market_leader_positioning_convergence_integrity_fail",
      detail: "Market leader positioning convergence integrity FAIL — complete Phase AB before sustained operational excellence convergence.",
    });
  }

  if (
    sustainedOperationalExcellenceConvergenceExecutionStarted &&
    !sustainedOperationalExcellenceConvergenceHonest
  ) {
    violations.push({
      id: "sustained_ops_started_without_market_leader_convergence_ready",
      detail: marketLeaderReadyHonest
        ? "SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_* env present but market leader convergence integrity FAIL — fix Phase AB first."
        : "SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_* env present but market_leader_positioning_convergence_era25_ready is not achieved — finish market leader convergence orchestration first.",
    });
  }

  if (sustainedOperationalExcellenceConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "market_leader_positioning_convergence_prerequisite_not_complete",
      detail: `Sustained ops convergence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    sustainedOpsAttested &&
    sustainedOperationalExcellenceConvergenceExecutionStarted &&
    (!sustainedOperationalExcellenceConvergenceHonest || !marketLeaderIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_sustained_ops_convergence_attestation",
      detail:
        "SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED=1 before honest market leader convergence ready — never attest sustained ops without ops:validate-market-leader-positioning-convergence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    sustainedOperationalExcellenceConvergenceExecutionStarted &&
    (!sustainedOpsReadyHonest || !marketLeaderIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_sustained_ops_convergence_report_attestation",
      detail:
        "SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_REVIEWED=1 before sustained ops integrity PASS — never attest sustained ops report without ops:validate-sustained-operational-excellence-convergence-integrity PASS.",
    });
  }

  if (
    baseline?.sustainedOperationalExcellenceConvergenceExecutionHonest &&
    (!goHonest || !sustainedOpsReadyHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest sustained ops convergence at ${baseline.recordedAt} but GO/sustained ops ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID,
    integrityPassed,
    sustainedOperationalExcellenceConvergenceExecutionStarted,
    sustainedOperationalExcellenceConvergenceComplete:
      sustainedOpsReadyHonest && marketLeaderIntegrity.integrityPassed,
    marketLeaderPositioningConvergenceActive: marketLeaderReadyHonest,
    marketLeaderPositioningConvergenceIntegrityPassed: marketLeaderIntegrity.integrityPassed,
    seriesAPartnerExpansionConvergenceIntegrityPassed:
      marketLeaderIntegrity.seriesAPartnerExpansionConvergenceIntegrityPassed,
    scaleReadinessConvergenceIntegrityPassed:
      marketLeaderIntegrity.scaleReadinessConvergenceIntegrityPassed,
    month2MarketReadinessConvergenceIntegrityPassed:
      marketLeaderIntegrity.month2MarketReadinessConvergenceIntegrityPassed,
    pilotWeek1ExecutionConvergenceIntegrityPassed:
      marketLeaderIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed,
    paidPilotGoConvergenceIntegrityPassed: marketLeaderIntegrity.paidPilotGoConvergenceIntegrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      marketLeaderIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      marketLeaderIntegrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: marketLeaderIntegrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: marketLeaderIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: marketLeaderIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: marketLeaderIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      marketLeaderIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      marketLeaderIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: marketLeaderIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: marketLeaderIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: marketLeaderIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: marketLeaderIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: marketLeaderIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: marketLeaderIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: marketLeaderIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: marketLeaderIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: marketLeaderIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: marketLeaderIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: marketLeaderIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: marketLeaderIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-sustained-operational-excellence-convergence-integrity -- --json",
      "npm run ops:validate-market-leader-positioning-convergence-integrity -- --json",
      "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
      "npm run ops:validate-market-leader-positioning-convergence-era25 -- --json",
      "npm run ops:run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25 -- --write",
      "npm run ops:sync-sustained-operational-excellence-convergence-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
