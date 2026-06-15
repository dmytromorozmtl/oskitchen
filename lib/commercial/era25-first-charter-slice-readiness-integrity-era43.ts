/**
 * Era25 first charter slice readiness integrity — blocks slice attestation without honest era25 charter exit.
 * Policy: era43-era25-first-charter-slice-readiness-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { detectEra25FirstCharterSliceStarted } from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import {
  evaluateEra25CharterExitOutsideLinearPathIntegrity,
  type Era25CharterExitOutsideLinearPathIntegrityBaseline,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";
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

export const ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_POLICY_ID =
  "era43-era25-first-charter-slice-readiness-integrity-v1" as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-first-charter-slice-readiness-integrity-baseline.json" as const;

export type Era25FirstCharterSliceReadinessIntegrityViolationId =
  | "era25_charter_exit_prerequisite_not_complete"
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
  | "first_slice_started_without_charter_exit"
  | "fake_first_slice_attestation"
  | "fake_first_slice_report_attestation"
  | "baseline_regression";

export type Era25FirstCharterSliceReadinessIntegrityViolation = {
  id: Era25FirstCharterSliceReadinessIntegrityViolationId;
  detail: string;
};

export type Era25FirstCharterSliceReadinessIntegrityBaseline = {
  era25FirstCharterSliceReadinessExecutionHonest: true;
  recordedAt: string;
  era25CharterExitCompleteAttested: true;
  goDecision: "GO";
};

export type Era25FirstCharterSliceReadinessIntegritySummary = {
  policyId: typeof ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_POLICY_ID;
  integrityPassed: boolean;
  era25FirstCharterSliceExecutionStarted: boolean;
  era25FirstCharterSliceComplete: boolean;
  era25CharterExitActive: boolean;
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
  violations: readonly Era25FirstCharterSliceReadinessIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25FirstCharterSliceReadinessIntegrityViolationId[] = [
  "era25_charter_exit_prerequisite_not_complete",
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
  "first_slice_started_without_charter_exit",
  "fake_first_slice_attestation",
  "fake_first_slice_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): Era25FirstCharterSliceReadinessIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25FirstCharterSliceReadinessIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateEra25FirstCharterSliceReadinessIntegrity(
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
    baselineOverride?: Era25FirstCharterSliceReadinessIntegrityBaseline | null;
  },
): Era25FirstCharterSliceReadinessIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const charterExitIntegrity = evaluateEra25CharterExitOutsideLinearPathIntegrity(root, {
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
    baselineOverride: options?.era25CharterExitIntegrityBaselineOverride,
  });

  const goDecision = charterExitIntegrity.goDecision;
  const goHonest = goDecision === "GO" && charterExitIntegrity.goIntegrityPassed;
  const era25FirstCharterSliceExecutionStarted = detectEra25FirstCharterSliceStarted(env);
  const sliceAttested = parseEnvBoolean(env.ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_REVIEWED);
  const era25FirstCharterSliceHonest =
    charterExitIntegrity.era25CharterExitComplete && charterExitIntegrity.integrityPassed;

  const violations: Era25FirstCharterSliceReadinessIntegrityViolation[] = [];

  if (
    era25FirstCharterSliceExecutionStarted &&
    goDecision === "GO" &&
    !charterExitIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before first charter slice attestation.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before first charter slice.",
    });
  }

  if (
    era25FirstCharterSliceExecutionStarted &&
    !charterExitIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before first charter slice.",
    });
  }

  if (
    era25FirstCharterSliceExecutionStarted &&
    !charterExitIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before first charter slice.",
    });
  }

  if (
    era25FirstCharterSliceExecutionStarted &&
    !charterExitIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before first charter slice.",
    });
  }

  if (
    era25FirstCharterSliceExecutionStarted &&
    !charterExitIntegrity.linearPathPermanentlyClosedIntegrityPassed
  ) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before first charter slice.",
    });
  }

  if (
    era25FirstCharterSliceExecutionStarted &&
    !charterExitIntegrity.linearChainTerminusGuardIntegrityPassed
  ) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before first charter slice.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !charterExitIntegrity.integrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before first charter slice readiness.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && !era25FirstCharterSliceHonest) {
    violations.push({
      id: "first_slice_started_without_charter_exit",
      detail: charterExitIntegrity.era25CharterExitComplete
        ? "ERA25_FIRST_CHARTER_SLICE_* env present but era25 charter exit integrity FAIL — fix Phase R first."
        : "ERA25_FIRST_CHARTER_SLICE_* env present but era25 charter exit is not complete — finish charter exit first.",
    });
  }

  if (era25FirstCharterSliceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "era25_charter_exit_prerequisite_not_complete",
      detail: `First charter slice started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    sliceAttested &&
    era25FirstCharterSliceExecutionStarted &&
    (!era25FirstCharterSliceHonest || !charterExitIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_first_slice_attestation",
      detail:
        "ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED=1 before honest era25 charter exit — never attest first slice without ops:validate-era25-charter-exit-outside-linear-path-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25FirstCharterSliceExecutionStarted &&
    (!era25FirstCharterSliceHonest || !charterExitIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_first_slice_report_attestation",
      detail:
        "ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_REVIEWED=1 before honest charter exit — never attest slice report without ops:validate-era25-first-charter-slice-readiness-integrity PASS.",
    });
  }

  if (baseline?.era25FirstCharterSliceReadinessExecutionHonest && (!goHonest || !era25FirstCharterSliceHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest first charter slice at ${baseline.recordedAt} but GO/charter exit is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_POLICY_ID,
    integrityPassed,
    era25FirstCharterSliceExecutionStarted,
    era25FirstCharterSliceComplete: era25FirstCharterSliceHonest,
    era25CharterExitActive: charterExitIntegrity.era25CharterExitComplete,
    era25CharterExitIntegrityPassed: charterExitIntegrity.integrityPassed,
    linearChainTerminusGuardIntegrityPassed: charterExitIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      charterExitIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      charterExitIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: charterExitIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: charterExitIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: charterExitIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: charterExitIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: charterExitIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: charterExitIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: charterExitIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: charterExitIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: charterExitIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: charterExitIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: charterExitIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: charterExitIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json",
      "npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json",
      "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
      "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
      "npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --write",
      "npm run ops:sync-era25-first-charter-slice-readiness-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
