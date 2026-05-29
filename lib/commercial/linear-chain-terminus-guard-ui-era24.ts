/**
 * Linear chain terminus guard UI slice — Step 17 FORBIDDEN platform panel section.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateLinearChainTerminusGuardIntegrity } from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";
import {
  buildEra25CharterExitUiSlice,
  type Era25CharterExitUiSlice,
} from "@/lib/commercial/era25-charter-exit-ui-era24";
import {
  detectLinearChainTerminusGuardStarted,
  LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
  LINEAR_CHAIN_MAX_STEP,
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS,
  LINEAR_CHAIN_TERMINUS_GUARD_PLATFORM_ANCHOR,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  type LinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import {
  type LinearPathPermanentlyClosedMilestone,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluateLinearChainTerminusGuardWithMilestones } from "@/scripts/ops/validate-linear-chain-terminus-guard";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ANCHOR } from "@/lib/launch-wizard/launch-wizard-linear-chain-terminus-guard-era41";

export const LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID =
  "era24-linear-chain-terminus-guard-ui-v1" as const;

export type LinearChainTerminusGuardUiSlice = {
  policyId: typeof LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID;
  visible: boolean;
  step17Forbidden: boolean;
  guardPassed: boolean;
  maxLinearStep: typeof LINEAR_CHAIN_MAX_STEP;
  catalogStepCount: number;
  violationCount: number;
  goDecision: string | null;
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  forbiddenProposals: readonly string[];
  foreverCommands: readonly string[];
  step17ForbiddenDoc: typeof LINEAR_CHAIN_STEP17_FORBIDDEN_DOC;
  validateCommand: string;
  postLinearPathClosedOrchestratorCommand: string;
  validateLinearPathPermanentlyClosedIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  linearChainTerminusGuardIntegrityPassed: boolean;
  linearPathPermanentlyClosedIntegrityPassed: boolean;
  syncReportCommand: string;
  exportEraCharterChecklistCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  era25CharterExit: Era25CharterExitUiSlice | null;
};

export function buildLinearChainTerminusGuardUiSlice(input: {
  terminalClosureActive: boolean;
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
}): LinearChainTerminusGuardUiSlice | null {
  const env = input.env ?? process.env;
  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;
  const linearChainGuardStarted = detectLinearChainTerminusGuardStarted(env);

  if (!input.terminalClosureActive && !linearChainGuardStarted) return null;

  const linearChainTerminusGuardIntegrity = evaluateLinearChainTerminusGuardIntegrity(
    process.cwd(),
    {
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
    },
  );

  const result = evaluateLinearChainTerminusGuardWithMilestones(env);
  const era25CharterExit = buildEra25CharterExitUiSlice({
    guardPassed: result.guard.guardPassed,
    env,
  });

  return {
    policyId: LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID,
    visible: true,
    step17Forbidden: true,
    guardPassed: result.guard.guardPassed,
    maxLinearStep: LINEAR_CHAIN_MAX_STEP,
    catalogStepCount: result.guard.catalogStepCount,
    violationCount: result.guard.violations.length,
    goDecision: linearChainTerminusGuardIntegrity.goDecision,
    linearChainTerminusGuardMilestone: result.linearChainTerminusGuardMilestone,
    linearPathPermanentlyClosedMilestone: result.linearPathPermanentlyClosedMilestone,
    forbiddenProposals: LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
    foreverCommands: LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS,
    step17ForbiddenDoc: LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
    validateCommand: "npm run ops:validate-linear-chain-terminus-guard -- --json",
    postLinearPathClosedOrchestratorCommand:
      "npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write",
    validateLinearPathPermanentlyClosedIntegrityCommand:
      "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-linear-chain-terminus-guard-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-linear-chain-terminus-guard-integrity-baseline -- --write",
    linearChainTerminusGuardIntegrityPassed: linearChainTerminusGuardIntegrity.integrityPassed,
    linearPathPermanentlyClosedIntegrityPassed:
      linearChainTerminusGuardIntegrity.linearPathPermanentlyClosedIntegrityPassed,
    syncReportCommand: "npm run ops:sync-linear-chain-terminus-guard-report -- --write",
    exportEraCharterChecklistCommand:
      "npm run ops:export-era-charter-readiness-checklist -- --write",
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${LINEAR_CHAIN_TERMINUS_GUARD_PLATFORM_ANCHOR}`,
    era25CharterExit,
  };
}

export function formatLinearChainTerminusGuardLabel(slice: LinearChainTerminusGuardUiSlice): string {
  const milestone = slice.linearChainTerminusGuardMilestone.replaceAll("_", " ");
  return `Step 17 FORBIDDEN · max step ${slice.maxLinearStep} · guard ${slice.guardPassed ? "PASS" : "FAIL"} · ${milestone}`;
}
