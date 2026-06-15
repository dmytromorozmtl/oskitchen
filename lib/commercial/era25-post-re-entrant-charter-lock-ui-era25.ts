/**
 * Era25 post-re-entrant operator charter lock UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25PostReentrantCharterLockIntegrity } from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";
import {
  ERA25_POST_REENTRANT_CHARTER_LOCK_DOC,
  ERA25_POST_REENTRANT_CHARTER_LOCK_FOREVER_COMMANDS,
  ERA25_POST_REENTRANT_CHARTER_LOCK_GUARDRAILS,
  ERA25_POST_REENTRANT_CHARTER_LOCK_BACKLOG_ID,
  ERA25_POST_REENTRANT_CHARTER_LOCK_PLATFORM_ANCHOR,
  detectEra25PostReentrantCharterLockStarted,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-phases-era57";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import {
  buildEra25SteadyStateOperatorLoopLockEra25UiSlice,
  type Era25SteadyStateOperatorLoopLockEra25UiSlice,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-ui-era25";
import { LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-re-entrant-charter-lock-era57";

export const ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_UI_POLICY_ID =
  "era25-post-re-entrant-charter-lock-ui-v1" as const;

export type Era25PostReentrantCharterLockEra25UiSlice = {
  policyId: typeof ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_UI_POLICY_ID;
  visible: boolean;
  reentrantComplete: boolean;
  charterLockBlocked: boolean;
  charterLockComplete: boolean;
  frozenEnvMutationDetected: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_POST_REENTRANT_CHARTER_LOCK_DOC;
  backlogId: typeof ERA25_POST_REENTRANT_CHARTER_LOCK_BACKLOG_ID;
  guardrails: typeof ERA25_POST_REENTRANT_CHARTER_LOCK_GUARDRAILS;
  foreverCommands: typeof ERA25_POST_REENTRANT_CHARTER_LOCK_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateReentrantIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25PostReentrantCharterLockIntegrityPassed: boolean;
  sustainedProductEvolutionReentrantIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
  era25SteadyStateOperatorLoopLock: Era25SteadyStateOperatorLoopLockEra25UiSlice | null;
};

export function buildEra25PostReentrantCharterLockEra25UiSlice(input: {
  sustainedProductEvolutionReentrantVisible: boolean;
  reentrantComplete: boolean;
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
}): Era25PostReentrantCharterLockEra25UiSlice | null {
  const env = input.env ?? process.env;
  const charterLockStarted = detectEra25PostReentrantCharterLockStarted(env);

  if (!input.sustainedProductEvolutionReentrantVisible && !charterLockStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const charterLockIntegrity = evaluateEra25PostReentrantCharterLockIntegrity(process.cwd(), {
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

  const charterLockComplete = charterLockIntegrity.era25PostReentrantCharterLockComplete;
  const charterLockBlocked = !charterLockComplete;

  const era25SteadyStateOperatorLoopLock = buildEra25SteadyStateOperatorLoopLockEra25UiSlice({
    postReentrantCharterLockVisible: true,
    charterLockComplete,
    env,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    competitorMatrix: input.competitorMatrix,
    p0ProofStatus,
    tier2ProofStatus,
  });

  const headline = charterLockComplete
    ? `Era25 charter locked · frozen env guard PASS · GO ${charterLockIntegrity.goDecision ?? "GO"}`
    : input.reentrantComplete
      ? charterLockIntegrity.frozenEnvMutationDetected
        ? "Charter lock blocked · clear mutable era25 env keys before lock attest"
        : "Awaiting post-re-entrant charter lock attest after honest re-entrant evolution"
      : "Awaiting sustained product evolution re-entrant before charter lock";

  return {
    policyId: ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_UI_POLICY_ID,
    visible: true,
    reentrantComplete: input.reentrantComplete,
    charterLockBlocked,
    charterLockComplete,
    frozenEnvMutationDetected: charterLockIntegrity.frozenEnvMutationDetected,
    goDecision: charterLockIntegrity.goDecision,
    convergenceDoc: ERA25_POST_REENTRANT_CHARTER_LOCK_DOC,
    backlogId: ERA25_POST_REENTRANT_CHARTER_LOCK_BACKLOG_ID,
    guardrails: ERA25_POST_REENTRANT_CHARTER_LOCK_GUARDRAILS,
    foreverCommands: ERA25_POST_REENTRANT_CHARTER_LOCK_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-post-re-entrant-charter-lock-integrity-baseline -- --write",
    validateReentrantIntegrityCommand:
      "npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25PostReentrantCharterLockIntegrityPassed: charterLockIntegrity.integrityPassed,
    sustainedProductEvolutionReentrantIntegrityPassed:
      charterLockIntegrity.sustainedProductEvolutionReentrantIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_POST_REENTRANT_CHARTER_LOCK_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
    era25SteadyStateOperatorLoopLock,
  };
}

export function formatEra25PostReentrantCharterLockEra25Label(
  slice: Era25PostReentrantCharterLockEra25UiSlice,
): string {
  const status = slice.charterLockBlocked ? "BLOCKED" : "LOCKED";
  const frozen = slice.frozenEnvMutationDetected ? "env mutation" : "env frozen";
  return `era25 post-re-entrant charter lock · ${status} · ${frozen}`;
}
