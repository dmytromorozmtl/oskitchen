#!/usr/bin/env npx tsx
/**
 * Validates era25 engineering gates require signed charter (enforcement — informational).
 */
import {
  resolveEra25EngineeringGatesMilestone,
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import { ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID } from "@/lib/commercial/era25-engineering-gates-require-signed-charter-era24-policy";
import {
  ERA25_ENGINEERING_GATES_GUARDRAILS,
  ERA25_ENGINEERING_GATES_HUMAN_STEPS,
  ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import { evaluateEra25EngineeringGatesRequireSignedCharter } from "@/lib/commercial/evaluate-era25-engineering-gates-require-signed-charter";

export { evaluateEra25EngineeringGatesRequireSignedCharter };

export function evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateEra25EngineeringGatesRequireSignedCharter>;
  era25EngineeringGatesMilestone: Era25EngineeringGatesMilestone;
  readyForCharterReadinessSmokes: boolean;
  readyForIllegalArtifactSmokes: boolean;
} {
  const evaluation = evaluateEra25EngineeringGatesRequireSignedCharter(env);
  const era25EngineeringGatesMilestone = resolveEra25EngineeringGatesMilestone({
    era25FirstCharterSliceReadinessMilestone:
      evaluation.readiness.era25FirstCharterSliceReadinessMilestone,
    illegalArtifactCount: evaluation.illegalArtifacts.length,
  });

  const readyForCharterReadinessSmokes =
    evaluation.readiness.era25FirstCharterSliceReadinessMilestone ===
      "charter_exit_blocked" ||
    evaluation.readiness.era25FirstCharterSliceReadinessMilestone ===
      "attention_charter_sections";
  const readyForIllegalArtifactSmokes = evaluation.illegalArtifacts.length > 0;

  return {
    evaluation,
    era25EngineeringGatesMilestone,
    readyForCharterReadinessSmokes,
    readyForIllegalArtifactSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID,
          outsideLinearCatalog: true,
          era25EngineeringGatesMilestone: result.era25EngineeringGatesMilestone,
          era25FirstCharterSliceReadinessMilestone:
            result.evaluation.readiness.era25FirstCharterSliceReadinessMilestone,
          gatesBlocked: result.evaluation.gatesBlocked,
          terminusGuardPassed: result.evaluation.terminusGuardPassed,
          readyForCharterReadinessSmokes: result.readyForCharterReadinessSmokes,
          readyForIllegalArtifactSmokes: result.readyForIllegalArtifactSmokes,
          illegalArtifacts: result.evaluation.illegalArtifacts,
          firstProductSliceRequirements: ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
          humanSteps: ERA25_ENGINEERING_GATES_HUMAN_STEPS,
          guardrails: ERA25_ENGINEERING_GATES_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 engineering gates require signed charter (${ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.era25EngineeringGatesMilestone}`);
  console.log(
    `Readiness milestone: ${result.evaluation.readiness.era25FirstCharterSliceReadinessMilestone}`,
  );
  console.log(`Gates blocked: ${result.evaluation.gatesBlocked ? "yes" : "no"}`);
  console.log(`Illegal artifacts: ${result.evaluation.illegalArtifacts.length}\n`);
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
