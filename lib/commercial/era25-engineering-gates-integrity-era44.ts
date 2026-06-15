/**
 * Era25 engineering gates integrity — blocks gates attestation without honest first charter slice.
 * Policy: era44-era25-engineering-gates-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { detectEra25EngineeringGatesStarted } from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import {
  evaluateEra25FirstCharterSliceReadinessIntegrity,
  type Era25FirstCharterSliceReadinessIntegrityBaseline,
} from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";
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

export const ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_POLICY_ID =
  "era44-era25-engineering-gates-integrity-v1" as const;

export const ERA25_ENGINEERING_GATES_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-engineering-gates-integrity-baseline.json" as const;

export type Era25EngineeringGatesIntegrityViolationId =
  | "era25_first_charter_slice_prerequisite_not_complete"
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
  | "engineering_gates_started_without_first_slice_ready"
  | "fake_engineering_gates_attestation"
  | "fake_engineering_gates_report_attestation"
  | "baseline_regression";

export type Era25EngineeringGatesIntegrityViolation = {
  id: Era25EngineeringGatesIntegrityViolationId;
  detail: string;
};

export type Era25EngineeringGatesIntegrityBaseline = {
  era25EngineeringGatesExecutionHonest: true;
  recordedAt: string;
  era25FirstCharterSliceCompleteAttested: true;
  goDecision: "GO";
};

export type Era25EngineeringGatesIntegritySummary = {
  policyId: typeof ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_POLICY_ID;
  integrityPassed: boolean;
  era25EngineeringGatesExecutionStarted: boolean;
  era25EngineeringGatesComplete: boolean;
  era25FirstCharterSliceActive: boolean;
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
  violations: readonly Era25EngineeringGatesIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25EngineeringGatesIntegrityViolationId[] = [
  "era25_first_charter_slice_prerequisite_not_complete",
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
  "engineering_gates_started_without_first_slice_ready",
  "fake_engineering_gates_attestation",
  "fake_engineering_gates_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(root: string): Era25EngineeringGatesIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_ENGINEERING_GATES_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as Era25EngineeringGatesIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateEra25EngineeringGatesIntegrity(
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
    baselineOverride?: Era25EngineeringGatesIntegrityBaseline | null;
  },
): Era25EngineeringGatesIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const firstSliceIntegrity = evaluateEra25FirstCharterSliceReadinessIntegrity(root, {
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
    baselineOverride: options?.era25FirstCharterSliceIntegrityBaselineOverride,
  });

  const goDecision = firstSliceIntegrity.goDecision;
  const goHonest = goDecision === "GO" && firstSliceIntegrity.goIntegrityPassed;
  const era25EngineeringGatesExecutionStarted = detectEra25EngineeringGatesStarted(env);
  const gatesAttested = parseEnvBoolean(env.ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED);
  const reportReviewed = parseEnvBoolean(
    env.ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_REPORT_REVIEWED,
  );
  const era25EngineeringGatesHonest =
    firstSliceIntegrity.era25FirstCharterSliceComplete && firstSliceIntegrity.integrityPassed;

  const violations: Era25EngineeringGatesIntegrityViolation[] = [];

  if (
    era25EngineeringGatesExecutionStarted &&
    goDecision === "GO" &&
    !firstSliceIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before engineering gates attestation.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before engineering gates.",
    });
  }

  if (
    era25EngineeringGatesExecutionStarted &&
    !firstSliceIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before engineering gates.",
    });
  }

  if (
    era25EngineeringGatesExecutionStarted &&
    !firstSliceIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before engineering gates.",
    });
  }

  if (
    era25EngineeringGatesExecutionStarted &&
    !firstSliceIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before engineering gates.",
    });
  }

  if (
    era25EngineeringGatesExecutionStarted &&
    !firstSliceIntegrity.linearPathPermanentlyClosedIntegrityPassed
  ) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before engineering gates.",
    });
  }

  if (
    era25EngineeringGatesExecutionStarted &&
    !firstSliceIntegrity.linearChainTerminusGuardIntegrityPassed
  ) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !firstSliceIntegrity.integrityPassed) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before engineering gates.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && !era25EngineeringGatesHonest) {
    violations.push({
      id: "engineering_gates_started_without_first_slice_ready",
      detail: firstSliceIntegrity.era25FirstCharterSliceComplete
        ? "ERA25_ENGINEERING_GATES_* env present but first charter slice integrity FAIL — fix Phase S first."
        : "ERA25_ENGINEERING_GATES_* env present but first charter slice is not complete — finish slice readiness first.",
    });
  }

  if (era25EngineeringGatesExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "era25_first_charter_slice_prerequisite_not_complete",
      detail: `Engineering gates started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    gatesAttested &&
    era25EngineeringGatesExecutionStarted &&
    (!era25EngineeringGatesHonest || !firstSliceIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_engineering_gates_attestation",
      detail:
        "ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED=1 before honest first charter slice — never attest gates without ops:validate-era25-first-charter-slice-readiness-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25EngineeringGatesExecutionStarted &&
    (!era25EngineeringGatesHonest || !firstSliceIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_engineering_gates_report_attestation",
      detail:
        "ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_REPORT_REVIEWED=1 before slice integrity PASS — never attest gates report without ops:validate-era25-engineering-gates-integrity PASS.",
    });
  }

  if (baseline?.era25EngineeringGatesExecutionHonest && (!goHonest || !era25EngineeringGatesHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest engineering gates at ${baseline.recordedAt} but GO/first charter slice is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_POLICY_ID,
    integrityPassed,
    era25EngineeringGatesExecutionStarted,
    era25EngineeringGatesComplete: era25EngineeringGatesHonest,
    era25FirstCharterSliceActive: firstSliceIntegrity.era25FirstCharterSliceComplete,
    era25FirstCharterSliceIntegrityPassed: firstSliceIntegrity.integrityPassed,
    era25CharterExitIntegrityPassed: firstSliceIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: firstSliceIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      firstSliceIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      firstSliceIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: firstSliceIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: firstSliceIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: firstSliceIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: firstSliceIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: firstSliceIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: firstSliceIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: firstSliceIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: firstSliceIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: firstSliceIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: firstSliceIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: firstSliceIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: firstSliceIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-engineering-gates-integrity -- --json",
      "npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json",
      "npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json",
      "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
      "npm run ops:run-era25-engineering-gates-post-readiness-orchestrator -- --write",
      "npm run ops:sync-era25-engineering-gates-require-signed-charter-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
