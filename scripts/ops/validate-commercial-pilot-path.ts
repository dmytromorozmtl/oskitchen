#!/usr/bin/env npx tsx
/**
 * Master commercial pilot path validator — orchestrates Steps 1–13 (honest, never fakes PASS).
 */
import { ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID } from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";

export { evaluateCommercialPilotPath };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateCommercialPilotPath();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
          summary: result.summary,
          steps: result.steps.map((step) => ({
            step: step.step,
            id: step.id,
            label: step.label,
            kind: step.kind,
            complete: step.complete,
            detail: step.detail,
            policyId: step.policyId,
            validateCommand: step.validateCommand,
          })),
          guardrails: [
            "Never hand-edit PASS in artifacts/*.json",
            "Never add era25+ gates without explicit new era charter",
            "Repeat Step 12 maintenance rhythms when terminus active",
          ],
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(`\nCommercial pilot path — master orchestration (${ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID})\n`);
  console.log(
    `Progress: ${result.summary.completedSteps}/${result.summary.totalSteps} steps · gate chain ${result.summary.gateStepsComplete ? "complete" : "blocked"}`,
  );
  console.log(`Path complete: ${result.summary.pathComplete ? "yes" : "no"}`);
  console.log(`Engineering terminus active: ${result.summary.engineeringTerminusActive ? "yes" : "no"}`);
  console.log(`GO decision: ${result.summary.goDecision ?? "missing"}\n`);

  if (result.summary.firstBlockedStep) {
    console.log(
      `First blocked: Step ${result.summary.firstBlockedStep.step} — ${result.summary.firstBlockedStep.label}`,
    );
    console.log(`  ${result.summary.firstBlockedStep.detail}\n`);
  }

  for (const step of result.steps) {
    console.log(`[${step.complete ? "COMPLETE" : "BLOCKED"}] Step ${step.step} — ${step.label} (${step.kind})`);
    console.log(`  ${step.detail}`);
    console.log(`  ${step.validateCommand}\n`);
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
