/**
 * Post-terminus steady state integrity — blocks Step 14 attestation without honest Engineering path terminus.
 * Policy: era38-post-terminus-steady-state-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  evaluateEngineeringPathTerminusIntegrity,
  type EngineeringPathTerminusIntegrityBaseline,
} from "@/lib/commercial/engineering-path-terminus-integrity-era37";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { detectPostTerminusSteadyStateStarted } from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { MaintenanceModeIntegrityBaseline } from "@/lib/commercial/maintenance-mode-integrity-era36";

export const POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID =
  "era38-post-terminus-steady-state-integrity-v1" as const;

export const POST_TERMINUS_STEADY_STATE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/post-terminus-steady-state-integrity-baseline.json" as const;

export type PostTerminusSteadyStateIntegrityViolationId =
  | "engineering_path_terminus_prerequisite_not_complete"
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
  | "steady_state_started_without_engineering_terminus"
  | "fake_operator_loop_attestation"
  | "fake_era_charter_attestation"
  | "baseline_regression";

export type PostTerminusSteadyStateIntegrityViolation = {
  id: PostTerminusSteadyStateIntegrityViolationId;
  detail: string;
};

export type PostTerminusSteadyStateIntegrityBaseline = {
  postTerminusSteadyStateExecutionHonest: true;
  recordedAt: string;
  engineeringPathTerminusCompleteAttested: true;
  goDecision: "GO";
};

export type PostTerminusSteadyStateIntegritySummary = {
  policyId: typeof POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID;
  integrityPassed: boolean;
  postTerminusSteadyStateExecutionStarted: boolean;
  postTerminusSteadyStateComplete: boolean;
  engineeringPathTerminusActive: boolean;
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
  violations: readonly PostTerminusSteadyStateIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly PostTerminusSteadyStateIntegrityViolationId[] = [
  "engineering_path_terminus_prerequisite_not_complete",
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
  "steady_state_started_without_engineering_terminus",
  "fake_operator_loop_attestation",
  "fake_era_charter_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(root: string): PostTerminusSteadyStateIntegrityBaseline | null {
  try {
    const path = join(root, POST_TERMINUS_STEADY_STATE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as PostTerminusSteadyStateIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluatePostTerminusSteadyStateIntegrity(
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
    baselineOverride?: PostTerminusSteadyStateIntegrityBaseline | null;
  },
): PostTerminusSteadyStateIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const engineeringPathTerminusIntegrity = evaluateEngineeringPathTerminusIntegrity(root, {
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
    baselineOverride: options?.engineeringPathTerminusIntegrityBaselineOverride,
  });

  const goDecision = engineeringPathTerminusIntegrity.goDecision;
  const goHonest = goDecision === "GO" && engineeringPathTerminusIntegrity.goIntegrityPassed;
  const postTerminusSteadyStateExecutionStarted = detectPostTerminusSteadyStateStarted(env);
  const operatorLoopAttested = parseEnvBoolean(env.POST_TERMINUS_STEADY_STATE_OPERATOR_LOOP_ATTESTED);
  const eraCharterReviewed = parseEnvBoolean(env.POST_TERMINUS_STEADY_STATE_ERA_CHARTER_REVIEWED);
  const postTerminusSteadyStateHonest =
    engineeringPathTerminusIntegrity.engineeringPathTerminusComplete &&
    engineeringPathTerminusIntegrity.integrityPassed;

  const violations: PostTerminusSteadyStateIntegrityViolation[] = [];

  if (postTerminusSteadyStateExecutionStarted && goDecision === "GO" && !engineeringPathTerminusIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before post-terminus steady state attestation.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.maintenanceModeIntegrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before post-terminus steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !engineeringPathTerminusIntegrity.integrityPassed) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before Step 14 steady state.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && !postTerminusSteadyStateHonest) {
    violations.push({
      id: "steady_state_started_without_engineering_terminus",
      detail: engineeringPathTerminusIntegrity.engineeringPathTerminusComplete
        ? "POST_TERMINUS_STEADY_STATE_* env present but Engineering path terminus integrity FAIL — fix Phase M first."
        : "POST_TERMINUS_STEADY_STATE_* env present but Step 13 engineering path terminus is not complete — finish master path first.",
    });
  }

  if (postTerminusSteadyStateExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "engineering_path_terminus_prerequisite_not_complete",
      detail: `Post-terminus steady state started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    operatorLoopAttested &&
    postTerminusSteadyStateExecutionStarted &&
    (!postTerminusSteadyStateHonest || !engineeringPathTerminusIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_operator_loop_attestation",
      detail:
        "POST_TERMINUS_STEADY_STATE_OPERATOR_LOOP_ATTESTED=1 before honest Engineering path terminus — never attest operator loop without ops:validate-engineering-path-terminus-integrity PASS.",
    });
  }

  if (
    eraCharterReviewed &&
    postTerminusSteadyStateExecutionStarted &&
    (!postTerminusSteadyStateHonest || !engineeringPathTerminusIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_era_charter_attestation",
      detail:
        "POST_TERMINUS_STEADY_STATE_ERA_CHARTER_REVIEWED=1 before honest Engineering path terminus — never attest era charter without ops:validate-post-terminus-steady-state-integrity PASS.",
    });
  }

  if (baseline?.postTerminusSteadyStateExecutionHonest && (!goHonest || !postTerminusSteadyStateHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest post-terminus steady state at ${baseline.recordedAt} but GO/Engineering path terminus is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID,
    integrityPassed,
    postTerminusSteadyStateExecutionStarted,
    postTerminusSteadyStateComplete: postTerminusSteadyStateHonest,
    engineeringPathTerminusActive: engineeringPathTerminusIntegrity.engineeringPathTerminusComplete,
    engineeringPathTerminusIntegrityPassed: engineeringPathTerminusIntegrity.integrityPassed,
    maintenanceModeIntegrityPassed: engineeringPathTerminusIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: engineeringPathTerminusIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: engineeringPathTerminusIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: engineeringPathTerminusIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: engineeringPathTerminusIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: engineeringPathTerminusIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: engineeringPathTerminusIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: engineeringPathTerminusIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: engineeringPathTerminusIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: engineeringPathTerminusIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
      "npm run ops:validate-engineering-path-terminus-integrity -- --json",
      "npm run ops:validate-steady-state-operator-loop -- --json",
      "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
      "npm run ops:sync-steady-state-operator-loop-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
