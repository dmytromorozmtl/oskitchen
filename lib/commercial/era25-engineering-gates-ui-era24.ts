/**
 * era25 engineering gates UI slice — gate enforcement panel.
 */
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
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import {
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import {
  type Era25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import { evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones } from "@/scripts/ops/validate-era25-engineering-gates-require-signed-charter";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID =
  "era24-era25-engineering-gates-ui-v1" as const;

export type Era25EngineeringGatesUiSlice = {
  policyId: typeof ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
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
  platformOpsHref: string;
  firstProductSliceBlueprint: Era25FirstProductSliceBlueprintUiSlice | null;
};

export function buildEra25EngineeringGatesUiSlice(input: {
  readinessVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): Era25EngineeringGatesUiSlice | null {
  if (!input.readinessVisible) return null;

  const result = evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones(input.env);
  const firstProductSliceBlueprint = buildEra25FirstProductSliceBlueprintUiSlice({
    engineeringGatesVisible: true,
    env: input.env,
  });

  return {
    policyId: ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
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
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR}`,
    firstProductSliceBlueprint,
  };
}

export function formatEra25EngineeringGatesLabel(slice: Era25EngineeringGatesUiSlice): string {
  const milestone = slice.era25EngineeringGatesMilestone.replaceAll("_", " ");
  const status = slice.gatesBlocked ? "BLOCKED" : "OPEN";
  return `era25 engineering gates · ${status} · ${milestone} · ${slice.illegalArtifactCount} illegal artifacts`;
}
