/**
 * era25 charter exit UI slice — outside linear catalog platform panel section.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25CharterExitOutsideLinearPathIntegrity } from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";
import {
  buildEra25FirstCharterSliceReadinessUiSlice,
  type Era25FirstCharterSliceReadinessUiSlice,
} from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import {
  detectEra25CharterExitStarted,
  ERA25_CHARTER_EXIT_FOREVER_COMMANDS,
  ERA25_CHARTER_EXIT_GUARDRAILS,
  ERA25_CHARTER_EXIT_HUMAN_STEPS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
  ERA25_CHARTER_EXIT_PLATFORM_ANCHOR,
  ERA25_CHARTER_DOC_GLOB_HINT,
  ERA_CHARTER_CRITERIA,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import {
  type Era25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import {
  type LinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluateEra25CharterExitOutsideLinearPathWithMilestones } from "@/scripts/ops/validate-era25-charter-exit-outside-linear-path";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-charter-exit-era42";

export const ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID =
  "era24-era25-charter-exit-outside-linear-path-ui-v1" as const;

export type Era25CharterExitUiSlice = {
  policyId: typeof ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  guardPassed: boolean;
  charterChecklistPresent: boolean;
  signedCharterPresent: boolean;
  era25CharterDocCount: number;
  goDecision: string | null;
  era25CharterExitMilestone: Era25CharterExitMilestone;
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  criteriaCount: number;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  criteria: typeof ERA_CHARTER_CRITERIA;
  processDoc: typeof ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC;
  charterDocGlobHint: typeof ERA25_CHARTER_DOC_GLOB_HINT;
  charterChecklistPath: typeof ERA_CHARTER_READINESS_CHECKLIST_PATH;
  foreverCommands: readonly string[];
  validateCommand: string;
  postTerminusGuardOrchestratorCommand: string;
  validateLinearChainTerminusGuardIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  era25CharterExitIntegrityPassed: boolean;
  linearChainTerminusGuardIntegrityPassed: boolean;
  syncReportCommand: string;
  exportCharterChecklistCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  firstCharterSliceReadiness: Era25FirstCharterSliceReadinessUiSlice | null;
};

export function buildEra25CharterExitUiSlice(input: {
  guardPassed: boolean;
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
}): Era25CharterExitUiSlice | null {
  const env = input.env ?? process.env;
  const charterExitStarted = detectEra25CharterExitStarted(env);

  if (!input.guardPassed && !charterExitStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const era25CharterExitIntegrity = evaluateEra25CharterExitOutsideLinearPathIntegrity(
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

  const result = evaluateEra25CharterExitOutsideLinearPathWithMilestones(env);
  const firstCharterSliceReadiness = buildEra25FirstCharterSliceReadinessUiSlice({
    charterExitVisible: true,
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

  return {
    policyId: ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    guardPassed: result.evaluation.terminusGuard.guard.guardPassed,
    charterChecklistPresent: result.evaluation.charterChecklistPresent,
    signedCharterPresent: result.evaluation.signedCharterPresent,
    era25CharterDocCount: result.evaluation.era25CharterDocs.length,
    goDecision: era25CharterExitIntegrity.goDecision,
    era25CharterExitMilestone: result.era25CharterExitMilestone,
    linearChainTerminusGuardMilestone:
      result.evaluation.terminusGuard.linearChainTerminusGuardMilestone,
    criteriaCount: result.evaluation.criteriaCount,
    guardrails: ERA25_CHARTER_EXIT_GUARDRAILS,
    humanSteps: ERA25_CHARTER_EXIT_HUMAN_STEPS,
    criteria: ERA_CHARTER_CRITERIA,
    processDoc: ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
    charterDocGlobHint: ERA25_CHARTER_DOC_GLOB_HINT,
    charterChecklistPath: ERA_CHARTER_READINESS_CHECKLIST_PATH,
    foreverCommands: ERA25_CHARTER_EXIT_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
    postTerminusGuardOrchestratorCommand:
      "npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write",
    validateLinearChainTerminusGuardIntegrityCommand:
      "npm run ops:validate-linear-chain-terminus-guard-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-charter-exit-outside-linear-path-integrity-baseline -- --write",
    era25CharterExitIntegrityPassed: era25CharterExitIntegrity.integrityPassed,
    linearChainTerminusGuardIntegrityPassed:
      era25CharterExitIntegrity.linearChainTerminusGuardIntegrityPassed,
    syncReportCommand: "npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write",
    exportCharterChecklistCommand:
      "npm run ops:export-era-charter-readiness-checklist -- --write",
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_CHARTER_EXIT_PLATFORM_ANCHOR}`,
    firstCharterSliceReadiness,
  };
}

export function formatEra25CharterExitLabel(slice: Era25CharterExitUiSlice): string {
  const milestone = slice.era25CharterExitMilestone.replaceAll("_", " ");
  return `era25+ charter exit · outside linear path · ${milestone} · ${slice.era25CharterDocCount} charter docs`;
}
