/**
 * era25 first product slice blueprint UI slice — blueprint orchestration panel.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25FirstProductSliceBlueprintIntegrity } from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";
import {
  buildOwnerDailyBriefingBreakthroughEra25UiSlice,
  type OwnerDailyBriefingBreakthroughEra25UiSlice,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_FOREVER_COMMANDS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PLATFORM_ANCHOR,
  ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
  ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX,
  ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES,
  ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES,
  ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID,
  ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY,
  ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_PRODUCT_PLATFORM_ANCHOR,
  ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC,
  detectEra25FirstProductSliceBlueprintStarted,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import {
  type Era25FirstProductSliceBlueprintMilestone,
} from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import {
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluateEra25FirstProductSliceBlueprintWithMilestones } from "@/scripts/ops/validate-era25-first-product-slice-blueprint";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-first-product-slice-blueprint-era45";

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID =
  "era24-era25-first-product-slice-blueprint-ui-v1" as const;

export type Era25FirstProductSliceBlueprintUiSlice = {
  policyId: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  goDecision: string | null;
  era25FirstProductSliceBlueprintMilestone: Era25FirstProductSliceBlueprintMilestone;
  era25EngineeringGatesMilestone: Era25EngineeringGatesMilestone;
  blueprintBlocked: boolean;
  gatesBlocked: boolean;
  canonicalSliceName: typeof ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME;
  backlogId: typeof ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID;
  policyFamily: typeof ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY;
  productPlatformAnchor: typeof ERA25_FIRST_PRODUCT_SLICE_PRODUCT_PLATFORM_ANCHOR;
  canonicalCharterDocPath: string | null;
  charterSectionsValid: boolean;
  stagingChecklistPresent: boolean;
  stagingChecklistSectionsValid: boolean;
  illegalArtifactCount: number;
  existingSurfaces: typeof ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES;
  engineeringDeliverables: typeof ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  blueprintDoc: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC;
  productSliceDoc: typeof ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC;
  charterDocPrefix: typeof ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX;
  stagingChecklistDoc: typeof ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postGatesOrchestratorCommand: string;
  syncReportCommand: string;
  validateGatesCommand: string;
  validateEngineeringGatesIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  era25FirstProductSliceBlueprintIntegrityPassed: boolean;
  era25EngineeringGatesIntegrityPassed: boolean;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  ownerDailyBriefingBreakthrough: OwnerDailyBriefingBreakthroughEra25UiSlice | null;
};

export function buildEra25FirstProductSliceBlueprintUiSlice(input: {
  engineeringGatesVisible: boolean;
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
}): Era25FirstProductSliceBlueprintUiSlice | null {
  const env = input.env ?? process.env;
  const blueprintStarted = detectEra25FirstProductSliceBlueprintStarted(env);

  if (!input.engineeringGatesVisible && !blueprintStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const era25FirstProductSliceBlueprintIntegrity = evaluateEra25FirstProductSliceBlueprintIntegrity(
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

  const result = evaluateEra25FirstProductSliceBlueprintWithMilestones(env);
  const ownerDailyBriefingBreakthrough = buildOwnerDailyBriefingBreakthroughEra25UiSlice({
    blueprintVisible: true,
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
    policyId: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    goDecision: era25FirstProductSliceBlueprintIntegrity.goDecision,
    era25FirstProductSliceBlueprintMilestone: result.era25FirstProductSliceBlueprintMilestone,
    era25EngineeringGatesMilestone: result.evaluation.gates.era25EngineeringGatesMilestone,
    blueprintBlocked: result.evaluation.blueprintBlocked,
    gatesBlocked: result.evaluation.gates.gatesBlocked,
    canonicalSliceName: result.evaluation.canonicalSliceName,
    backlogId: result.evaluation.backlogId,
    policyFamily: result.evaluation.policyFamily,
    productPlatformAnchor: result.evaluation.productPlatformAnchor,
    canonicalCharterDocPath: result.evaluation.canonicalCharterDocPath,
    charterSectionsValid: result.evaluation.charterSectionsValid,
    stagingChecklistPresent: result.evaluation.stagingChecklist.checklistPresent,
    stagingChecklistSectionsValid: result.evaluation.stagingChecklist.sectionsValid,
    illegalArtifactCount: result.evaluation.illegalArtifacts.length,
    existingSurfaces: result.evaluation.existingSurfaces,
    engineeringDeliverables: result.evaluation.engineeringDeliverables,
    guardrails: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
    humanSteps: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
    blueprintDoc: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
    productSliceDoc: ERA25_FIRST_PRODUCT_SLICE_PRODUCT_DOC,
    charterDocPrefix: ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX,
    stagingChecklistDoc: ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC,
    foreverCommands: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-era25-first-product-slice-blueprint -- --json",
    postGatesOrchestratorCommand:
      "npm run ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator -- --write",
    syncReportCommand:
      "npm run ops:sync-era25-first-product-slice-blueprint-report -- --write",
    validateGatesCommand:
      "npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json",
    validateEngineeringGatesIntegrityCommand:
      "npm run ops:validate-era25-engineering-gates-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-era25-first-product-slice-blueprint-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-first-product-slice-blueprint-integrity-baseline -- --write",
    era25FirstProductSliceBlueprintIntegrityPassed:
      era25FirstProductSliceBlueprintIntegrity.integrityPassed,
    era25EngineeringGatesIntegrityPassed:
      era25FirstProductSliceBlueprintIntegrity.era25EngineeringGatesIntegrityPassed,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PLATFORM_ANCHOR}`,
    ownerDailyBriefingBreakthrough,
  };
}

export function formatEra25FirstProductSliceBlueprintLabel(
  slice: Era25FirstProductSliceBlueprintUiSlice,
): string {
  const milestone = slice.era25FirstProductSliceBlueprintMilestone.replaceAll("_", " ");
  const status = slice.blueprintBlocked ? "BLOCKED" : "READY";
  return `era25 first product slice blueprint · ${slice.canonicalSliceName} · ${status} · ${milestone}`;
}
