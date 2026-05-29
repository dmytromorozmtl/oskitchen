/**
 * Era25 steady-state operator loop lock UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25SteadyStateOperatorLoopLockIntegrity } from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";
import {
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_DOC,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_FOREVER_COMMANDS,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_GUARDRAILS,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BACKLOG_ID,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_PLATFORM_ANCHOR,
  detectEra25SteadyStateOperatorLoopLockStarted,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-phases-era58";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-steady-state-operator-loop-lock-era58";

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_UI_POLICY_ID =
  "era25-steady-state-operator-loop-lock-ui-v1" as const;

export type Era25SteadyStateOperatorLoopLockEra25UiSlice = {
  policyId: typeof ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_UI_POLICY_ID;
  visible: boolean;
  charterLockComplete: boolean;
  steadyStateLockBlocked: boolean;
  steadyStateLockComplete: boolean;
  improvementLoopActive: boolean;
  frozenEnvMutationDetected: boolean;
  improvementLoopRhythmMutationDetected: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_DOC;
  backlogId: typeof ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BACKLOG_ID;
  guardrails: typeof ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_GUARDRAILS;
  foreverCommands: typeof ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateCharterLockIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  validateSteadyStateOperatorLoopCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25SteadyStateOperatorLoopLockIntegrityPassed: boolean;
  era25PostReentrantCharterLockIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
};

export function buildEra25SteadyStateOperatorLoopLockEra25UiSlice(input: {
  postReentrantCharterLockVisible: boolean;
  charterLockComplete: boolean;
  env?: NodeJS.ProcessEnv;
  goNoGoSummary?: PilotGoNoGoSummary | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
}): Era25SteadyStateOperatorLoopLockEra25UiSlice | null {
  const env = input.env ?? process.env;
  const steadyStateLockStarted = detectEra25SteadyStateOperatorLoopLockStarted(env);

  if (!input.postReentrantCharterLockVisible && !steadyStateLockStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const steadyStateIntegrity = evaluateEra25SteadyStateOperatorLoopLockIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary ?? null,
    p0StagingOverride: input.p0Staging ?? null,
    tier2SummaryOverride: input.tier2Summary ?? null,
    metricsBaselineOverride: input.metricsBaseline ?? null,
    caseStudyDraftOverride: input.caseStudyDraft ?? null,
    investorOnepagerOverride: input.investorOnepager ?? null,
    rollbackDrillOverride: input.rollbackDrill ?? null,
    competitorMatrixOverride: input.competitorMatrix ?? null,
    p0ProofStatusOverride: p0ProofStatus,
    tier2ProofStatusOverride: tier2ProofStatus,
  });

  const steadyStateLockComplete = steadyStateIntegrity.era25SteadyStateOperatorLoopLockComplete;
  const steadyStateLockBlocked = !steadyStateLockComplete;

  const headline = steadyStateLockComplete
    ? `Steady-state loop locked · improvement cadence honest · GO ${steadyStateIntegrity.goDecision ?? "GO"}`
    : input.charterLockComplete
      ? steadyStateIntegrity.frozenEnvMutationDetected
        ? "Steady-state lock blocked · clear frozen era25 env keys before lock attest"
        : steadyStateIntegrity.improvementLoopRhythmMutationDetected
          ? "Steady-state lock blocked · improvement loop cadence env without honest loop prerequisites"
          : "Awaiting steady-state operator loop lock attest after honest charter lock"
      : "Awaiting era25 post-re-entrant charter lock before steady-state loop lock";

  return {
    policyId: ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_UI_POLICY_ID,
    visible: true,
    charterLockComplete: input.charterLockComplete,
    steadyStateLockBlocked,
    steadyStateLockComplete,
    improvementLoopActive: steadyStateIntegrity.improvementLoopActive,
    frozenEnvMutationDetected: steadyStateIntegrity.frozenEnvMutationDetected,
    improvementLoopRhythmMutationDetected:
      steadyStateIntegrity.improvementLoopRhythmMutationDetected,
    goDecision: steadyStateIntegrity.goDecision,
    convergenceDoc: ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_DOC,
    backlogId: ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BACKLOG_ID,
    guardrails: ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_GUARDRAILS,
    foreverCommands: ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-steady-state-operator-loop-lock-integrity-baseline -- --write",
    validateCharterLockIntegrityCommand:
      "npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    validateSteadyStateOperatorLoopCommand: "npm run ops:validate-steady-state-operator-loop",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25SteadyStateOperatorLoopLockIntegrityPassed: steadyStateIntegrity.integrityPassed,
    era25PostReentrantCharterLockIntegrityPassed:
      steadyStateIntegrity.era25PostReentrantCharterLockIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
  };
}

export function formatEra25SteadyStateOperatorLoopLockEra25Label(
  slice: Era25SteadyStateOperatorLoopLockEra25UiSlice,
): string {
  const status = slice.steadyStateLockBlocked ? "BLOCKED" : "LOCKED";
  const loop = slice.improvementLoopActive ? "loop active" : "loop pending";
  return `era25 steady-state operator loop lock · ${status} · ${loop}`;
}
