/**
 * Month 2 market readiness convergence era25 integrity — blocks month2 attestation without honest week 1.
 * Policy: era49-month2-market-readiness-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolveMonth2MarketReadinessConvergenceEra25MilestoneFromEnv,
  resolvePilotWeek1ExecutionConvergenceEra25MilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  evaluatePilotWeek1ExecutionConvergenceIntegrity,
  type PilotWeek1ExecutionConvergenceIntegrityBaseline,
} from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";
import { detectMonth2MarketReadinessConvergenceEra25Started } from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
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

export const MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_POLICY_ID =
  "era49-month2-market-readiness-convergence-integrity-v1" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/month2-market-readiness-convergence-integrity-baseline.json" as const;

export type Month2MarketReadinessConvergenceIntegrityViolationId =
  | "pilot_week1_execution_convergence_prerequisite_not_complete"
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
  | "month2_started_without_week1_convergence_ready"
  | "fake_month2_convergence_attestation"
  | "fake_month2_convergence_report_attestation"
  | "baseline_regression";

export type Month2MarketReadinessConvergenceIntegrityViolation = {
  id: Month2MarketReadinessConvergenceIntegrityViolationId;
  detail: string;
};

export type Month2MarketReadinessConvergenceIntegrityBaseline = {
  month2MarketReadinessConvergenceExecutionHonest: true;
  recordedAt: string;
  pilotWeek1ExecutionConvergenceReadyAttested: true;
  goDecision: "GO";
};

export type Month2MarketReadinessConvergenceIntegritySummary = {
  policyId: typeof MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_POLICY_ID;
  integrityPassed: boolean;
  month2MarketReadinessConvergenceExecutionStarted: boolean;
  month2MarketReadinessConvergenceComplete: boolean;
  pilotWeek1ExecutionConvergenceActive: boolean;
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
  violations: readonly Month2MarketReadinessConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Month2MarketReadinessConvergenceIntegrityViolationId[] = [
  "pilot_week1_execution_convergence_prerequisite_not_complete",
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
  "month2_started_without_week1_convergence_ready",
  "fake_month2_convergence_attestation",
  "fake_month2_convergence_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): Month2MarketReadinessConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Month2MarketReadinessConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamWeek1IntegrityViolations(
  violations: Month2MarketReadinessConvergenceIntegrityViolation[],
  week1Integrity: ReturnType<typeof evaluatePilotWeek1ExecutionConvergenceIntegrity>,
): void {
  if (!week1Integrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.engineeringPathTerminusIntegrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.postTerminusSteadyStateIntegrityPassed) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.commercialPilotPathAbsoluteEndIntegrityPassed) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.linearPathPermanentlyClosedIntegrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.linearChainTerminusGuardIntegrityPassed) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before month 2 convergence attestation.",
    });
  }
  if (!week1Integrity.era25FirstProductSliceBlueprintIntegrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before month 2 convergence.",
    });
  }
  if (!week1Integrity.ownerDailyBriefingBreakthroughIntegrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before month 2 convergence.",
    });
  }
  if (!week1Integrity.paidPilotGoConvergenceIntegrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before month 2 market readiness convergence.",
    });
  }
}

export function evaluateMonth2MarketReadinessConvergenceIntegrity(
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
    baselineOverride?: Month2MarketReadinessConvergenceIntegrityBaseline | null;
  },
): Month2MarketReadinessConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const week1Integrity = evaluatePilotWeek1ExecutionConvergenceIntegrity(root, {
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
    baselineOverride: options?.pilotWeek1ExecutionConvergenceIntegrityBaselineOverride,
  });

  const week1Milestone = resolvePilotWeek1ExecutionConvergenceEra25MilestoneFromEnv(env);
  const month2Milestone = resolveMonth2MarketReadinessConvergenceEra25MilestoneFromEnv(env);
  const week1ReadyHonest =
    week1Milestone === "pilot_week1_execution_convergence_era25_ready";
  const month2ReadyHonest =
    month2Milestone === "month2_market_readiness_convergence_era25_ready";

  const goDecision = week1Integrity.goDecision;
  const goHonest = goDecision === "GO" && week1Integrity.goIntegrityPassed;
  const month2MarketReadinessConvergenceExecutionStarted =
    detectMonth2MarketReadinessConvergenceEra25Started(env);
  const month2Attested = parseEnvBoolean(env.MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(
    env.MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED,
  );
  const month2MarketReadinessConvergenceHonest =
    week1ReadyHonest && week1Integrity.integrityPassed;

  const violations: Month2MarketReadinessConvergenceIntegrityViolation[] = [];

  if (month2MarketReadinessConvergenceExecutionStarted) {
    pushUpstreamWeek1IntegrityViolations(violations, week1Integrity);
  }

  if (month2MarketReadinessConvergenceExecutionStarted && !week1Integrity.integrityPassed) {
    violations.push({
      id: "pilot_week1_execution_convergence_integrity_fail",
      detail: "Pilot week 1 execution convergence integrity FAIL — complete Phase X before month 2 market readiness convergence.",
    });
  }

  if (month2MarketReadinessConvergenceExecutionStarted && !month2MarketReadinessConvergenceHonest) {
    violations.push({
      id: "month2_started_without_week1_convergence_ready",
      detail: week1ReadyHonest
        ? "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_* env present but week 1 convergence integrity FAIL — fix Phase X first."
        : "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_* env present but pilot_week1_execution_convergence_era25_ready is not achieved — finish week 1 convergence orchestration first.",
    });
  }

  if (month2MarketReadinessConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "pilot_week1_execution_convergence_prerequisite_not_complete",
      detail: `Month 2 convergence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    month2Attested &&
    month2MarketReadinessConvergenceExecutionStarted &&
    (!month2MarketReadinessConvergenceHonest || !week1Integrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_month2_convergence_attestation",
      detail:
        "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED=1 before honest week 1 convergence ready — never attest month 2 without ops:validate-pilot-week1-execution-convergence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    month2MarketReadinessConvergenceExecutionStarted &&
    (!month2ReadyHonest || !week1Integrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_month2_convergence_report_attestation",
      detail:
        "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED=1 before month 2 integrity PASS — never attest month 2 report without ops:validate-month2-market-readiness-convergence-integrity PASS.",
    });
  }

  if (
    baseline?.month2MarketReadinessConvergenceExecutionHonest &&
    (!goHonest || !month2ReadyHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest month 2 convergence at ${baseline.recordedAt} but GO/month 2 ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_POLICY_ID,
    integrityPassed,
    month2MarketReadinessConvergenceExecutionStarted,
    month2MarketReadinessConvergenceComplete:
      month2ReadyHonest && week1Integrity.integrityPassed,
    pilotWeek1ExecutionConvergenceActive: week1ReadyHonest,
    pilotWeek1ExecutionConvergenceIntegrityPassed: week1Integrity.integrityPassed,
    paidPilotGoConvergenceIntegrityPassed: week1Integrity.paidPilotGoConvergenceIntegrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      week1Integrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      week1Integrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: week1Integrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: week1Integrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: week1Integrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: week1Integrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      week1Integrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      week1Integrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: week1Integrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: week1Integrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: week1Integrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: week1Integrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: week1Integrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: week1Integrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: week1Integrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: week1Integrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: week1Integrity.scaleIntegrityPassed,
    month2IntegrityPassed: week1Integrity.month2IntegrityPassed,
    week1IntegrityPassed: week1Integrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: week1Integrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-month2-market-readiness-convergence-integrity -- --json",
      "npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json",
      "npm run ops:validate-month2-market-readiness-convergence-era25 -- --json",
      "npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json",
      "npm run ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25 -- --write",
      "npm run ops:sync-month2-market-readiness-convergence-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
