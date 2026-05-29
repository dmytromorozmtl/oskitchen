/**
 * Era25 steady-state operator loop convergence lock integrity.
 * Policy: era58-era25-steady-state-operator-loop-lock-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  evaluateEra25PostReentrantCharterLockIntegrity,
  type Era25PostReentrantCharterLockIntegrityBaseline,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";
import {
  detectEra25FrozenEnvMutationAfterSteadyStateLoopLock,
  detectEra25SteadyStateOperatorLoopLockStarted,
  detectImprovementLoopRhythmMutationAfterSteadyStateLock,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-phases-era58";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { resolveContinuousImprovementLoopActive } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_POLICY_ID =
  "era58-era25-steady-state-operator-loop-lock-integrity-v1" as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-steady-state-operator-loop-lock-integrity-baseline.json" as const;

export type Era25SteadyStateOperatorLoopLockIntegrityViolationId =
  | "era25_post_reentrant_charter_lock_integrity_fail"
  | "continuous_improvement_loop_integrity_fail"
  | "go_integrity_fail"
  | "steady_state_lock_without_charter_lock"
  | "era25_frozen_env_mutation_after_steady_state_lock"
  | "improvement_loop_rhythm_mutation_after_lock"
  | "fake_steady_state_lock_attestation"
  | "fake_steady_state_lock_report_attestation"
  | "baseline_regression";

export type Era25SteadyStateOperatorLoopLockIntegrityViolation = {
  id: Era25SteadyStateOperatorLoopLockIntegrityViolationId;
  detail: string;
};

export type Era25SteadyStateOperatorLoopLockIntegrityBaseline = {
  era25SteadyStateOperatorLoopLockHonest: true;
  recordedAt: string;
  charterLockHonestAttested: true;
  improvementLoopRhythmHonestAttested: true;
  frozenEnvKeyCount: number;
  goDecision: "GO";
};

export type Era25SteadyStateOperatorLoopLockIntegritySummary = {
  policyId: typeof ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_POLICY_ID;
  integrityPassed: boolean;
  era25SteadyStateOperatorLoopLockExecutionStarted: boolean;
  era25SteadyStateOperatorLoopLockComplete: boolean;
  era25PostReentrantCharterLockComplete: boolean;
  era25PostReentrantCharterLockIntegrityPassed: boolean;
  improvementLoopActive: boolean;
  improvementLoopIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  improvementLoopRhythmMutationDetected: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25SteadyStateOperatorLoopLockIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25SteadyStateOperatorLoopLockIntegrityViolationId[] = [
  "era25_post_reentrant_charter_lock_integrity_fail",
  "continuous_improvement_loop_integrity_fail",
  "go_integrity_fail",
  "steady_state_lock_without_charter_lock",
  "era25_frozen_env_mutation_after_steady_state_lock",
  "improvement_loop_rhythm_mutation_after_lock",
  "fake_steady_state_lock_attestation",
  "fake_steady_state_lock_report_attestation",
  "baseline_regression",
];

function readSteadyStateLoopLockIntegrityBaseline(
  root: string,
): Era25SteadyStateOperatorLoopLockIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25SteadyStateOperatorLoopLockIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamCharterLockViolations(
  violations: Era25SteadyStateOperatorLoopLockIntegrityViolation[],
  charterLockIntegrity: ReturnType<typeof evaluateEra25PostReentrantCharterLockIntegrity>,
): void {
  if (!charterLockIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before era25 steady-state operator loop lock attest.",
    });
  }
  if (!charterLockIntegrity.integrityPassed) {
    violations.push({
      id: "era25_post_reentrant_charter_lock_integrity_fail",
      detail: "Era25 post-re-entrant charter lock integrity FAIL — complete Phase AG before steady-state loop lock.",
    });
  }
  if (!charterLockIntegrity.sustainedProductEvolutionReentrantIntegrityPassed) {
    violations.push({
      id: "era25_post_reentrant_charter_lock_integrity_fail",
      detail: "Upstream sustained product evolution re-entrant integrity FAIL — complete Phase AF before steady-state loop lock.",
    });
  }
}

export function evaluateEra25SteadyStateOperatorLoopLockIntegrity(
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
    charterLockIntegrityBaselineOverride?: Era25PostReentrantCharterLockIntegrityBaseline | null;
    baselineOverride?: Era25SteadyStateOperatorLoopLockIntegrityBaseline | null;
  },
): Era25SteadyStateOperatorLoopLockIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readSteadyStateLoopLockIntegrityBaseline(root);

  const charterLockIntegrity = evaluateEra25PostReentrantCharterLockIntegrity(root, {
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
    baselineOverride: options?.charterLockIntegrityBaselineOverride,
  });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, {
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
  });

  const improvementLoopActive = resolveContinuousImprovementLoopActive({
    goNoGoSummary: options?.goNoGoOverride ?? null,
    p0Staging: options?.p0StagingOverride ?? null,
    tier2Summary: options?.tier2SummaryOverride ?? null,
    metricsBaseline: options?.metricsBaselineOverride ?? null,
    caseStudyDraft: options?.caseStudyDraftOverride ?? null,
    investorOnepager: options?.investorOnepagerOverride ?? null,
    rollbackDrill: options?.rollbackDrillOverride ?? null,
    competitorMatrix: options?.competitorMatrixOverride ?? null,
    env,
  });

  const goDecision = charterLockIntegrity.goDecision;
  const goHonest = goDecision === "GO" && charterLockIntegrity.goIntegrityPassed;
  const era25SteadyStateOperatorLoopLockExecutionStarted =
    detectEra25SteadyStateOperatorLoopLockStarted(env);
  const steadyStateLockAttested = parseEnvBoolean(
    env.ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_REPORT_REVIEWED,
  );
  const frozenEnvMutationDetected = detectEra25FrozenEnvMutationAfterSteadyStateLoopLock(env);
  const improvementLoopRhythmMutationDetected = detectImprovementLoopRhythmMutationAfterSteadyStateLock(
    {
      env,
      improvementLoopActive,
      improvementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    },
  );
  const charterLockComplete = charterLockIntegrity.era25PostReentrantCharterLockComplete;
  const steadyStateLockHonest =
    charterLockComplete &&
    charterLockIntegrity.integrityPassed &&
    improvementLoopActive &&
    improvementLoopIntegrity.integrityPassed &&
    !frozenEnvMutationDetected &&
    !improvementLoopRhythmMutationDetected;
  const steadyStateLockPathActive =
    baseline?.era25SteadyStateOperatorLoopLockHonest === true ||
    era25SteadyStateOperatorLoopLockExecutionStarted;

  const violations: Era25SteadyStateOperatorLoopLockIntegrityViolation[] = [];

  if (era25SteadyStateOperatorLoopLockExecutionStarted) {
    pushUpstreamCharterLockViolations(violations, charterLockIntegrity);
    if (!improvementLoopIntegrity.integrityPassed) {
      violations.push({
        id: "continuous_improvement_loop_integrity_fail",
        detail:
          "Continuous improvement loop integrity FAIL — complete improvement loop + sustained ops prerequisites before steady-state lock.",
      });
    }
  }

  if (era25SteadyStateOperatorLoopLockExecutionStarted && !charterLockComplete) {
    violations.push({
      id: "steady_state_lock_without_charter_lock",
      detail:
        "ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_* env present but post-re-entrant charter lock is not honest — complete Phase AG first.",
    });
  }

  if (steadyStateLockPathActive && frozenEnvMutationDetected) {
    violations.push({
      id: "era25_frozen_env_mutation_after_steady_state_lock",
      detail:
        "Mutable era25 charter / re-entrant / linear convergence env keys detected after steady-state lock path is active — clear frozen keys; sustain operator cadence only via improvement loop surfaces.",
    });
  }

  if (steadyStateLockPathActive && improvementLoopRhythmMutationDetected) {
    violations.push({
      id: "improvement_loop_rhythm_mutation_after_lock",
      detail:
        "CONTINUOUS_IMPROVEMENT_LOOP_* env keys present while improvement loop prerequisites are not honest — clear cadence attest env or restore loop integrity before steady-state lock path continues.",
    });
  }

  if (era25SteadyStateOperatorLoopLockExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Steady-state lock started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    steadyStateLockAttested &&
    era25SteadyStateOperatorLoopLockExecutionStarted &&
    !steadyStateLockHonest
  ) {
    violations.push({
      id: "fake_steady_state_lock_attestation",
      detail:
        "ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED=1 before honest charter lock + improvement loop rhythm guard PASS — never attest without ops:validate-era25-steady-state-operator-loop-lock-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25SteadyStateOperatorLoopLockExecutionStarted &&
    !steadyStateLockHonest
  ) {
    violations.push({
      id: "fake_steady_state_lock_report_attestation",
      detail:
        "ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_REPORT_REVIEWED=1 before steady-state lock integrity PASS — never attest report without ops:validate-era25-steady-state-operator-loop-lock-integrity PASS.",
    });
  }

  if (
    baseline?.era25SteadyStateOperatorLoopLockHonest &&
    (!goHonest ||
      !charterLockComplete ||
      !improvementLoopActive ||
      frozenEnvMutationDetected ||
      improvementLoopRhythmMutationDetected)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest steady-state lock at ${baseline.recordedAt} but charter lock / GO / improvement loop rhythm is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_POLICY_ID,
    integrityPassed,
    era25SteadyStateOperatorLoopLockExecutionStarted,
    era25SteadyStateOperatorLoopLockComplete:
      steadyStateLockHonest && charterLockIntegrity.integrityPassed,
    era25PostReentrantCharterLockComplete: charterLockComplete,
    era25PostReentrantCharterLockIntegrityPassed: charterLockIntegrity.integrityPassed,
    improvementLoopActive,
    improvementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    frozenEnvMutationDetected,
    improvementLoopRhythmMutationDetected,
    goDecision,
    goIntegrityPassed: charterLockIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json",
      "npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run ops:validate-steady-state-operator-loop",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
