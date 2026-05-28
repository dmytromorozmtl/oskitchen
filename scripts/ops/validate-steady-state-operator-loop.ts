#!/usr/bin/env npx tsx
/**
 * Validates steady-state operator loop (Step 14, informational — never blocks release).
 */
import { POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID } from "@/lib/commercial/post-terminus-steady-state-era24-policy";
import {
  POST_TERMINUS_STEADY_STATE_GUARDRAILS,
  STEADY_STATE_RELEASE_TRAIN,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";

export { evaluateSteadyStateOperatorLoop };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSteadyStateOperatorLoop();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID,
          steadyStateActive: result.steadyStateActive,
          engineeringTerminusActive: result.engineeringTerminusActive,
          goDecision: result.goDecision,
          health: result.health,
          releaseTrain: STEADY_STATE_RELEASE_TRAIN,
          tracks: result.tracks.map((track) => ({
            id: track.id,
            label: track.label,
            ownerRole: track.ownerRole,
            frequency: track.frequency,
            status: track.status,
            detail: track.detail,
          })),
          guardrails: POST_TERMINUS_STEADY_STATE_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(`\nSteady-state operator loop (${POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID})\n`);

  if (!result.steadyStateActive) {
    console.log("Not in steady state — complete Step 13 engineering path terminus first.\n");
    console.log(`  engineeringTerminusActive: ${result.engineeringTerminusActive}`);
    console.log(`  goDecision: ${result.goDecision ?? "missing"}\n`);
    process.exit(0);
  }

  console.log("Post-terminus steady state — repeat Step 12 rhythms forever.\n");

  for (const track of result.tracks) {
    console.log(`[${track.status}] ${track.label} (${track.ownerRole})`);
    console.log(`  ${track.detail}\n`);
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
