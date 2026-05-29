/**
 * Owner daily briefing breakthrough era25 integrity — blocks breakthrough attestation without honest blueprint.
 * Policy: era46-owner-daily-briefing-breakthrough-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  evaluateEra25FirstProductSliceBlueprintIntegrity,
  type Era25FirstProductSliceBlueprintIntegrityBaseline,
} from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";
import { evaluateOwnerDailyBriefingBreakthroughEra25 } from "@/lib/commercial/evaluate-owner-daily-briefing-breakthrough-era25";
import { detectOwnerDailyBriefingBreakthroughEra25Started } from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
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

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID =
  "era46-owner-daily-briefing-breakthrough-integrity-v1" as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/owner-daily-briefing-breakthrough-integrity-baseline.json" as const;

export type OwnerDailyBriefingBreakthroughIntegrityViolationId =
  | "era25_first_product_slice_blueprint_prerequisite_not_complete"
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
  | "breakthrough_started_without_blueprint_ready"
  | "fake_breakthrough_attestation"
  | "fake_breakthrough_report_attestation"
  | "baseline_regression";

export type OwnerDailyBriefingBreakthroughIntegrityViolation = {
  id: OwnerDailyBriefingBreakthroughIntegrityViolationId;
  detail: string;
};

export type OwnerDailyBriefingBreakthroughIntegrityBaseline = {
  ownerDailyBriefingBreakthroughExecutionHonest: true;
  recordedAt: string;
  era25FirstProductSliceBlueprintReadyAttested: true;
  goDecision: "GO";
};

export type OwnerDailyBriefingBreakthroughIntegritySummary = {
  policyId: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID;
  integrityPassed: boolean;
  ownerDailyBriefingBreakthroughExecutionStarted: boolean;
  ownerDailyBriefingBreakthroughComplete: boolean;
  era25FirstProductSliceBlueprintActive: boolean;
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
  violations: readonly OwnerDailyBriefingBreakthroughIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly OwnerDailyBriefingBreakthroughIntegrityViolationId[] = [
  "era25_first_product_slice_blueprint_prerequisite_not_complete",
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
  "breakthrough_started_without_blueprint_ready",
  "fake_breakthrough_attestation",
  "fake_breakthrough_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): OwnerDailyBriefingBreakthroughIntegrityBaseline | null {
  try {
    const path = join(root, OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as OwnerDailyBriefingBreakthroughIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateOwnerDailyBriefingBreakthroughIntegrity(
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
    baselineOverride?: OwnerDailyBriefingBreakthroughIntegrityBaseline | null;
  },
): OwnerDailyBriefingBreakthroughIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const blueprintIntegrity = evaluateEra25FirstProductSliceBlueprintIntegrity(root, {
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
    baselineOverride: options?.era25FirstProductSliceBlueprintIntegrityBaselineOverride,
  });

  const breakthroughEvaluation = evaluateOwnerDailyBriefingBreakthroughEra25(env, root);
  const blueprintReadyHonest =
    breakthroughEvaluation.blueprint.era25FirstProductSliceBlueprintMilestone ===
      "era25_first_product_slice_blueprint_ready" && !breakthroughEvaluation.blueprint.blueprintBlocked;

  const goDecision = blueprintIntegrity.goDecision;
  const goHonest = goDecision === "GO" && blueprintIntegrity.goIntegrityPassed;
  const ownerDailyBriefingBreakthroughExecutionStarted =
    detectOwnerDailyBriefingBreakthroughEra25Started(env);
  const breakthroughAttested = parseEnvBoolean(env.OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_REVIEWED);
  const ownerDailyBriefingBreakthroughHonest =
    blueprintReadyHonest && blueprintIntegrity.integrityPassed;

  const violations: OwnerDailyBriefingBreakthroughIntegrityViolation[] = [];

  if (
    ownerDailyBriefingBreakthroughExecutionStarted &&
    goDecision === "GO" &&
    !blueprintIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before breakthrough attestation.",
    });
  }

  if (
    ownerDailyBriefingBreakthroughExecutionStarted &&
    !blueprintIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before breakthrough attestation.",
    });
  }

  if (
    ownerDailyBriefingBreakthroughExecutionStarted &&
    !blueprintIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before breakthrough attestation.",
    });
  }

  if (
    ownerDailyBriefingBreakthroughExecutionStarted &&
    !blueprintIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before breakthrough attestation.",
    });
  }

  if (
    ownerDailyBriefingBreakthroughExecutionStarted &&
    !blueprintIntegrity.linearPathPermanentlyClosedIntegrityPassed
  ) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before breakthrough attestation.",
    });
  }

  if (
    ownerDailyBriefingBreakthroughExecutionStarted &&
    !blueprintIntegrity.linearChainTerminusGuardIntegrityPassed
  ) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before breakthrough attestation.",
    });
  }

  if (
    ownerDailyBriefingBreakthroughExecutionStarted &&
    !blueprintIntegrity.era25FirstCharterSliceIntegrityPassed
  ) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.era25EngineeringGatesIntegrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before breakthrough attestation.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !blueprintIntegrity.integrityPassed) {
    violations.push({
      id: "era25_first_product_slice_blueprint_integrity_fail",
      detail: "Era25 first product slice blueprint integrity FAIL — complete Phase U before owner daily briefing breakthrough.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && !ownerDailyBriefingBreakthroughHonest) {
    violations.push({
      id: "breakthrough_started_without_blueprint_ready",
      detail: blueprintReadyHonest
        ? "OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_* env present but blueprint integrity FAIL — fix Phase U first."
        : "OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_* env present but era25_first_product_slice_blueprint_ready is not achieved — finish blueprint orchestration first.",
    });
  }

  if (ownerDailyBriefingBreakthroughExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "era25_first_product_slice_blueprint_prerequisite_not_complete",
      detail: `Breakthrough started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    breakthroughAttested &&
    ownerDailyBriefingBreakthroughExecutionStarted &&
    (!ownerDailyBriefingBreakthroughHonest || !blueprintIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_breakthrough_attestation",
      detail:
        "OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_ATTESTED=1 before honest blueprint ready — never attest breakthrough without ops:validate-era25-first-product-slice-blueprint-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    ownerDailyBriefingBreakthroughExecutionStarted &&
    (!ownerDailyBriefingBreakthroughHonest || !blueprintIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_breakthrough_report_attestation",
      detail:
        "OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_REVIEWED=1 before blueprint integrity PASS — never attest breakthrough report without ops:validate-owner-daily-briefing-breakthrough-integrity PASS.",
    });
  }

  if (
    baseline?.ownerDailyBriefingBreakthroughExecutionHonest &&
    (!goHonest || !ownerDailyBriefingBreakthroughHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest breakthrough at ${baseline.recordedAt} but GO/blueprint ready is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID,
    integrityPassed,
    ownerDailyBriefingBreakthroughExecutionStarted,
    ownerDailyBriefingBreakthroughComplete: ownerDailyBriefingBreakthroughHonest,
    era25FirstProductSliceBlueprintActive: blueprintReadyHonest,
    era25FirstProductSliceBlueprintIntegrityPassed: blueprintIntegrity.integrityPassed,
    era25EngineeringGatesIntegrityPassed: blueprintIntegrity.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityPassed: blueprintIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: blueprintIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: blueprintIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      blueprintIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      blueprintIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: blueprintIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: blueprintIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: blueprintIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: blueprintIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: blueprintIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: blueprintIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: blueprintIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: blueprintIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: blueprintIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: blueprintIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: blueprintIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: blueprintIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-owner-daily-briefing-breakthrough-integrity -- --json",
      "npm run ops:validate-era25-first-product-slice-blueprint-integrity -- --json",
      "npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json",
      "npm run ops:validate-era25-first-product-slice-blueprint -- --json",
      "npm run ops:run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25 -- --write",
      "npm run ops:sync-owner-daily-briefing-breakthrough-era25-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
