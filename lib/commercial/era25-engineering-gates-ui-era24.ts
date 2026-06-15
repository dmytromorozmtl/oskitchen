/**
 * era25 engineering gates UI slice — gate enforcement panel.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25EngineeringGatesIntegrity } from "@/lib/commercial/era25-engineering-gates-integrity-era44";
import {
  buildEra25FirstProductSliceBlueprintUiSlice,
  type Era25FirstProductSliceBlueprintUiSlice,
} from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";
import {
  ERA25_ENGINEERING_GATES_FOREVER_COMMANDS,
  ERA25_ENGINEERING_GATES_GUARDRAILS,
  ERA25_ENGINEERING_GATES_HUMAN_STEPS,
  ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
  ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
  detectEra25EngineeringGatesStarted,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import {
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import {
  type Era25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones } from "@/scripts/ops/validate-era25-engineering-gates-require-signed-charter";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-engineering-gates-era44";

export const ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID =
  "era24-era25-engineering-gates-ui-v1" as const;

export type Era25EngineeringGatesUiSlice = {
  policyId: typeof ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  goDecision: string | null;
  era25EngineeringGatesMilestone: Era25EngineeringGatesMilestone;
  era25FirstCharterSliceReadinessMilestone: Era25FirstCharterSliceReadinessMilestone;
  gatesBlocked: boolean;
  terminusGuardPassed: boolean;
  illegalArtifactCount: number;
  firstProductSliceRequirements: typeof ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  gatesDoc: typeof ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postReadinessOrchestratorCommand: string;
  syncReportCommand: string;
  validateReadinessCommand: string;
  validateFirstCharterSliceIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  era25EngineeringGatesIntegrityPassed: boolean;
  era25FirstCharterSliceIntegrityPassed: boolean;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  firstProductSliceBlueprint: Era25FirstProductSliceBlueprintUiSlice | null;
};

export function buildEra25EngineeringGatesUiSlice(input: {
  readinessVisible: boolean;
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
}): Era25EngineeringGatesUiSlice | null {
  const env = input.env ?? process.env;
  const gatesStarted = detectEra25EngineeringGatesStarted(env);

  if (!input.readinessVisible && !gatesStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const era25EngineeringGatesIntegrity = evaluateEra25EngineeringGatesIntegrity(process.cwd(), {
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

  const result = evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones(env);
  const firstProductSliceBlueprint = buildEra25FirstProductSliceBlueprintUiSlice({
    engineeringGatesVisible: true,
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
    policyId: ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    goDecision: era25EngineeringGatesIntegrity.goDecision,
    era25EngineeringGatesMilestone: result.era25EngineeringGatesMilestone,
    era25FirstCharterSliceReadinessMilestone:
      result.evaluation.readiness.era25FirstCharterSliceReadinessMilestone,
    gatesBlocked: result.evaluation.gatesBlocked,
    terminusGuardPassed: result.evaluation.terminusGuardPassed,
    illegalArtifactCount: result.evaluation.illegalArtifacts.length,
    firstProductSliceRequirements: ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
    guardrails: ERA25_ENGINEERING_GATES_GUARDRAILS,
    humanSteps: ERA25_ENGINEERING_GATES_HUMAN_STEPS,
    gatesDoc: ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
    foreverCommands: ERA25_ENGINEERING_GATES_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json",
    postReadinessOrchestratorCommand:
      "npm run ops:run-era25-engineering-gates-post-readiness-orchestrator -- --write",
    syncReportCommand:
      "npm run ops:sync-era25-engineering-gates-require-signed-charter-report -- --write",
    validateReadinessCommand:
      "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
    validateFirstCharterSliceIntegrityCommand:
      "npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-era25-engineering-gates-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-engineering-gates-integrity-baseline -- --write",
    era25EngineeringGatesIntegrityPassed: era25EngineeringGatesIntegrity.integrityPassed,
    era25FirstCharterSliceIntegrityPassed:
      era25EngineeringGatesIntegrity.era25FirstCharterSliceIntegrityPassed,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR}`,
    firstProductSliceBlueprint,
  };
}

export function formatEra25EngineeringGatesLabel(slice: Era25EngineeringGatesUiSlice): string {
  const milestone = slice.era25EngineeringGatesMilestone.replaceAll("_", " ");
  const status = slice.gatesBlocked ? "BLOCKED" : "OPEN";
  return `era25 engineering gates · ${status} · ${milestone} · ${slice.illegalArtifactCount} illegal artifacts`;
}
