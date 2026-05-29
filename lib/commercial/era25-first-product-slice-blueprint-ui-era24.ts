/**
 * era25 first product slice blueprint UI slice — blueprint orchestration panel.
 */
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
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import {
  type Era25FirstProductSliceBlueprintMilestone,
} from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import {
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import { evaluateEra25FirstProductSliceBlueprintWithMilestones } from "@/scripts/ops/validate-era25-first-product-slice-blueprint";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID =
  "era24-era25-first-product-slice-blueprint-ui-v1" as const;

export type Era25FirstProductSliceBlueprintUiSlice = {
  policyId: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
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
  platformOpsHref: string;
  ownerDailyBriefingBreakthrough: OwnerDailyBriefingBreakthroughEra25UiSlice | null;
};

export function buildEra25FirstProductSliceBlueprintUiSlice(input: {
  engineeringGatesVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): Era25FirstProductSliceBlueprintUiSlice | null {
  if (!input.engineeringGatesVisible) return null;

  const result = evaluateEra25FirstProductSliceBlueprintWithMilestones(input.env);
  const ownerDailyBriefingBreakthrough = buildOwnerDailyBriefingBreakthroughEra25UiSlice({
    blueprintVisible: true,
    env: input.env,
  });

  return {
    policyId: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    era25FirstProductSliceBlueprintMilestone: result.era25FirstProductSliceBlueprintMilestone,
    era25EngineeringGatesMilestone: result.evaluation.gates.era25EngineeringGatesMilestone,
    blueprintBlocked: result.evaluation.blueprintBlocked,
    gatesBlocked: result.evaluation.gates.evaluation.gatesBlocked,
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
