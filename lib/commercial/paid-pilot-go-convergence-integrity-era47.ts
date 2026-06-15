/**
 * Paid pilot GO convergence era25 integrity — blocks convergence attestation without honest breakthrough.
 * Policy: era47-paid-pilot-go-convergence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { resolveOwnerDailyBriefingBreakthroughEra25MilestoneFromEnv } from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import { evaluateOwnerDailyBriefingBreakthroughEra25 } from "@/lib/commercial/evaluate-owner-daily-briefing-breakthrough-era25";
import {
  evaluateOwnerDailyBriefingBreakthroughIntegrity,
  type OwnerDailyBriefingBreakthroughIntegrityBaseline,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";
import { detectPaidPilotGoConvergenceEra25Started } from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
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

export const PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID =
  "era47-paid-pilot-go-convergence-integrity-v1" as const;

export const PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/paid-pilot-go-convergence-integrity-baseline.json" as const;

export type PaidPilotGoConvergenceIntegrityViolationId =
  | "owner_daily_briefing_breakthrough_prerequisite_not_complete"
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
  | "convergence_started_without_breakthrough_ready"
  | "fake_convergence_attestation"
  | "fake_convergence_report_attestation"
  | "baseline_regression";

export type PaidPilotGoConvergenceIntegrityViolation = {
  id: PaidPilotGoConvergenceIntegrityViolationId;
  detail: string;
};

export type PaidPilotGoConvergenceIntegrityBaseline = {
  paidPilotGoConvergenceExecutionHonest: true;
  recordedAt: string;
  ownerDailyBriefingBreakthroughReadyAttested: true;
  goDecision: "GO";
};

export type PaidPilotGoConvergenceIntegritySummary = {
  policyId: typeof PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID;
  integrityPassed: boolean;
  paidPilotGoConvergenceExecutionStarted: boolean;
  paidPilotGoConvergenceComplete: boolean;
  ownerDailyBriefingBreakthroughActive: boolean;
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
  violations: readonly PaidPilotGoConvergenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly PaidPilotGoConvergenceIntegrityViolationId[] = [
  "owner_daily_briefing_breakthrough_prerequisite_not_complete",
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
  "convergence_started_without_breakthrough_ready",
  "fake_convergence_attestation",
  "fake_convergence_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(root: string): PaidPilotGoConvergenceIntegrityBaseline | null {
  try {
    const path = join(root, PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as PaidPilotGoConvergenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluatePaidPilotGoConvergenceIntegrity(
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
    baselineOverride?: PaidPilotGoConvergenceIntegrityBaseline | null;
  },
): PaidPilotGoConvergenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const breakthroughIntegrity = evaluateOwnerDailyBriefingBreakthroughIntegrity(root, {
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
    baselineOverride: options?.ownerDailyBriefingBreakthroughIntegrityBaselineOverride,
  });

  const breakthroughEvaluation = evaluateOwnerDailyBriefingBreakthroughEra25(env, root);
  const breakthroughMilestone = resolveOwnerDailyBriefingBreakthroughEra25MilestoneFromEnv(env, root);
  const breakthroughReadyHonest =
    breakthroughMilestone === "owner_daily_briefing_breakthrough_era25_ready" &&
    !breakthroughEvaluation.sliceBlocked;

  const goDecision = breakthroughIntegrity.goDecision;
  const goHonest = goDecision === "GO" && breakthroughIntegrity.goIntegrityPassed;
  const paidPilotGoConvergenceExecutionStarted = detectPaidPilotGoConvergenceEra25Started(env);
  const convergenceAttested = parseEnvBoolean(env.PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_REVIEWED);
  const paidPilotGoConvergenceHonest =
    breakthroughReadyHonest && breakthroughIntegrity.integrityPassed;

  const violations: PaidPilotGoConvergenceIntegrityViolation[] = [];

  if (paidPilotGoConvergenceExecutionStarted && goDecision === "GO" && !breakthroughIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before paid pilot GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before GO convergence attestation.",
    });
  }

  if (
    paidPilotGoConvergenceExecutionStarted &&
    !breakthroughIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before GO convergence attestation.",
    });
  }

  if (
    paidPilotGoConvergenceExecutionStarted &&
    !breakthroughIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before GO convergence attestation.",
    });
  }

  if (
    paidPilotGoConvergenceExecutionStarted &&
    !breakthroughIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before GO convergence attestation.",
    });
  }

  if (
    paidPilotGoConvergenceExecutionStarted &&
    !breakthroughIntegrity.linearPathPermanentlyClosedIntegrityPassed
  ) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before GO convergence attestation.",
    });
  }

  if (
    paidPilotGoConvergenceExecutionStarted &&
    !breakthroughIntegrity.linearChainTerminusGuardIntegrityPassed
  ) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.era25FirstCharterSliceIntegrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before GO convergence attestation.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.era25FirstProductSliceBlueprintIntegrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before paid pilot GO convergence.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !breakthroughIntegrity.integrityPassed) {
    violations.push({
      id: "owner_daily_briefing_breakthrough_integrity_fail",
      detail: "Owner daily briefing breakthrough integrity FAIL — complete Phase V before paid pilot GO convergence.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && !paidPilotGoConvergenceHonest) {
    violations.push({
      id: "convergence_started_without_breakthrough_ready",
      detail: breakthroughReadyHonest
        ? "PAID_PILOT_GO_CONVERGENCE_ERA25_* env present but breakthrough integrity FAIL — fix Phase V first."
        : "PAID_PILOT_GO_CONVERGENCE_ERA25_* env present but owner_daily_briefing_breakthrough_era25_ready is not achieved — finish breakthrough orchestration first.",
    });
  }

  if (paidPilotGoConvergenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "owner_daily_briefing_breakthrough_prerequisite_not_complete",
      detail: `GO convergence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    convergenceAttested &&
    paidPilotGoConvergenceExecutionStarted &&
    (!paidPilotGoConvergenceHonest || !breakthroughIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_convergence_attestation",
      detail:
        "PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED=1 before honest breakthrough ready — never attest convergence without ops:validate-owner-daily-briefing-breakthrough-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    paidPilotGoConvergenceExecutionStarted &&
    (!paidPilotGoConvergenceHonest || !breakthroughIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_convergence_report_attestation",
      detail:
        "PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_REVIEWED=1 before breakthrough integrity PASS — never attest convergence report without ops:validate-paid-pilot-go-convergence-integrity PASS.",
    });
  }

  if (baseline?.paidPilotGoConvergenceExecutionHonest && (!goHonest || !paidPilotGoConvergenceHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest GO convergence at ${baseline.recordedAt} but GO/breakthrough ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID,
    integrityPassed,
    paidPilotGoConvergenceExecutionStarted,
    paidPilotGoConvergenceComplete: paidPilotGoConvergenceHonest,
    ownerDailyBriefingBreakthroughActive: breakthroughReadyHonest,
    ownerDailyBriefingBreakthroughIntegrityPassed: breakthroughIntegrity.integrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      breakthroughIntegrity.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityPassed: breakthroughIntegrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: breakthroughIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: breakthroughIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: breakthroughIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      breakthroughIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      breakthroughIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: breakthroughIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: breakthroughIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: breakthroughIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: breakthroughIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: breakthroughIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: breakthroughIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: breakthroughIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: breakthroughIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: breakthroughIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: breakthroughIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: breakthroughIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: breakthroughIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-paid-pilot-go-convergence-integrity -- --json",
      "npm run ops:validate-owner-daily-briefing-breakthrough-integrity -- --json",
      "npm run ops:validate-paid-pilot-go-convergence-era25 -- --json",
      "npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json",
      "npm run ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25 -- --write",
      "npm run ops:sync-paid-pilot-go-convergence-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
