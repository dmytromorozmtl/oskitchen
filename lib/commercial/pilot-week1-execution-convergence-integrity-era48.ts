/**
 * Pilot week 1 execution convergence era25 integrity — blocks week1 attestation without honest GO convergence.
 * Policy: era48-pilot-week1-execution-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolvePaidPilotGoConvergenceEra25MilestoneFromEnv,
  resolvePilotWeek1ExecutionConvergenceEra25MilestoneFromEnv,
} from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  evaluatePaidPilotGoConvergenceIntegrity,
  type PaidPilotGoConvergenceIntegrityBaseline,
} from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";
import { detectPilotWeek1ExecutionConvergenceEra25Started } from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
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

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID =
  "era48-pilot-week1-execution-convergence-integrity-v1" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/pilot-week1-execution-convergence-integrity-baseline.json" as const;

export type PilotWeek1ExecutionConvergenceIntegrityViolationId =
  | "paid_pilot_go_convergence_prerequisite_not_complete"
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
  | "week1_started_without_go_convergence_ready"
  | "fake_week1_convergence_attestation"
  | "fake_week1_convergence_report_attestation"
  | "baseline_regression";

export type PilotWeek1ExecutionConvergenceIntegrityViolation = {
  id: PilotWeek1ExecutionConvergenceIntegrityViolationId;
  detail: string;
};

export type PilotWeek1ExecutionConvergenceIntegrityBaseline = {
  pilotWeek1ExecutionConvergenceExecutionHonest: true;
  recordedAt: string;
  paidPilotGoConvergenceReadyAttested: true;
  goDecision: "GO";
};

export type PilotWeek1ExecutionConvergenceIntegritySummary = {
  policyId: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID;
  integrityPassed: boolean;
  pilotWeek1ExecutionConvergenceExecutionStarted: boolean;
  pilotWeek1ExecutionConvergenceComplete: boolean;
  paidPilotGoConvergenceActive: boolean;
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
  violations: readonly PilotWeek1ExecutionConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly PilotWeek1ExecutionConvergenceIntegrityViolationId[] = [
  "paid_pilot_go_convergence_prerequisite_not_complete",
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
  "week1_started_without_go_convergence_ready",
  "fake_week1_convergence_attestation",
  "fake_week1_convergence_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): PilotWeek1ExecutionConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as PilotWeek1ExecutionConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluatePilotWeek1ExecutionConvergenceIntegrity(
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
    baselineOverride?: PilotWeek1ExecutionConvergenceIntegrityBaseline | null;
  },
): PilotWeek1ExecutionConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const goConvergenceIntegrity = evaluatePaidPilotGoConvergenceIntegrity(root, {
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
    baselineOverride: options?.paidPilotGoConvergenceIntegrityBaselineOverride,
  });

  const goConvergenceMilestone = resolvePaidPilotGoConvergenceEra25MilestoneFromEnv(env, root);
  const week1Milestone = resolvePilotWeek1ExecutionConvergenceEra25MilestoneFromEnv(env, root);
  const goConvergenceReadyHonest =
    goConvergenceMilestone === "paid_pilot_go_convergence_era25_ready";
  const week1ReadyHonest =
    week1Milestone === "pilot_week1_execution_convergence_era25_ready";

  const goDecision = goConvergenceIntegrity.goDecision;
  const goHonest = goDecision === "GO" && goConvergenceIntegrity.goIntegrityPassed;
  const pilotWeek1ExecutionConvergenceExecutionStarted =
    detectPilotWeek1ExecutionConvergenceEra25Started(env);
  const week1Attested = parseEnvBoolean(env.PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_REVIEWED);
  const pilotWeek1ExecutionConvergenceHonest =
    goConvergenceReadyHonest && goConvergenceIntegrity.integrityPassed;

  const violations: PilotWeek1ExecutionConvergenceIntegrityViolation[] = [];

  if (
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    goDecision === "GO" &&
    !goConvergenceIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before week 1 convergence attestation.",
    });
  }

  if (
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    !goConvergenceIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before week 1 convergence attestation.",
    });
  }

  if (
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    !goConvergenceIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before week 1 convergence attestation.",
    });
  }

  if (
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    !goConvergenceIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before week 1 convergence attestation.",
    });
  }

  if (
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    !goConvergenceIntegrity.linearPathPermanentlyClosedIntegrityPassed
  ) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before week 1 convergence attestation.",
    });
  }

  if (
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    !goConvergenceIntegrity.linearChainTerminusGuardIntegrityPassed
  ) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before week 1 convergence attestation.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before week 1 convergence attestation.",
    });
  }

  if (
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    !goConvergenceIntegrity.era25FirstProductSliceBlueprintIntegrityPassed
  ) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before pilot week 1 convergence.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before pilot week 1 convergence.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !goConvergenceIntegrity.integrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before pilot week 1 execution convergence.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && !pilotWeek1ExecutionConvergenceHonest) {
    violations.push({
      id: "week1_started_without_go_convergence_ready",
      detail: goConvergenceReadyHonest
        ? "PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_* env present but GO convergence integrity FAIL — fix Phase W first."
        : "PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_* env present but paid_pilot_go_convergence_era25_ready is not achieved — finish GO convergence orchestration first.",
    });
  }

  if (pilotWeek1ExecutionConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "paid_pilot_go_convergence_prerequisite_not_complete",
      detail: `Week 1 convergence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    week1Attested &&
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    (!pilotWeek1ExecutionConvergenceHonest || !goConvergenceIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_week1_convergence_attestation",
      detail:
        "PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED=1 before honest GO convergence ready — never attest week 1 without ops:validate-paid-pilot-go-convergence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    pilotWeek1ExecutionConvergenceExecutionStarted &&
    (!week1ReadyHonest || !goConvergenceIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_week1_convergence_report_attestation",
      detail:
        "PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_REVIEWED=1 before week 1 integrity PASS — never attest week 1 report without ops:validate-pilot-week1-execution-convergence-integrity PASS.",
    });
  }

  if (
    baseline?.pilotWeek1ExecutionConvergenceExecutionHonest &&
    (!goHonest || !week1ReadyHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest week 1 convergence at ${baseline.recordedAt} but GO/week 1 ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID,
    integrityPassed,
    pilotWeek1ExecutionConvergenceExecutionStarted,
    pilotWeek1ExecutionConvergenceComplete: week1ReadyHonest && goConvergenceIntegrity.integrityPassed,
    paidPilotGoConvergenceActive: goConvergenceReadyHonest,
    paidPilotGoConvergenceIntegrityPassed: goConvergenceIntegrity.integrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      goConvergenceIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      goConvergenceIntegrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: goConvergenceIntegrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: goConvergenceIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: goConvergenceIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: goConvergenceIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      goConvergenceIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      goConvergenceIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: goConvergenceIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: goConvergenceIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: goConvergenceIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: goConvergenceIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: goConvergenceIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: goConvergenceIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: goConvergenceIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: goConvergenceIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: goConvergenceIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: goConvergenceIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: goConvergenceIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: goConvergenceIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json",
      "npm run ops:validate-paid-pilot-go-convergence-integrity -- --json",
      "npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json",
      "npm run ops:validate-paid-pilot-go-convergence-era25 -- --json",
      "npm run ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25 -- --write",
      "npm run ops:sync-pilot-week1-execution-convergence-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
