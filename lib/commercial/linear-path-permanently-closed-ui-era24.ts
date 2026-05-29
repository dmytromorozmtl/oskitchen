/**
 * Linear path permanently closed UI slice — terminal platform panel section.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateLinearPathPermanentlyClosedIntegrity } from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";
import {
  detectLinearPathPermanentlyClosedStarted,
  LINEAR_PATH_PERMANENTLY_CLOSED_PLATFORM_ANCHOR,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
  TERMINAL_ERA25_EXIT,
  TERMINAL_FORBIDDEN_ACTIONS,
  TERMINAL_FOREVER_COMMANDS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import {
  type LinearPathPermanentlyClosedMilestone,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import {
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  buildLinearChainTerminusGuardUiSlice,
  type LinearChainTerminusGuardUiSlice,
} from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluateLinearPathPermanentlyClosedWithMilestones } from "@/scripts/ops/validate-linear-path-permanently-closed";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ANCHOR } from "@/lib/launch-wizard/launch-wizard-linear-path-permanently-closed-era40";

export const LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID =
  "era24-linear-path-permanently-closed-ui-v1" as const;

export type LinearPathPermanentlyClosedUiSlice = {
  policyId: typeof LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID;
  visible: boolean;
  terminalClosureActive: boolean;
  linearPathPermanentlyClosed: boolean;
  docChainSteps: number;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  forbiddenActions: readonly string[];
  era25ExitSteps: readonly string[];
  foreverCommands: readonly string[];
  step16Doc: typeof LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC;
  validateCommand: string;
  postAbsoluteEndOrchestratorCommand: string;
  validateCommercialPilotPathAbsoluteEndIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  linearPathPermanentlyClosedIntegrityPassed: boolean;
  commercialPilotPathAbsoluteEndIntegrityPassed: boolean;
  syncReportCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  missingDocChainDocCount: number;
  terminusGuardPassed: boolean;
  step17ForbiddenDoc: typeof LINEAR_CHAIN_STEP17_FORBIDDEN_DOC;
  terminusGuardValidateCommand: string;
  step17Forbidden: LinearChainTerminusGuardUiSlice | null;
};

export function buildLinearPathPermanentlyClosedUiSlice(input: {
  absoluteEndActive: boolean;
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
}): LinearPathPermanentlyClosedUiSlice | null {
  const env = input.env ?? process.env;
  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;
  const linearPathStarted = detectLinearPathPermanentlyClosedStarted(env);

  if (!input.absoluteEndActive && !linearPathStarted) return null;

  const linearPathPermanentlyClosedIntegrity = evaluateLinearPathPermanentlyClosedIntegrity(
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

  const result = evaluateLinearPathPermanentlyClosedWithMilestones(env);
  const step17Forbidden = buildLinearChainTerminusGuardUiSlice({
    terminalClosureActive: result.evaluation.terminalClosureActive,
    env,
  });

  return {
    policyId: LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID,
    visible: true,
    terminalClosureActive: result.evaluation.terminalClosureActive,
    linearPathPermanentlyClosed: result.evaluation.linearPathPermanentlyClosed,
    docChainSteps: result.evaluation.docChainSteps,
    goDecision: result.evaluation.goDecision,
    completedSteps: result.evaluation.completedSteps,
    totalSteps: result.evaluation.totalSteps,
    forbiddenActions: TERMINAL_FORBIDDEN_ACTIONS,
    era25ExitSteps: TERMINAL_ERA25_EXIT,
    foreverCommands: TERMINAL_FOREVER_COMMANDS,
    step16Doc: LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
    validateCommand: "npm run ops:validate-linear-path-permanently-closed -- --json",
    postAbsoluteEndOrchestratorCommand:
      "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
    validateCommercialPilotPathAbsoluteEndIntegrityCommand:
      "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-linear-path-permanently-closed-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-linear-path-permanently-closed-integrity-baseline -- --write",
    linearPathPermanentlyClosedIntegrityPassed: linearPathPermanentlyClosedIntegrity.integrityPassed,
    commercialPilotPathAbsoluteEndIntegrityPassed:
      linearPathPermanentlyClosedIntegrity.commercialPilotPathAbsoluteEndIntegrityPassed,
    syncReportCommand: "npm run ops:sync-linear-path-permanently-closed-report -- --write",
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${LINEAR_PATH_PERMANENTLY_CLOSED_PLATFORM_ANCHOR}`,
    linearPathPermanentlyClosedMilestone: result.linearPathPermanentlyClosedMilestone,
    missingDocChainDocCount: result.missingDocChainDocs.length,
    terminusGuardPassed: result.guard.guardPassed,
    step17ForbiddenDoc: LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
    terminusGuardValidateCommand: "npm run ops:validate-linear-chain-terminus-guard -- --json",
    step17Forbidden,
  };
}

export function formatLinearPathPermanentlyClosedLabel(
  slice: LinearPathPermanentlyClosedUiSlice,
): string {
  const milestone = slice.linearPathPermanentlyClosedMilestone.replaceAll("_", " ");
  return `Linear path permanently closed · ${slice.docChainSteps}-step doc chain · ${milestone} · Step 17+ forbidden`;
}
