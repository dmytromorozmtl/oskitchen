/**
 * Linear path permanently closed integrity — blocks Step 16 attestation without honest Commercial pilot path absolute end.
 * Policy: era40-linear-path-permanently-closed-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  evaluateCommercialPilotPathAbsoluteEndIntegrity,
  type CommercialPilotPathAbsoluteEndIntegrityBaseline,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";
import { detectLinearPathPermanentlyClosedStarted } from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
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

export const LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID =
  "era40-linear-path-permanently-closed-integrity-v1" as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/linear-path-permanently-closed-integrity-baseline.json" as const;

export type LinearPathPermanentlyClosedIntegrityViolationId =
  | "commercial_pilot_path_absolute_end_prerequisite_not_complete"
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
  | "linear_path_closed_started_without_absolute_end"
  | "fake_terminal_closure_attestation"
  | "fake_linear_path_closed_report_attestation"
  | "baseline_regression";

export type LinearPathPermanentlyClosedIntegrityViolation = {
  id: LinearPathPermanentlyClosedIntegrityViolationId;
  detail: string;
};

export type LinearPathPermanentlyClosedIntegrityBaseline = {
  linearPathPermanentlyClosedExecutionHonest: true;
  recordedAt: string;
  commercialPilotPathAbsoluteEndCompleteAttested: true;
  goDecision: "GO";
};

export type LinearPathPermanentlyClosedIntegritySummary = {
  policyId: typeof LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID;
  integrityPassed: boolean;
  linearPathPermanentlyClosedExecutionStarted: boolean;
  linearPathPermanentlyClosedComplete: boolean;
  commercialPilotPathAbsoluteEndActive: boolean;
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
  violations: readonly LinearPathPermanentlyClosedIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly LinearPathPermanentlyClosedIntegrityViolationId[] = [
  "commercial_pilot_path_absolute_end_prerequisite_not_complete",
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
  "linear_path_closed_started_without_absolute_end",
  "fake_terminal_closure_attestation",
  "fake_linear_path_closed_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): LinearPathPermanentlyClosedIntegrityBaseline | null {
  try {
    const path = join(root, LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as LinearPathPermanentlyClosedIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateLinearPathPermanentlyClosedIntegrity(
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
    baselineOverride?: LinearPathPermanentlyClosedIntegrityBaseline | null;
  },
): LinearPathPermanentlyClosedIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const absoluteEndIntegrity = evaluateCommercialPilotPathAbsoluteEndIntegrity(root, {
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
    baselineOverride: options?.commercialPilotPathAbsoluteEndIntegrityBaselineOverride,
  });

  const goDecision = absoluteEndIntegrity.goDecision;
  const goHonest = goDecision === "GO" && absoluteEndIntegrity.goIntegrityPassed;
  const linearPathPermanentlyClosedExecutionStarted = detectLinearPathPermanentlyClosedStarted(env);
  const terminalClosureAttested = parseEnvBoolean(
    env.LINEAR_PATH_PERMANENTLY_CLOSED_TERMINAL_CLOSURE_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(env.LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_REVIEWED);
  const linearPathPermanentlyClosedHonest =
    absoluteEndIntegrity.commercialPilotPathAbsoluteEndComplete &&
    absoluteEndIntegrity.integrityPassed;

  const violations: LinearPathPermanentlyClosedIntegrityViolation[] = [];

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    goDecision === "GO" &&
    !absoluteEndIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before linear path closure attestation.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.week1IntegrityPassed
  ) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.month2IntegrityPassed
  ) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.scaleIntegrityPassed
  ) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.seriesAIntegrityPassed
  ) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.marketLeaderIntegrityPassed
  ) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.sustainedOpsIntegrityPassed
  ) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.improvementLoopIntegrityPassed
  ) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.productEvolutionIntegrityPassed
  ) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.maintenanceModeIntegrityPassed
  ) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before Step 16 linear path closure.",
    });
  }

  if (
    linearPathPermanentlyClosedExecutionStarted &&
    !absoluteEndIntegrity.integrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before Step 16 linear path closure.",
    });
  }

  if (linearPathPermanentlyClosedExecutionStarted && !linearPathPermanentlyClosedHonest) {
    violations.push({
      id: "linear_path_closed_started_without_absolute_end",
      detail: absoluteEndIntegrity.commercialPilotPathAbsoluteEndComplete
        ? "LINEAR_PATH_PERMANENTLY_CLOSED_* env present but Commercial pilot path absolute end integrity FAIL — fix Phase O first."
        : "LINEAR_PATH_PERMANENTLY_CLOSED_* env present but Step 15 absolute end is not complete — finish path closure first.",
    });
  }

  if (linearPathPermanentlyClosedExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "commercial_pilot_path_absolute_end_prerequisite_not_complete",
      detail: `Linear path permanently closed started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    terminalClosureAttested &&
    linearPathPermanentlyClosedExecutionStarted &&
    (!linearPathPermanentlyClosedHonest || !absoluteEndIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_terminal_closure_attestation",
      detail:
        "LINEAR_PATH_PERMANENTLY_CLOSED_TERMINAL_CLOSURE_ATTESTED=1 before honest Commercial pilot path absolute end — never attest terminal closure without ops:validate-commercial-pilot-path-absolute-end-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    linearPathPermanentlyClosedExecutionStarted &&
    (!linearPathPermanentlyClosedHonest || !absoluteEndIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_linear_path_closed_report_attestation",
      detail:
        "LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_REVIEWED=1 before honest absolute end — never attest linear path report without ops:validate-linear-path-permanently-closed-integrity PASS.",
    });
  }

  if (
    baseline?.linearPathPermanentlyClosedExecutionHonest &&
    (!goHonest || !linearPathPermanentlyClosedHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest linear path closure at ${baseline.recordedAt} but GO/absolute end is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID,
    integrityPassed,
    linearPathPermanentlyClosedExecutionStarted,
    linearPathPermanentlyClosedComplete: linearPathPermanentlyClosedHonest,
    commercialPilotPathAbsoluteEndActive: absoluteEndIntegrity.commercialPilotPathAbsoluteEndComplete,
    commercialPilotPathAbsoluteEndIntegrityPassed: absoluteEndIntegrity.integrityPassed,
    postTerminusSteadyStateIntegrityPassed: absoluteEndIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: absoluteEndIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: absoluteEndIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: absoluteEndIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: absoluteEndIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: absoluteEndIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: absoluteEndIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: absoluteEndIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: absoluteEndIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: absoluteEndIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: absoluteEndIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: absoluteEndIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
      "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
      "npm run ops:validate-linear-path-permanently-closed -- --json",
      "npm run ops:validate-linear-chain-terminus-guard -- --json",
      "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
      "npm run ops:sync-linear-path-permanently-closed-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
