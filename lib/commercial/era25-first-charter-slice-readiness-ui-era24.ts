/**
 * era25 first charter slice readiness UI slice — charter section validation panel.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25FirstCharterSliceReadinessIntegrity } from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";
import {
  buildEra25EngineeringGatesUiSlice,
  type Era25EngineeringGatesUiSlice,
} from "@/lib/commercial/era25-engineering-gates-ui-era24";
import {
  detectEra25FirstCharterSliceStarted,
  ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN,
  ERA25_FIRST_CHARTER_SLICE_FOREVER_COMMANDS,
  ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
  ERA25_FIRST_CHARTER_SLICE_READINESS_PLATFORM_ANCHOR,
  ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
  ERA25_CHARTER_REQUIRED_SECTIONS,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import {
  type Era25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import {
  type Era25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluateEra25FirstCharterSliceReadinessWithMilestones } from "@/scripts/ops/validate-era25-first-charter-slice-readiness";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-first-charter-slice-era43";

export const ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID =
  "era24-era25-first-charter-slice-readiness-ui-v1" as const;

export type Era25FirstCharterSliceReadinessUiSlice = {
  policyId: typeof ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  goDecision: string | null;
  era25FirstCharterSliceReadinessMilestone: Era25FirstCharterSliceReadinessMilestone;
  era25CharterExitMilestone: Era25CharterExitMilestone;
  charterDocPath: string | null;
  sectionsValid: boolean;
  missingSectionCount: number;
  requiredSectionCount: number;
  requiredSections: typeof ERA25_CHARTER_REQUIRED_SECTIONS;
  engineeringPattern: typeof ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN;
  guardrails: readonly string[];
  templateDoc: typeof ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postCharterExitOrchestratorCommand: string;
  validateEra25CharterExitIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  era25FirstCharterSliceIntegrityPassed: boolean;
  era25CharterExitIntegrityPassed: boolean;
  syncReportCommand: string;
  validateCharterExitCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  engineeringGates: Era25EngineeringGatesUiSlice | null;
};

export function buildEra25FirstCharterSliceReadinessUiSlice(input: {
  charterExitVisible: boolean;
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
}): Era25FirstCharterSliceReadinessUiSlice | null {
  const env = input.env ?? process.env;
  const firstSliceStarted = detectEra25FirstCharterSliceStarted(env);

  if (!input.charterExitVisible && !firstSliceStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const era25FirstCharterSliceIntegrity = evaluateEra25FirstCharterSliceReadinessIntegrity(
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

  const result = evaluateEra25FirstCharterSliceReadinessWithMilestones(env);
  const engineeringGates = buildEra25EngineeringGatesUiSlice({
    readinessVisible: true,
    env,
  });

  return {
    policyId: ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    goDecision: era25FirstCharterSliceIntegrity.goDecision,
    era25FirstCharterSliceReadinessMilestone: result.era25FirstCharterSliceReadinessMilestone,
    era25CharterExitMilestone: result.era25CharterExitMilestone,
    charterDocPath: result.evaluation.charterValidation.charterDocPath,
    sectionsValid: result.evaluation.charterValidation.sectionsValid,
    missingSectionCount: result.evaluation.charterValidation.missingSectionIds.length,
    requiredSectionCount: result.evaluation.requiredSectionCount,
    requiredSections: ERA25_CHARTER_REQUIRED_SECTIONS,
    engineeringPattern: ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN,
    guardrails: ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
    templateDoc: ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
    foreverCommands: ERA25_FIRST_CHARTER_SLICE_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
    postCharterExitOrchestratorCommand:
      "npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --write",
    validateEra25CharterExitIntegrityCommand:
      "npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-first-charter-slice-readiness-integrity-baseline -- --write",
    era25FirstCharterSliceIntegrityPassed: era25FirstCharterSliceIntegrity.integrityPassed,
    era25CharterExitIntegrityPassed: era25FirstCharterSliceIntegrity.era25CharterExitIntegrityPassed,
    syncReportCommand: "npm run ops:sync-era25-first-charter-slice-readiness-report -- --write",
    validateCharterExitCommand:
      "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_FIRST_CHARTER_SLICE_READINESS_PLATFORM_ANCHOR}`,
    engineeringGates,
  };
}

export function formatEra25FirstCharterSliceReadinessLabel(
  slice: Era25FirstCharterSliceReadinessUiSlice,
): string {
  const milestone = slice.era25FirstCharterSliceReadinessMilestone.replaceAll("_", " ");
  return `era25 first charter slice · ${milestone} · ${slice.missingSectionCount}/${slice.requiredSectionCount} sections missing`;
}
