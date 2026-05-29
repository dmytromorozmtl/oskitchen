/**
 * Era25 first product slice blueprint integrity — blocks blueprint attestation without honest engineering gates.
 * Policy: era45-era25-first-product-slice-blueprint-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { detectEra25FirstProductSliceBlueprintStarted } from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import { evaluateEra25EngineeringGatesRequireSignedCharter } from "@/lib/commercial/evaluate-era25-engineering-gates-require-signed-charter";
import {
  evaluateEra25EngineeringGatesIntegrity,
  type Era25EngineeringGatesIntegrityBaseline,
} from "@/lib/commercial/era25-engineering-gates-integrity-era44";
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

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_POLICY_ID =
  "era45-era25-first-product-slice-blueprint-integrity-v1" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-first-product-slice-blueprint-integrity-baseline.json" as const;

export type Era25FirstProductSliceBlueprintIntegrityViolationId =
  | "era25_engineering_gates_prerequisite_not_complete"
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
  | "blueprint_started_without_gates_open"
  | "fake_blueprint_attestation"
  | "fake_blueprint_report_attestation"
  | "baseline_regression";

export type Era25FirstProductSliceBlueprintIntegrityViolation = {
  id: Era25FirstProductSliceBlueprintIntegrityViolationId;
  detail: string;
};

export type Era25FirstProductSliceBlueprintIntegrityBaseline = {
  era25FirstProductSliceBlueprintExecutionHonest: true;
  recordedAt: string;
  era25EngineeringGatesOpenAttested: true;
  goDecision: "GO";
};

export type Era25FirstProductSliceBlueprintIntegritySummary = {
  policyId: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_POLICY_ID;
  integrityPassed: boolean;
  era25FirstProductSliceBlueprintExecutionStarted: boolean;
  era25FirstProductSliceBlueprintComplete: boolean;
  era25EngineeringGatesActive: boolean;
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
  violations: readonly Era25FirstProductSliceBlueprintIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25FirstProductSliceBlueprintIntegrityViolationId[] = [
  "era25_engineering_gates_prerequisite_not_complete",
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
  "blueprint_started_without_gates_open",
  "fake_blueprint_attestation",
  "fake_blueprint_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): Era25FirstProductSliceBlueprintIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25FirstProductSliceBlueprintIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateEra25FirstProductSliceBlueprintIntegrity(
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
    baselineOverride?: Era25FirstProductSliceBlueprintIntegrityBaseline | null;
  },
): Era25FirstProductSliceBlueprintIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const gatesIntegrity = evaluateEra25EngineeringGatesIntegrity(root, {
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
    baselineOverride: options?.era25EngineeringGatesIntegrityBaselineOverride,
  });

  const gatesEvaluation = evaluateEra25EngineeringGatesRequireSignedCharter(env, root);
  const gatesOpenHonest =
    gatesEvaluation.era25EngineeringGatesMilestone === "era25_engineering_gates_open" &&
    !gatesEvaluation.gatesBlocked;

  const goDecision = gatesIntegrity.goDecision;
  const goHonest = goDecision === "GO" && gatesIntegrity.goIntegrityPassed;
  const era25FirstProductSliceBlueprintExecutionStarted =
    detectEra25FirstProductSliceBlueprintStarted(env);
  const blueprintAttested = parseEnvBoolean(env.ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_REVIEWED);
  const era25FirstProductSliceBlueprintHonest =
    gatesOpenHonest && gatesIntegrity.integrityPassed;

  const violations: Era25FirstProductSliceBlueprintIntegrityViolation[] = [];

  if (
    era25FirstProductSliceBlueprintExecutionStarted &&
    goDecision === "GO" &&
    !gatesIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before blueprint attestation.",
    });
  }

  if (
    era25FirstProductSliceBlueprintExecutionStarted &&
    !gatesIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before blueprint attestation.",
    });
  }

  if (
    era25FirstProductSliceBlueprintExecutionStarted &&
    !gatesIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before blueprint attestation.",
    });
  }

  if (
    era25FirstProductSliceBlueprintExecutionStarted &&
    !gatesIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before blueprint attestation.",
    });
  }

  if (
    era25FirstProductSliceBlueprintExecutionStarted &&
    !gatesIntegrity.linearPathPermanentlyClosedIntegrityPassed
  ) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before blueprint attestation.",
    });
  }

  if (
    era25FirstProductSliceBlueprintExecutionStarted &&
    !gatesIntegrity.linearChainTerminusGuardIntegrityPassed
  ) {
    violations.push({
      id: "linear_chain_terminus_guard_integrity_fail",
      detail: "Linear chain terminus guard integrity FAIL — complete Phase Q before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.era25CharterExitIntegrityPassed) {
    violations.push({
      id: "era25_charter_exit_integrity_fail",
      detail: "Era25 charter exit integrity FAIL — complete Phase R before blueprint attestation.",
    });
  }

  if (
    era25FirstProductSliceBlueprintExecutionStarted &&
    !gatesIntegrity.era25FirstCharterSliceIntegrityPassed
  ) {
    violations.push({
      id: "era25_first_charter_slice_integrity_fail",
      detail: "Era25 first charter slice readiness integrity FAIL — complete Phase S before blueprint attestation.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !gatesIntegrity.integrityPassed) {
    violations.push({
      id: "era25_engineering_gates_integrity_fail",
      detail: "Era25 engineering gates integrity FAIL — complete Phase T before first product slice blueprint.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && !era25FirstProductSliceBlueprintHonest) {
    violations.push({
      id: "blueprint_started_without_gates_open",
      detail: gatesOpenHonest
        ? "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_* env present but engineering gates integrity FAIL — fix Phase T first."
        : "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_* env present but era25 engineering gates are not open — finish gates with signed charter first.",
    });
  }

  if (era25FirstProductSliceBlueprintExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "era25_engineering_gates_prerequisite_not_complete",
      detail: `Blueprint started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    blueprintAttested &&
    era25FirstProductSliceBlueprintExecutionStarted &&
    (!era25FirstProductSliceBlueprintHonest || !gatesIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_blueprint_attestation",
      detail:
        "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED=1 before honest engineering gates open — never attest blueprint without ops:validate-era25-engineering-gates-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25FirstProductSliceBlueprintExecutionStarted &&
    (!era25FirstProductSliceBlueprintHonest || !gatesIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_blueprint_report_attestation",
      detail:
        "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_REVIEWED=1 before gates integrity PASS — never attest blueprint report without ops:validate-era25-first-product-slice-blueprint-integrity PASS.",
    });
  }

  if (
    baseline?.era25FirstProductSliceBlueprintExecutionHonest &&
    (!goHonest || !era25FirstProductSliceBlueprintHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest blueprint at ${baseline.recordedAt} but GO/engineering gates are no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_POLICY_ID,
    integrityPassed,
    era25FirstProductSliceBlueprintExecutionStarted,
    era25FirstProductSliceBlueprintComplete: era25FirstProductSliceBlueprintHonest,
    era25EngineeringGatesActive: gatesOpenHonest,
    era25EngineeringGatesIntegrityPassed: gatesIntegrity.integrityPassed,
    era25FirstCharterSliceIntegrityPassed: gatesIntegrity.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityPassed: gatesIntegrity.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityPassed: gatesIntegrity.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      gatesIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      gatesIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: gatesIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: gatesIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: gatesIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: gatesIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: gatesIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: gatesIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: gatesIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: gatesIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: gatesIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: gatesIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: gatesIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: gatesIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-first-product-slice-blueprint-integrity -- --json",
      "npm run ops:validate-era25-engineering-gates-integrity -- --json",
      "npm run ops:validate-era25-first-product-slice-blueprint -- --json",
      "npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json",
      "npm run ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator -- --write",
      "npm run ops:sync-era25-first-product-slice-blueprint-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
