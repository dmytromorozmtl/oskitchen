/**
 * Era25 charter exit outside linear path integrity — blocks charter exit attestation without honest Step 17 guard.
 * Policy: era42-era25-charter-exit-outside-linear-path-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { detectEra25CharterExitStarted } from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import {
  evaluateLinearChainTerminusGuardIntegrity,
  type LinearChainTerminusGuardIntegrityBaseline,
} from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";
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

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID =
  "era42-era25-charter-exit-outside-linear-path-integrity-v1" as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-charter-exit-outside-linear-path-integrity-baseline.json" as const;

export type Era25CharterExitOutsideLinearPathIntegrityViolationId =
  | "linear_chain_terminus_guard_prerequisite_not_complete"
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
  | "charter_exit_started_without_step17_guard"
  | "fake_charter_exit_attestation"
  | "fake_charter_exit_report_attestation"
  | "baseline_regression";

export type Era25CharterExitOutsideLinearPathIntegrityViolation = {
  id: Era25CharterExitOutsideLinearPathIntegrityViolationId;
  detail: string;
};

export type Era25CharterExitOutsideLinearPathIntegrityBaseline = {
  era25CharterExitExecutionHonest: true;
  recordedAt: string;
  linearChainTerminusGuardCompleteAttested: true;
  goDecision: "GO";
};

export type Era25CharterExitOutsideLinearPathIntegritySummary = {
  policyId: typeof ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID;
  integrityPassed: boolean;
  era25CharterExitExecutionStarted: boolean;
  era25CharterExitComplete: boolean;
  linearChainTerminusGuardActive: boolean;
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
  violations: readonly Era25CharterExitOutsideLinearPathIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25CharterExitOutsideLinearPathIntegrityViolationId[] = [
  "linear_chain_terminus_guard_prerequisite_not_complete",
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
  "charter_exit_started_without_step17_guard",
  "fake_charter_exit_attestation",
  "fake_charter_exit_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): Era25CharterExitOutsideLinearPathIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25CharterExitOutsideLinearPathIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateEra25CharterExitOutsideLinearPathIntegrity(
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
    baselineOverride?: Era25CharterExitOutsideLinearPathIntegrityBaseline | null;
  },
): Era25CharterExitOutsideLinearPathIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const terminusGuardIntegrity = evaluateLinearChainTerminusGuardIntegrity(root, {
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
    baselineOverride: options?.linearChainTerminusGuardIntegrityBaselineOverride,
  });

  const goDecision = terminusGuardIntegrity.goDecision;
  const goHonest = goDecision === "GO" && terminusGuardIntegrity.goIntegrityPassed;
  const era25CharterExitExecutionStarted = detectEra25CharterExitStarted(env);
  const charterExitAttested = parseEnvBoolean(env.ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_REPORT_REVIEWED);
  const era25CharterExitHonest =
    terminusGuardIntegrity.linearChainTerminusGuardComplete &&
    terminusGuardIntegrity.integrityPassed;

  const violations: Era25CharterExitOutsideLinearPathIntegrityViolation[] = [];

  if (era25CharterExitExecutionStarted && goDecision === "GO" && !terminusGuardIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before era25 charter exit attestation.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.engineeringPathTerminusIntegrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.postTerminusSteadyStateIntegrityPassed) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before era25 charter exit.",
    });
  }

  if (
    era25CharterExitExecutionStarted &&
    !terminusGuardIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.linearPathPermanentlyClosedIntegrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !terminusGuardIntegrity.integrityPassed) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before era25 charter exit.",
    });
  }

  if (era25CharterExitExecutionStarted && !era25CharterExitHonest) {
    violations.push({
      id: "charter_exit_started_without_step17_guard",
      detail: terminusGuardIntegrity.linearChainTerminusGuardComplete
        ? "ERA25_CHARTER_EXIT_* env present but Step 17 FORBIDDEN guard integrity FAIL — fix Phase Q first."
        : "ERA25_CHARTER_EXIT_* env present but Step 17 FORBIDDEN guard is not complete — finish terminus guard first.",
    });
  }

  if (era25CharterExitExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "linear_chain_terminus_guard_prerequisite_not_complete",
      detail: `Era25 charter exit started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    charterExitAttested &&
    era25CharterExitExecutionStarted &&
    (!era25CharterExitHonest || !terminusGuardIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_charter_exit_attestation",
      detail:
        "ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED=1 before honest Step 17 FORBIDDEN guard — never attest charter exit without ops:validate-linear-chain-terminus-guard-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25CharterExitExecutionStarted &&
    (!era25CharterExitHonest || !terminusGuardIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_charter_exit_report_attestation",
      detail:
        "ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_REPORT_REVIEWED=1 before honest Step 17 guard — never attest charter exit report without ops:validate-era25-charter-exit-outside-linear-path-integrity PASS.",
    });
  }

  if (baseline?.era25CharterExitExecutionHonest && (!goHonest || !era25CharterExitHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest era25 charter exit at ${baseline.recordedAt} but GO/Step 17 guard is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID,
    integrityPassed,
    era25CharterExitExecutionStarted,
    era25CharterExitComplete: era25CharterExitHonest,
    linearChainTerminusGuardActive: terminusGuardIntegrity.linearChainTerminusGuardComplete,
    linearChainTerminusGuardIntegrityPassed: terminusGuardIntegrity.integrityPassed,
    linearPathPermanentlyClosedIntegrityPassed: terminusGuardIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      terminusGuardIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: terminusGuardIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: terminusGuardIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: terminusGuardIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: terminusGuardIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: terminusGuardIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: terminusGuardIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: terminusGuardIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: terminusGuardIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: terminusGuardIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: terminusGuardIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: terminusGuardIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: terminusGuardIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json",
      "npm run ops:validate-linear-chain-terminus-guard-integrity -- --json",
      "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
      "npm run ops:validate-linear-chain-terminus-guard -- --json",
      "npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write",
      "npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write",
      "npm run ops:export-era-charter-readiness-checklist -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
