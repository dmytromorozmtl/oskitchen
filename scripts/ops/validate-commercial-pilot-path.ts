#!/usr/bin/env npx tsx
/**
 * Master commercial pilot path validator — orchestrates Steps 1–16 (honest, never fakes PASS).
 */
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import {
  resolveEngineeringPathTerminusMilestone,
  type EngineeringPathTerminusMilestone,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import { ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID } from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

export { evaluateCommercialPilotPath };

export function evaluateCommercialPilotPathWithMilestones(env: NodeJS.ProcessEnv = process.env): {
  evaluation: ReturnType<typeof evaluateCommercialPilotPath>;
  maintenanceMode: ReturnType<typeof evaluateMaintenanceMode>;
  engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  readyForGateChainSmokes: boolean;
  readyForMaintenanceRhythmSmokes: boolean;
} {
  const evaluation = evaluateCommercialPilotPath(env);
  const maintenanceMode = evaluateMaintenanceMode(env);
  const engineeringPathTerminusMilestone = resolveEngineeringPathTerminusMilestone({
    maintenanceMode,
    summary: evaluation.summary,
  });
  const readyForGateChainSmokes = evaluation.summary.firstBlockedGateStep !== null;
  const readyForMaintenanceRhythmSmokes =
    maintenanceMode.maintenanceModeActive &&
    maintenanceMode.maintenanceModeMilestone !== "maintenance_mode_healthy";

  return {
    evaluation,
    maintenanceMode,
    engineeringPathTerminusMilestone,
    readyForGateChainSmokes,
    readyForMaintenanceRhythmSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateCommercialPilotPathWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
          engineeringPathTerminusMilestone: result.engineeringPathTerminusMilestone,
          sustainedOpsConvergenceReady: result.maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
          pureOperationalModeEra25Active: result.maintenanceMode.prerequisites.pureOperationalModeEra25Active,
          productEvolutionReady: result.maintenanceMode.prerequisites.productEvolutionReady,
          readyForGateChainSmokes: result.readyForGateChainSmokes,
          readyForMaintenanceRhythmSmokes: result.readyForMaintenanceRhythmSmokes,
          maintenanceModeMilestone: result.maintenanceMode.maintenanceModeMilestone,
          summary: result.evaluation.summary,
          steps: result.evaluation.steps.map((step) => ({
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
    `Progress: ${result.evaluation.summary.completedSteps}/${result.evaluation.summary.totalSteps} steps · gate chain ${result.evaluation.summary.gateStepsComplete ? "complete" : "blocked"}`,
  );
  console.log(`Path complete: ${result.evaluation.summary.pathComplete ? "yes" : "no"}`);
  console.log(
    `Engineering terminus active: ${result.evaluation.summary.engineeringTerminusActive ? "yes" : "no"}`,
  );
  console.log(`Engineering path milestone: ${result.engineeringPathTerminusMilestone}`);
  console.log(`GO decision: ${result.evaluation.summary.goDecision ?? "missing"}\n`);

  if (result.evaluation.summary.firstBlockedStep) {
    console.log(
      `First blocked: Step ${result.evaluation.summary.firstBlockedStep.step} — ${result.evaluation.summary.firstBlockedStep.label}`,
    );
    console.log(`  ${result.evaluation.summary.firstBlockedStep.detail}\n`);
  }

  for (const step of result.evaluation.steps) {
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
