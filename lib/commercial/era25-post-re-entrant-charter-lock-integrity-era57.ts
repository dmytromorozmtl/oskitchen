/**
 * Era25 post-re-entrant operator charter lock integrity — freeze era25 env after honest re-entrant.
 * Policy: era57-era25-post-re-entrant-charter-lock-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  detectEra25FrozenEnvMutationAfterCharterLock,
  detectEra25PostReentrantCharterLockStarted,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-phases-era57";
import {
  evaluateSustainedProductEvolutionReentrantIntegrity,
  type SustainedProductEvolutionReentrantIntegrityBaseline,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID =
  "era57-era25-post-re-entrant-charter-lock-integrity-v1" as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-post-re-entrant-charter-lock-integrity-baseline.json" as const;

export type Era25PostReentrantCharterLockIntegrityViolationId =
  | "sustained_product_evolution_reentrant_integrity_fail"
  | "era25_commercial_pilot_convergence_train_closure_integrity_fail"
  | "go_integrity_fail"
  | "charter_lock_without_reentrant_honest"
  | "era25_linear_env_mutation_after_lock"
  | "fake_charter_lock_attestation"
  | "fake_charter_lock_report_attestation"
  | "baseline_regression";

export type Era25PostReentrantCharterLockIntegrityViolation = {
  id: Era25PostReentrantCharterLockIntegrityViolationId;
  detail: string;
};

export type Era25PostReentrantCharterLockIntegrityBaseline = {
  era25PostReentrantCharterLockHonest: true;
  recordedAt: string;
  reentrantEvolutionHonestAttested: true;
  frozenEnvKeyCount: number;
  goDecision: "GO";
};

export type Era25PostReentrantCharterLockIntegritySummary = {
  policyId: typeof ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID;
  integrityPassed: boolean;
  era25PostReentrantCharterLockExecutionStarted: boolean;
  era25PostReentrantCharterLockComplete: boolean;
  sustainedProductEvolutionReentrantComplete: boolean;
  sustainedProductEvolutionReentrantIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25PostReentrantCharterLockIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25PostReentrantCharterLockIntegrityViolationId[] = [
  "sustained_product_evolution_reentrant_integrity_fail",
  "era25_commercial_pilot_convergence_train_closure_integrity_fail",
  "go_integrity_fail",
  "charter_lock_without_reentrant_honest",
  "era25_linear_env_mutation_after_lock",
  "fake_charter_lock_attestation",
  "fake_charter_lock_report_attestation",
  "baseline_regression",
];

function readCharterLockIntegrityBaseline(
  root: string,
): Era25PostReentrantCharterLockIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25PostReentrantCharterLockIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamReentrantViolations(
  violations: Era25PostReentrantCharterLockIntegrityViolation[],
  reentrantIntegrity: ReturnType<typeof evaluateSustainedProductEvolutionReentrantIntegrity>,
): void {
  if (!reentrantIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before era25 post-re-entrant charter lock attest.",
    });
  }
  if (!reentrantIntegrity.integrityPassed) {
    violations.push({
      id: "sustained_product_evolution_reentrant_integrity_fail",
      detail: "Sustained product evolution re-entrant integrity FAIL — complete Phase AF before charter lock.",
    });
  }
  if (!reentrantIntegrity.era25CommercialPilotConvergenceTrainClosureIntegrityPassed) {
    violations.push({
      id: "era25_commercial_pilot_convergence_train_closure_integrity_fail",
      detail: "Era25 commercial pilot convergence train closure integrity FAIL — complete Phase AE before charter lock.",
    });
  }
}

export function evaluateEra25PostReentrantCharterLockIntegrity(
  root: string = process.cwd(),
  options?: {
    env?: NodeJS.ProcessEnv;
    goNoGoOverride?: PilotGoNoGoSummary | null;
    p0StagingOverride?: P0StagingProofUnblockSummary | null;
    tier2SummaryOverride?: Tier2StagingGoldenPathSummary | null;
    metricsBaselineOverride?: PilotMetricsBaselineSummary | null;
    caseStudyDraftOverride?: PilotCaseStudyDraftSummary | null;
    investorOnepagerOverride?: InvestorOnepagerSummary | null;
    rollbackDrillOverride?: PilotRollbackDrillSummary | null;
    competitorMatrixOverride?: CompetitorFeatureGapMatrixSummary | null;
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    reentrantIntegrityBaselineOverride?: SustainedProductEvolutionReentrantIntegrityBaseline | null;
    baselineOverride?: Era25PostReentrantCharterLockIntegrityBaseline | null;
  },
): Era25PostReentrantCharterLockIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readCharterLockIntegrityBaseline(root);

  const reentrantIntegrity = evaluateSustainedProductEvolutionReentrantIntegrity(root, {
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
    baselineOverride: options?.reentrantIntegrityBaselineOverride,
  });

  const goDecision = reentrantIntegrity.goDecision;
  const goHonest = goDecision === "GO" && reentrantIntegrity.goIntegrityPassed;
  const era25PostReentrantCharterLockExecutionStarted = detectEra25PostReentrantCharterLockStarted(env);
  const charterLockAttested = parseEnvBoolean(env.ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(env.ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_REPORT_REVIEWED);
  const frozenEnvMutationDetected = detectEra25FrozenEnvMutationAfterCharterLock(env);
  const reentrantComplete = reentrantIntegrity.sustainedProductEvolutionReentrantComplete;
  const charterLockHonest =
    reentrantComplete &&
    reentrantIntegrity.integrityPassed &&
    !frozenEnvMutationDetected;
  const charterLockPathActive =
    baseline?.era25PostReentrantCharterLockHonest === true ||
    era25PostReentrantCharterLockExecutionStarted;

  const violations: Era25PostReentrantCharterLockIntegrityViolation[] = [];

  if (era25PostReentrantCharterLockExecutionStarted) {
    pushUpstreamReentrantViolations(violations, reentrantIntegrity);
  }

  if (era25PostReentrantCharterLockExecutionStarted && !reentrantComplete) {
    violations.push({
      id: "charter_lock_without_reentrant_honest",
      detail: "ERA25_POST_REENTRANT_CHARTER_LOCK_* env present but sustained product evolution re-entrant is not honest — complete Phase AF first.",
    });
  }

  if (charterLockPathActive && frozenEnvMutationDetected) {
    violations.push({
      id: "era25_linear_env_mutation_after_lock",
      detail:
        "Mutable era25 linear convergence or charter attest env keys detected after charter lock path is active — clear frozen env keys; evolution continues only via improvement loop surfaces.",
    });
  }

  if (era25PostReentrantCharterLockExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Charter lock started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (charterLockAttested && era25PostReentrantCharterLockExecutionStarted && !charterLockHonest) {
    violations.push({
      id: "fake_charter_lock_attestation",
      detail:
        "ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED=1 before honest re-entrant + frozen env guard PASS — never attest without ops:validate-era25-post-re-entrant-charter-lock-integrity PASS.",
    });
  }

  if (reportReviewed && era25PostReentrantCharterLockExecutionStarted && !charterLockHonest) {
    violations.push({
      id: "fake_charter_lock_report_attestation",
      detail:
        "ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_REPORT_REVIEWED=1 before charter lock integrity PASS — never attest report without ops:validate-era25-post-re-entrant-charter-lock-integrity PASS.",
    });
  }

  if (
    baseline?.era25PostReentrantCharterLockHonest &&
    (!goHonest || !reentrantComplete || frozenEnvMutationDetected)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest charter lock at ${baseline.recordedAt} but re-entrant / GO / frozen-env guard is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID,
    integrityPassed,
    era25PostReentrantCharterLockExecutionStarted,
    era25PostReentrantCharterLockComplete: charterLockHonest && reentrantIntegrity.integrityPassed,
    sustainedProductEvolutionReentrantComplete: reentrantComplete,
    sustainedProductEvolutionReentrantIntegrityPassed: reentrantIntegrity.integrityPassed,
    frozenEnvMutationDetected,
    goDecision,
    goIntegrityPassed: reentrantIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json",
      "npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json",
      "npm run ops:validate-era25-commercial-pilot-convergence-train-closure-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
