/**
 * Linear chain terminus guard integrity — blocks Step 17 FORBIDDEN attestation without honest Linear path permanently closed.
 * Policy: era41-linear-chain-terminus-guard-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { detectLinearChainTerminusGuardStarted } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  evaluateLinearPathPermanentlyClosedIntegrity,
  type LinearPathPermanentlyClosedIntegrityBaseline,
} from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";
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

export const LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID =
  "era41-linear-chain-terminus-guard-integrity-v1" as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/linear-chain-terminus-guard-integrity-baseline.json" as const;

export type LinearChainTerminusGuardIntegrityViolationId =
  | "linear_path_permanently_closed_prerequisite_not_complete"
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
  | "terminus_guard_started_without_linear_path_closed"
  | "fake_step17_forbidden_attestation"
  | "fake_terminus_guard_report_attestation"
  | "baseline_regression";

export type LinearChainTerminusGuardIntegrityViolation = {
  id: LinearChainTerminusGuardIntegrityViolationId;
  detail: string;
};

export type LinearChainTerminusGuardIntegrityBaseline = {
  linearChainTerminusGuardExecutionHonest: true;
  recordedAt: string;
  linearPathPermanentlyClosedCompleteAttested: true;
  goDecision: "GO";
};

export type LinearChainTerminusGuardIntegritySummary = {
  policyId: typeof LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID;
  integrityPassed: boolean;
  linearChainTerminusGuardExecutionStarted: boolean;
  linearChainTerminusGuardComplete: boolean;
  linearPathPermanentlyClosedActive: boolean;
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
  violations: readonly LinearChainTerminusGuardIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly LinearChainTerminusGuardIntegrityViolationId[] = [
  "linear_path_permanently_closed_prerequisite_not_complete",
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
  "terminus_guard_started_without_linear_path_closed",
  "fake_step17_forbidden_attestation",
  "fake_terminus_guard_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): LinearChainTerminusGuardIntegrityBaseline | null {
  try {
    const path = join(root, LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as LinearChainTerminusGuardIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateLinearChainTerminusGuardIntegrity(
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
    baselineOverride?: LinearChainTerminusGuardIntegrityBaseline | null;
  },
): LinearChainTerminusGuardIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const linearPathIntegrity = evaluateLinearPathPermanentlyClosedIntegrity(root, {
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
    baselineOverride: options?.linearPathPermanentlyClosedIntegrityBaselineOverride,
  });

  const goDecision = linearPathIntegrity.goDecision;
  const goHonest = goDecision === "GO" && linearPathIntegrity.goIntegrityPassed;
  const linearChainTerminusGuardExecutionStarted = detectLinearChainTerminusGuardStarted(env);
  const step17ForbiddenAttested = parseEnvBoolean(
    env.LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(env.LINEAR_CHAIN_TERMINUS_GUARD_REPORT_REVIEWED);
  const linearChainTerminusGuardHonest =
    linearPathIntegrity.linearPathPermanentlyClosedComplete &&
    linearPathIntegrity.integrityPassed;

  const violations: LinearChainTerminusGuardIntegrityViolation[] = [];

  if (
    linearChainTerminusGuardExecutionStarted &&
    goDecision === "GO" &&
    !linearPathIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before Step 17 FORBIDDEN attestation.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearPathIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before Step 17 FORBIDDEN.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearPathIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before Step 17 FORBIDDEN.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearPathIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before Step 17 FORBIDDEN.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearPathIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before Step 17 FORBIDDEN.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearPathIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before Step 17 FORBIDDEN.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearPathIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before Step 17 FORBIDDEN.",
    });
  }

  if (
    linearChainTerminusGuardExecutionStarted &&
    !linearPathIntegrity.improvementLoopIntegrityPassed
  ) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before Step 17 FORBIDDEN.",
    });
  }

  if (
    linearChainTerminusGuardExecutionStarted &&
    !linearPathIntegrity.productEvolutionIntegrityPassed
  ) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before Step 17 FORBIDDEN.",
    });
  }

  if (
    linearChainTerminusGuardExecutionStarted &&
    !linearPathIntegrity.maintenanceModeIntegrityPassed
  ) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before Step 17 FORBIDDEN.",
    });
  }

  if (
    linearChainTerminusGuardExecutionStarted &&
    !linearPathIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before Step 17 FORBIDDEN.",
    });
  }

  if (
    linearChainTerminusGuardExecutionStarted &&
    !linearPathIntegrity.postTerminusSteadyStateIntegrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before Step 17 FORBIDDEN.",
    });
  }

  if (
    linearChainTerminusGuardExecutionStarted &&
    !linearPathIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed
  ) {
    violations.push({
      id: "commercial_pilot_path_absolute_end_integrity_fail",
      detail: "Commercial pilot path absolute end integrity FAIL — complete Phase O before Step 17 FORBIDDEN.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearPathIntegrity.integrityPassed) {
    violations.push({
      id: "linear_path_permanently_closed_integrity_fail",
      detail: "Linear path permanently closed integrity FAIL — complete Phase P before Step 17 FORBIDDEN.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && !linearChainTerminusGuardHonest) {
    violations.push({
      id: "terminus_guard_started_without_linear_path_closed",
      detail: linearPathIntegrity.linearPathPermanentlyClosedComplete
        ? "LINEAR_CHAIN_TERMINUS_GUARD_* env present but Linear path permanently closed integrity FAIL — fix Phase P first."
        : "LINEAR_CHAIN_TERMINUS_GUARD_* env present but Step 16 linear path closure is not complete — finish terminal closure first.",
    });
  }

  if (linearChainTerminusGuardExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "linear_path_permanently_closed_prerequisite_not_complete",
      detail: `Linear chain terminus guard started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    step17ForbiddenAttested &&
    linearChainTerminusGuardExecutionStarted &&
    (!linearChainTerminusGuardHonest || !linearPathIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_step17_forbidden_attestation",
      detail:
        "LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED=1 before honest Linear path permanently closed — never attest Step 17 FORBIDDEN without ops:validate-linear-path-permanently-closed-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    linearChainTerminusGuardExecutionStarted &&
    (!linearChainTerminusGuardHonest || !linearPathIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_terminus_guard_report_attestation",
      detail:
        "LINEAR_CHAIN_TERMINUS_GUARD_REPORT_REVIEWED=1 before honest linear path closure — never attest terminus guard report without ops:validate-linear-chain-terminus-guard-integrity PASS.",
    });
  }

  if (
    baseline?.linearChainTerminusGuardExecutionHonest &&
    (!goHonest || !linearChainTerminusGuardHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Step 17 FORBIDDEN guard at ${baseline.recordedAt} but GO/linear path closure is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID,
    integrityPassed,
    linearChainTerminusGuardExecutionStarted,
    linearChainTerminusGuardComplete: linearChainTerminusGuardHonest,
    linearPathPermanentlyClosedActive: linearPathIntegrity.linearPathPermanentlyClosedComplete,
    linearPathPermanentlyClosedIntegrityPassed: linearPathIntegrity.integrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      linearPathIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityPassed: linearPathIntegrity.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityPassed: linearPathIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: linearPathIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: linearPathIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: linearPathIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: linearPathIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: linearPathIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: linearPathIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: linearPathIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: linearPathIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: linearPathIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: linearPathIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-linear-chain-terminus-guard-integrity -- --json",
      "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
      "npm run ops:validate-linear-chain-terminus-guard -- --json",
      "npm run ops:validate-linear-path-permanently-closed -- --json",
      "npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write",
      "npm run ops:sync-linear-chain-terminus-guard-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
