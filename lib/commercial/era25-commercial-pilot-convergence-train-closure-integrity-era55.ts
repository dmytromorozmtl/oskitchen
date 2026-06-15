/**
 * Era25 commercial pilot convergence train closure integrity — rollup cert for era47–era54 baselines.
 * Policy: era55-era25-commercial-pilot-convergence-train-closure-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { resolvePureOperationalModeTerminusEra25MilestoneFromEnv } from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES,
  readConvergenceIntegrityBaseline,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55-registry";
import { detectEra25CommercialPilotConvergenceTrainClosureStarted } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-phases-era25";
import {
  evaluatePureOperationalModeTerminusConvergenceIntegrity,
  type PureOperationalModeTerminusConvergenceIntegrityBaseline,
} from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54";
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
import type { OwnerDailyBriefingBreakthroughIntegrityBaseline } from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";
import type { PaidPilotGoConvergenceIntegrityBaseline } from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";
import type { PilotWeek1ExecutionConvergenceIntegrityBaseline } from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";
import type { Month2MarketReadinessConvergenceIntegrityBaseline } from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";
import type { ScaleReadinessConvergenceIntegrityBaseline } from "@/lib/commercial/scale-readiness-convergence-integrity-era50";
import type { SeriesAPartnerExpansionConvergenceIntegrityBaseline } from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";
import type { MarketLeaderPositioningConvergenceIntegrityBaseline } from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";
import type { SustainedOperationalExcellenceConvergenceIntegrityBaseline } from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID =
  "era55-era25-commercial-pilot-convergence-train-closure-integrity-v1" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-commercial-pilot-convergence-train-closure-integrity-baseline.json" as const;

export type Era25CommercialPilotConvergenceTrainClosureIntegrityViolationId =
  | "pure_ops_terminus_convergence_integrity_fail"
  | "sustained_operational_excellence_convergence_integrity_fail"
  | "market_leader_positioning_convergence_integrity_fail"
  | "series_a_partner_expansion_convergence_integrity_fail"
  | "scale_readiness_convergence_integrity_fail"
  | "month2_market_readiness_convergence_integrity_fail"
  | "pilot_week1_execution_convergence_integrity_fail"
  | "paid_pilot_go_convergence_integrity_fail"
  | "go_integrity_fail"
  | "missing_convergence_integrity_baseline"
  | "convergence_integrity_baseline_not_honest"
  | "convergence_train_closure_without_pure_ops_active"
  | "fake_convergence_train_closure_attestation"
  | "fake_convergence_train_closure_report_attestation"
  | "baseline_regression";

export type Era25CommercialPilotConvergenceTrainClosureIntegrityViolation = {
  id: Era25CommercialPilotConvergenceTrainClosureIntegrityViolationId;
  detail: string;
};

export type Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline = {
  era25CommercialPilotConvergenceTrainClosureHonest: true;
  recordedAt: string;
  pureOperationalModeActiveAttested: true;
  convergenceIntegrityBaselineCount: 8;
  goDecision: "GO";
};

export type Era25CommercialPilotConvergenceTrainClosureIntegritySummary = {
  policyId: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID;
  integrityPassed: boolean;
  era25CommercialPilotConvergenceTrainClosureExecutionStarted: boolean;
  era25CommercialPilotConvergenceTrainClosureComplete: boolean;
  pureOperationalModeEra25Active: boolean;
  pureOperationalModeTerminusConvergenceIntegrityPassed: boolean;
  convergenceIntegrityBaselinesPresentCount: number;
  convergenceIntegrityBaselinesHonestCount: number;
  convergenceIntegrityBaselinesTotalCount: number;
  missingBaselineArtifacts: readonly string[];
  goDecision: string | null;
  goIntegrityPassed: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25CommercialPilotConvergenceTrainClosureIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25CommercialPilotConvergenceTrainClosureIntegrityViolationId[] =
  [
    "pure_ops_terminus_convergence_integrity_fail",
    "sustained_operational_excellence_convergence_integrity_fail",
    "market_leader_positioning_convergence_integrity_fail",
    "series_a_partner_expansion_convergence_integrity_fail",
    "scale_readiness_convergence_integrity_fail",
    "month2_market_readiness_convergence_integrity_fail",
    "pilot_week1_execution_convergence_integrity_fail",
    "paid_pilot_go_convergence_integrity_fail",
    "go_integrity_fail",
    "missing_convergence_integrity_baseline",
    "convergence_integrity_baseline_not_honest",
    "convergence_train_closure_without_pure_ops_active",
    "fake_convergence_train_closure_attestation",
    "fake_convergence_train_closure_report_attestation",
    "baseline_regression",
  ];

function readClosureIntegrityBaseline(
  root: string,
): Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamPureOpsIntegrityViolations(
  violations: Era25CommercialPilotConvergenceTrainClosureIntegrityViolation[],
  pureOpsIntegrity: ReturnType<typeof evaluatePureOperationalModeTerminusConvergenceIntegrity>,
): void {
  if (!pureOpsIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before era25 train closure attestation.",
    });
  }
  if (!pureOpsIntegrity.paidPilotGoConvergenceIntegrityPassed) {
    violations.push({
      id: "paid_pilot_go_convergence_integrity_fail",
      detail: "Paid pilot GO convergence integrity FAIL — complete Phase W before train closure.",
    });
  }
  if (!pureOpsIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed) {
    violations.push({
      id: "pilot_week1_execution_convergence_integrity_fail",
      detail: "Pilot week 1 convergence integrity FAIL — complete Phase X before train closure.",
    });
  }
  if (!pureOpsIntegrity.month2MarketReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "month2_market_readiness_convergence_integrity_fail",
      detail: "Month 2 convergence integrity FAIL — complete Phase Y before train closure.",
    });
  }
  if (!pureOpsIntegrity.scaleReadinessConvergenceIntegrityPassed) {
    violations.push({
      id: "scale_readiness_convergence_integrity_fail",
      detail: "Scale readiness convergence integrity FAIL — complete Phase Z before train closure.",
    });
  }
  if (!pureOpsIntegrity.seriesAPartnerExpansionConvergenceIntegrityPassed) {
    violations.push({
      id: "series_a_partner_expansion_convergence_integrity_fail",
      detail: "Series A convergence integrity FAIL — complete Phase AA before train closure.",
    });
  }
  if (!pureOpsIntegrity.marketLeaderPositioningConvergenceIntegrityPassed) {
    violations.push({
      id: "market_leader_positioning_convergence_integrity_fail",
      detail: "Market leader convergence integrity FAIL — complete Phase AB before train closure.",
    });
  }
  if (!pureOpsIntegrity.sustainedOperationalExcellenceConvergenceIntegrityPassed) {
    violations.push({
      id: "sustained_operational_excellence_convergence_integrity_fail",
      detail: "Sustained ops convergence integrity FAIL — complete Phase AC before train closure.",
    });
  }
}

export function evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(
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
    paidPilotGoConvergenceIntegrityBaselineOverride?: PaidPilotGoConvergenceIntegrityBaseline | null;
    pilotWeek1ExecutionConvergenceIntegrityBaselineOverride?: PilotWeek1ExecutionConvergenceIntegrityBaseline | null;
    month2MarketReadinessConvergenceIntegrityBaselineOverride?: Month2MarketReadinessConvergenceIntegrityBaseline | null;
    scaleReadinessConvergenceIntegrityBaselineOverride?: ScaleReadinessConvergenceIntegrityBaseline | null;
    seriesAPartnerExpansionConvergenceIntegrityBaselineOverride?: SeriesAPartnerExpansionConvergenceIntegrityBaseline | null;
    marketLeaderPositioningConvergenceIntegrityBaselineOverride?: MarketLeaderPositioningConvergenceIntegrityBaseline | null;
    sustainedOperationalExcellenceConvergenceIntegrityBaselineOverride?: SustainedOperationalExcellenceConvergenceIntegrityBaseline | null;
    pureOperationalModeTerminusConvergenceIntegrityBaselineOverride?: PureOperationalModeTerminusConvergenceIntegrityBaseline | null;
    baselineOverride?: Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline | null;
  },
): Era25CommercialPilotConvergenceTrainClosureIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readClosureIntegrityBaseline(root);

  const pureOpsIntegrity = evaluatePureOperationalModeTerminusConvergenceIntegrity(root, {
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
    ownerDailyBriefingBreakthroughIntegrityBaselineOverride:
      options?.ownerDailyBriefingBreakthroughIntegrityBaselineOverride,
    paidPilotGoConvergenceIntegrityBaselineOverride:
      options?.paidPilotGoConvergenceIntegrityBaselineOverride,
    pilotWeek1ExecutionConvergenceIntegrityBaselineOverride:
      options?.pilotWeek1ExecutionConvergenceIntegrityBaselineOverride,
    month2MarketReadinessConvergenceIntegrityBaselineOverride:
      options?.month2MarketReadinessConvergenceIntegrityBaselineOverride,
    scaleReadinessConvergenceIntegrityBaselineOverride:
      options?.scaleReadinessConvergenceIntegrityBaselineOverride,
    seriesAPartnerExpansionConvergenceIntegrityBaselineOverride:
      options?.seriesAPartnerExpansionConvergenceIntegrityBaselineOverride,
    marketLeaderPositioningConvergenceIntegrityBaselineOverride:
      options?.marketLeaderPositioningConvergenceIntegrityBaselineOverride,
    sustainedOperationalExcellenceConvergenceIntegrityBaselineOverride:
      options?.sustainedOperationalExcellenceConvergenceIntegrityBaselineOverride,
    baselineOverride: options?.pureOperationalModeTerminusConvergenceIntegrityBaselineOverride,
  });

  const pureOpsMilestone = resolvePureOperationalModeTerminusEra25MilestoneFromEnv(env);
  const pureOperationalModeEra25Active = pureOpsMilestone === "pure_operational_mode_era25_active";

  const parsedBaselines = ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES.map((entry) =>
    readConvergenceIntegrityBaseline(root, entry),
  );
  const convergenceIntegrityBaselinesPresentCount = parsedBaselines.filter((row) => row.present).length;
  const convergenceIntegrityBaselinesHonestCount = parsedBaselines.filter((row) => row.honest).length;
  const missingBaselineArtifacts = parsedBaselines
    .filter((row) => !row.present)
    .map((row) => row.artifactPath);

  const goDecision = pureOpsIntegrity.goDecision;
  const goHonest = goDecision === "GO" && pureOpsIntegrity.goIntegrityPassed;
  const era25CommercialPilotConvergenceTrainClosureExecutionStarted =
    detectEra25CommercialPilotConvergenceTrainClosureStarted(env);
  const trainClosureAttested = parseEnvBoolean(
    env.ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_REPORT_REVIEWED,
  );
  const allConvergenceBaselinesHonest =
    convergenceIntegrityBaselinesHonestCount ===
    ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES.length;
  const trainClosureHonest =
    pureOperationalModeEra25Active &&
    pureOpsIntegrity.integrityPassed &&
    allConvergenceBaselinesHonest;

  const violations: Era25CommercialPilotConvergenceTrainClosureIntegrityViolation[] = [];

  if (era25CommercialPilotConvergenceTrainClosureExecutionStarted) {
    pushUpstreamPureOpsIntegrityViolations(violations, pureOpsIntegrity);
  }

  if (era25CommercialPilotConvergenceTrainClosureExecutionStarted && !pureOpsIntegrity.integrityPassed) {
    violations.push({
      id: "pure_ops_terminus_convergence_integrity_fail",
      detail: "Pure operational mode terminus convergence integrity FAIL — complete Phase AD before train closure.",
    });
  }

  for (const entry of ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES) {
    const parsed = readConvergenceIntegrityBaseline(root, entry);
    if (era25CommercialPilotConvergenceTrainClosureExecutionStarted && !parsed.present) {
      violations.push({
        id: "missing_convergence_integrity_baseline",
        detail: `Missing ${entry.phaseLabel} baseline at ${entry.artifactPath} — run ${entry.syncBaselineCommand} after honest ${entry.validateIntegrityCommand} PASS.`,
      });
    }
    if (
      era25CommercialPilotConvergenceTrainClosureExecutionStarted &&
      parsed.present &&
      !parsed.honest
    ) {
      violations.push({
        id: "convergence_integrity_baseline_not_honest",
        detail: `${entry.phaseLabel} baseline at ${entry.artifactPath} is present but not honest GO — re-sync with ${entry.syncBaselineCommand}.`,
      });
    }
  }

  if (era25CommercialPilotConvergenceTrainClosureExecutionStarted && !trainClosureHonest) {
    violations.push({
      id: "convergence_train_closure_without_pure_ops_active",
      detail: pureOperationalModeEra25Active
        ? "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_* env present but convergence integrity chain or baselines are not honest — fix era47–era54 first."
        : "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_* env present but pure_operational_mode_era25_active is not achieved — finish pure ops terminus orchestration first.",
    });
  }

  if (era25CommercialPilotConvergenceTrainClosureExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Train closure started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    trainClosureAttested &&
    era25CommercialPilotConvergenceTrainClosureExecutionStarted &&
    (!trainClosureHonest || !pureOpsIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_convergence_train_closure_attestation",
      detail:
        "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED=1 before honest pure ops + era47–era54 baselines — never attest train closure without ops:validate-era25-commercial-pilot-convergence-train-closure-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25CommercialPilotConvergenceTrainClosureExecutionStarted &&
    (!trainClosureHonest || !allConvergenceBaselinesHonest)
  ) {
    violations.push({
      id: "fake_convergence_train_closure_report_attestation",
      detail:
        "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_REPORT_REVIEWED=1 before train closure integrity PASS — never attest report without ops:validate-era25-commercial-pilot-convergence-train-closure-integrity PASS.",
    });
  }

  if (
    baseline?.era25CommercialPilotConvergenceTrainClosureHonest &&
    (!goHonest || !pureOperationalModeEra25Active || !allConvergenceBaselinesHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest train closure at ${baseline.recordedAt} but GO/pure ops/baselines are no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID,
    integrityPassed,
    era25CommercialPilotConvergenceTrainClosureExecutionStarted,
    era25CommercialPilotConvergenceTrainClosureComplete:
      trainClosureHonest && pureOpsIntegrity.integrityPassed,
    pureOperationalModeEra25Active,
    pureOperationalModeTerminusConvergenceIntegrityPassed: pureOpsIntegrity.integrityPassed,
    convergenceIntegrityBaselinesPresentCount,
    convergenceIntegrityBaselinesHonestCount,
    convergenceIntegrityBaselinesTotalCount:
      ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES.length,
    missingBaselineArtifacts,
    goDecision,
    goIntegrityPassed: pureOpsIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-commercial-pilot-convergence-train-closure-integrity -- --json",
      "npm run ops:validate-pure-operational-mode-terminus-convergence-integrity -- --json",
      ...ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES.map(
        (entry) => entry.validateIntegrityCommand,
      ),
      ...ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES.map(
        (entry) => entry.syncBaselineCommand,
      ),
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
