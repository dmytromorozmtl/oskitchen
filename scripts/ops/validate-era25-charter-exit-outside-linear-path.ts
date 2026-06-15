#!/usr/bin/env npx tsx
/**
 * Validates era25 charter exit outside linear path (process — informational).
 */
import {
  resolveEra25CharterExitMilestone,
  type Era25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-era24-policy";
import {
  ERA25_CHARTER_EXIT_GUARDRAILS,
  ERA25_CHARTER_EXIT_HUMAN_STEPS,
  ERA25_CHARTER_DOC_GLOB_HINT,
  ERA_CHARTER_CRITERIA,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import { evaluateEra25CharterExitOutsideLinearPath } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";

export { evaluateEra25CharterExitOutsideLinearPath };

export function evaluateEra25CharterExitOutsideLinearPathWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateEra25CharterExitOutsideLinearPath>;
  era25CharterExitMilestone: Era25CharterExitMilestone;
  readyForTerminusGuardSmokes: boolean;
  readyForCharterChecklistSmokes: boolean;
} {
  const evaluation = evaluateEra25CharterExitOutsideLinearPath(env);
  const era25CharterExitMilestone = resolveEra25CharterExitMilestone({
    linearChainTerminusGuardMilestone:
      evaluation.terminusGuard.linearChainTerminusGuardMilestone,
    guardPassed: evaluation.terminusGuard.guard.guardPassed,
    charterChecklistPresent: evaluation.charterChecklistPresent,
    signedCharterPresent: evaluation.signedCharterPresent,
  });

  const readyForTerminusGuardSmokes =
    evaluation.terminusGuard.linearChainTerminusGuardMilestone !==
      "step17_forbidden_healthy" || !evaluation.terminusGuard.guard.guardPassed;
  const readyForCharterChecklistSmokes = !evaluation.charterChecklistPresent;

  return {
    evaluation,
    era25CharterExitMilestone,
    readyForTerminusGuardSmokes,
    readyForCharterChecklistSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25CharterExitOutsideLinearPathWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID,
          outsideLinearCatalog: true,
          guardPassed: result.evaluation.terminusGuard.guard.guardPassed,
          linearChainTerminusGuardMilestone:
            result.evaluation.terminusGuard.linearChainTerminusGuardMilestone,
          era25CharterExitMilestone: result.era25CharterExitMilestone,
          readyForTerminusGuardSmokes: result.readyForTerminusGuardSmokes,
          readyForCharterChecklistSmokes: result.readyForCharterChecklistSmokes,
          charterChecklistPresent: result.evaluation.charterChecklistPresent,
          signedCharterPresent: result.evaluation.signedCharterPresent,
          era25CharterDocs: result.evaluation.era25CharterDocs,
          charterDocGlobHint: ERA25_CHARTER_DOC_GLOB_HINT,
          criteria: ERA_CHARTER_CRITERIA,
          humanSteps: ERA25_CHARTER_EXIT_HUMAN_STEPS,
          guardrails: ERA25_CHARTER_EXIT_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 charter exit outside linear path (${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.era25CharterExitMilestone}`);
  console.log(
    `Terminus guard milestone: ${result.evaluation.terminusGuard.linearChainTerminusGuardMilestone}`,
  );
  console.log(`Charter checklist present: ${result.evaluation.charterChecklistPresent ? "yes" : "no"}`);
  console.log(`Signed charter present: ${result.evaluation.signedCharterPresent ? "yes" : "no"}`);
  console.log(`era25 charter docs: ${result.evaluation.era25CharterDocs.length}\n`);
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
