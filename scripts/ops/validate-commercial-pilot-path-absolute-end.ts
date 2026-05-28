#!/usr/bin/env npx tsx
/**
 * Validates commercial pilot path absolute end (Step 15, informational).
 */
import { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID } from "@/lib/commercial/commercial-pilot-path-absolute-end-era24-policy";
import {
  PATH_ABSOLUTE_END_GUARDRAILS,
  PATH_ABSOLUTE_END_LAYERS,
  STEADY_STATE_PRODUCT_SURFACES,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";

export { evaluateCommercialPilotPathAbsoluteEnd };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateCommercialPilotPathAbsoluteEnd();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID,
          absoluteEndActive: result.absoluteEndActive,
          pathEngineeringClosed: result.pathEngineeringClosed,
          goDecision: result.goDecision,
          completedSteps: result.completedSteps,
          totalSteps: result.totalSteps,
          pathLayers: PATH_ABSOLUTE_END_LAYERS,
          productSurfaces: STEADY_STATE_PRODUCT_SURFACES.map((surface) => ({
            id: surface.id,
            route: surface.route,
            rhythm: surface.rhythm,
          })),
          guardrails: PATH_ABSOLUTE_END_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nCommercial pilot path absolute end (${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID})\n`,
  );

  if (!result.absoluteEndActive) {
    console.log("Path absolute end not active — complete Step 14 steady state first.\n");
    console.log(`  steadyStateActive: ${result.steadyState.steadyStateActive}`);
    console.log(`  completedSteps: ${result.completedSteps}/${result.totalSteps}\n`);
    process.exit(0);
  }

  console.log("Linear commercial pilot path engineering CLOSED.\n");
  console.log(`Progress: ${result.completedSteps}/${result.totalSteps} steps`);
  console.log(`GO decision: ${result.goDecision ?? "missing"}`);
  console.log("era25+ requires explicit era charter.\n");

  for (const layer of PATH_ABSOLUTE_END_LAYERS) {
    console.log(`  Step ${layer.step} — ${layer.label} (${layer.role})`);
  }

  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
