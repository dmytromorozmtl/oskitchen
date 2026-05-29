/**
 * Engineering path terminus integrity — blocks master path attestation without honest Maintenance mode.
 * Policy: era37-engineering-path-terminus-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  detectEngineeringPathTerminusStarted,
} from "@/lib/commercial/engineering-path-terminus-era24";
import {
  resolveMaintenanceModePrerequisites,
  resolveProductEvolutionReady,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import {
  evaluateMaintenanceModeIntegrity,
  type MaintenanceModeIntegrityBaseline,
} from "@/lib/commercial/maintenance-mode-integrity-era36";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { resolveEra25PureOperationalModeContext } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID =
  "era37-engineering-path-terminus-integrity-v1" as const;

export const ENGINEERING_PATH_TERMINUS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/engineering-path-terminus-integrity-baseline.json" as const;

export type EngineeringPathTerminusIntegrityViolationId =
  | "maintenance_mode_prerequisite_not_complete"
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
  | "terminus_started_without_maintenance_mode"
  | "fake_status_report_attestation"
  | "baseline_regression";

export type EngineeringPathTerminusIntegrityViolation = {
  id: EngineeringPathTerminusIntegrityViolationId;
  detail: string;
};

export type EngineeringPathTerminusIntegrityBaseline = {
  engineeringPathTerminusExecutionHonest: true;
  recordedAt: string;
  maintenanceModeCompleteAttested: true;
  goDecision: "GO";
};

export type EngineeringPathTerminusIntegritySummary = {
  policyId: typeof ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID;
  integrityPassed: boolean;
  engineeringPathTerminusExecutionStarted: boolean;
  engineeringPathTerminusComplete: boolean;
  maintenanceModeActive: boolean;
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
  sustainedOpsConvergenceReady: boolean;
  gateStepsComplete: boolean | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly EngineeringPathTerminusIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly EngineeringPathTerminusIntegrityViolationId[] = [
  "maintenance_mode_prerequisite_not_complete",
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
  "terminus_started_without_maintenance_mode",
  "fake_status_report_attestation",
  "baseline_regression",
];

function readJsonFile<T>(root: string, relativePath: string): T | null {
  const path = join(root, relativePath);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function readIntegrityBaseline(root: string): EngineeringPathTerminusIntegrityBaseline | null {
  try {
    const path = join(root, ENGINEERING_PATH_TERMINUS_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as EngineeringPathTerminusIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateEngineeringPathTerminusIntegrity(
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
    baselineOverride?: EngineeringPathTerminusIntegrityBaseline | null;
    gateStepsCompleteOverride?: boolean | null;
  },
): EngineeringPathTerminusIntegritySummary {
  const env = options?.env ?? process.env;
  const goNoGo =
    options?.goNoGoOverride !== undefined
      ? options.goNoGoOverride
      : readJsonFile<PilotGoNoGoSummary>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  const p0Staging = options?.p0StagingOverride ?? null;
  const tier2 = options?.tier2SummaryOverride ?? null;
  const metrics = options?.metricsBaselineOverride ?? null;
  const caseStudy = options?.caseStudyDraftOverride ?? null;
  const investor = options?.investorOnepagerOverride ?? null;
  const rollback = options?.rollbackDrillOverride ?? null;
  const competitor = options?.competitorMatrixOverride ?? null;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const maintenanceModeIntegrity = evaluateMaintenanceModeIntegrity(root, {
    env,
    goNoGoOverride: goNoGo,
    p0StagingOverride: p0Staging,
    tier2SummaryOverride: tier2,
    metricsBaselineOverride: metrics,
    caseStudyDraftOverride: caseStudy,
    investorOnepagerOverride: investor,
    rollbackDrillOverride: rollback,
    competitorMatrixOverride: competitor,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
    baselineOverride: options?.maintenanceModeIntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && maintenanceModeIntegrity.goIntegrityPassed;
  const era25 = resolveEra25PureOperationalModeContext(env);
  const productEvolutionReady = resolveProductEvolutionReady({
    goNoGoSummary: goNoGo,
    p0Staging,
    tier2Summary: tier2,
    metricsBaseline: metrics,
    caseStudyDraft: caseStudy,
    investorOnepager: investor,
    rollbackDrill: rollback,
    competitorMatrix: competitor,
    env,
  });
  const prerequisites = resolveMaintenanceModePrerequisites({
    goDecision,
    productEvolutionReady,
    era25,
  });
  const engineeringPathTerminusCompleteFromPhases = prerequisites.maintenanceModeActive;
  const engineeringPathTerminusHonest =
    engineeringPathTerminusCompleteFromPhases && maintenanceModeIntegrity.integrityPassed;
  const engineeringPathTerminusExecutionStarted = detectEngineeringPathTerminusStarted(env);
  const statusReportReviewed = parseEnvBoolean(
    env.ENGINEERING_PATH_TERMINUS_STATUS_REPORT_REVIEWED,
  );

  const violations: EngineeringPathTerminusIntegrityViolation[] = [];

  if (engineeringPathTerminusExecutionStarted && goDecision === "GO" && !maintenanceModeIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before engineering path terminus attestation.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.productEvolutionIntegrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before engineering path terminus.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !maintenanceModeIntegrity.integrityPassed) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before master path orchestration.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && !engineeringPathTerminusHonest) {
    violations.push({
      id: "terminus_started_without_maintenance_mode",
      detail: engineeringPathTerminusCompleteFromPhases
        ? "ENGINEERING_PATH_TERMINUS_* env present but Maintenance mode integrity FAIL — fix Phase L first."
        : "ENGINEERING_PATH_TERMINUS_* env present but Step 12 maintenance mode is not complete — finish commercial pilot path first.",
    });
  }

  if (engineeringPathTerminusExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "maintenance_mode_prerequisite_not_complete",
      detail: `Engineering path terminus started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    statusReportReviewed &&
    engineeringPathTerminusExecutionStarted &&
    (!engineeringPathTerminusHonest || !maintenanceModeIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_status_report_attestation",
      detail:
        "ENGINEERING_PATH_TERMINUS_STATUS_REPORT_REVIEWED=1 before honest Maintenance mode — never attest status report without ops:validate-maintenance-mode-integrity PASS.",
    });
  }

  if (baseline?.engineeringPathTerminusExecutionHonest && (!goHonest || !engineeringPathTerminusHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest engineering path terminus at ${baseline.recordedAt} but GO/Maintenance mode is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID,
    integrityPassed,
    engineeringPathTerminusExecutionStarted,
    engineeringPathTerminusComplete: engineeringPathTerminusHonest,
    maintenanceModeActive: prerequisites.maintenanceModeActive,
    maintenanceModeIntegrityPassed: maintenanceModeIntegrity.integrityPassed,
    productEvolutionIntegrityPassed: maintenanceModeIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: maintenanceModeIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: maintenanceModeIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: maintenanceModeIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: maintenanceModeIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: maintenanceModeIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: maintenanceModeIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: maintenanceModeIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: maintenanceModeIntegrity.goIntegrityPassed,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    gateStepsComplete: options?.gateStepsCompleteOverride ?? null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-engineering-path-terminus-integrity -- --json",
      "npm run ops:validate-maintenance-mode-integrity -- --json",
      "npm run ops:validate-commercial-pilot-path -- --json",
      "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
      "npm run ops:sync-commercial-pilot-path-status-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
