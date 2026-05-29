#!/usr/bin/env npx tsx
/**
 * Validates era25 first product slice blueprint (orchestration — informational).
 */
import {
  resolveEra25FirstProductSliceBlueprintMilestone,
  type Era25FirstProductSliceBlueprintMilestone,
} from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID } from "@/lib/commercial/era25-first-product-slice-blueprint-era24-policy";
import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
  ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
  ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES,
  ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import { evaluateEra25FirstProductSliceBlueprint } from "@/lib/commercial/evaluate-era25-first-product-slice-blueprint";

export { evaluateEra25FirstProductSliceBlueprint };

export function evaluateEra25FirstProductSliceBlueprintWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateEra25FirstProductSliceBlueprint>;
  era25FirstProductSliceBlueprintMilestone: Era25FirstProductSliceBlueprintMilestone;
  readyForEngineeringGatesSmokes: boolean;
  readyForCharterSectionSmokes: boolean;
  readyForStagingChecklistSmokes: boolean;
  readyForPrematureProductSmokes: boolean;
} {
  const evaluation = evaluateEra25FirstProductSliceBlueprint(env);
  const era25FirstProductSliceBlueprintMilestone = resolveEra25FirstProductSliceBlueprintMilestone({
    era25EngineeringGatesMilestone: evaluation.gates.era25EngineeringGatesMilestone,
    gatesBlocked: evaluation.gates.gatesBlocked,
    illegalArtifactCount: evaluation.illegalArtifacts.length,
    canonicalCharterDocPath: evaluation.canonicalCharterDocPath,
    charterSectionsValid: evaluation.charterSectionsValid,
    stagingChecklistSectionsValid: evaluation.stagingChecklist.sectionsValid,
  });

  const readyForEngineeringGatesSmokes =
    evaluation.gates.gatesBlocked ||
    evaluation.gates.era25EngineeringGatesMilestone !== "era25_engineering_gates_open";
  const readyForCharterSectionSmokes =
    evaluation.canonicalCharterDocPath !== null && !evaluation.charterSectionsValid;
  const readyForStagingChecklistSmokes =
    evaluation.stagingChecklist.checklistPresent &&
    !evaluation.stagingChecklist.sectionsValid;
  const readyForPrematureProductSmokes = evaluation.illegalArtifacts.length > 0;

  return {
    evaluation,
    era25FirstProductSliceBlueprintMilestone,
    readyForEngineeringGatesSmokes,
    readyForCharterSectionSmokes,
    readyForStagingChecklistSmokes,
    readyForPrematureProductSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25FirstProductSliceBlueprintWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID,
          outsideLinearCatalog: true,
          era25FirstProductSliceBlueprintMilestone: result.era25FirstProductSliceBlueprintMilestone,
          era25EngineeringGatesMilestone: result.evaluation.gates.era25EngineeringGatesMilestone,
          blueprintBlocked: result.evaluation.blueprintBlocked,
          gatesBlocked: result.evaluation.gates.gatesBlocked,
          canonicalSliceName: ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
          canonicalCharterDocPath: result.evaluation.canonicalCharterDocPath,
          charterSectionsValid: result.evaluation.charterSectionsValid,
          stagingChecklistPresent: result.evaluation.stagingChecklist.checklistPresent,
          stagingChecklistSectionsValid: result.evaluation.stagingChecklist.sectionsValid,
          readyForEngineeringGatesSmokes: result.readyForEngineeringGatesSmokes,
          readyForCharterSectionSmokes: result.readyForCharterSectionSmokes,
          readyForStagingChecklistSmokes: result.readyForStagingChecklistSmokes,
          readyForPrematureProductSmokes: result.readyForPrematureProductSmokes,
          illegalArtifacts: result.evaluation.illegalArtifacts,
          existingSurfaces: ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES,
          engineeringDeliverables: ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES,
          humanSteps: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
          guardrails: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 first product slice blueprint (${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.era25FirstProductSliceBlueprintMilestone}`);
  console.log(`Canonical slice: ${ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME}`);
  console.log(`Blueprint blocked: ${result.evaluation.blueprintBlocked ? "yes" : "no"}`);
  console.log(`Gates milestone: ${result.evaluation.gates.era25EngineeringGatesMilestone}`);
  console.log(
    `Staging checklist sections valid: ${result.evaluation.stagingChecklist.sectionsValid ? "yes" : "no"}`,
  );
  console.log("");
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
