#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  POST_TERMINUS_STEADY_STATE_REPORT_PATH,
  POST_TERMINUS_STEADY_STATE_STEP14_DOC,
  STEADY_STATE_RELEASE_TRAIN,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";

export function buildSteadyStateOperatorLoopReportMarkdown(
  result: ReturnType<typeof evaluateSteadyStateOperatorLoopWithMilestones>,
): string {
  const lines: string[] = [
    "# Steady-State Operator Loop — Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Status",
    "",
    `- Steady state active: **${result.evaluation.steadyStateActive ? "yes" : "no"}**`,
    `- Engineering terminus active: **${result.evaluation.engineeringTerminusActive ? "yes" : "no"}**`,
    `- Steady state milestone: **${result.steadyStateMilestone}**`,
    `- Engineering path milestone: **${result.pathEvaluation.engineeringPathTerminusMilestone}**`,
    `- era25 sustained ops convergence ready: **${result.pathEvaluation.maintenanceMode.prerequisites.sustainedOpsConvergenceReady ? "yes" : "no"}**`,
    `- Product evolution ready: **${result.pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady ? "yes" : "no"}**`,
    `- Maintenance mode milestone: **${result.pathEvaluation.maintenanceMode.maintenanceModeMilestone}**`,
    `- Ready for maintenance rhythm smokes: ${result.readyForMaintenanceRhythmSmokes ? "yes" : "no"}`,
    `- Ready for upstream loop smokes: ${result.readyForUpstreamLoopSmokes ? "yes" : "no"}`,
    `- GO decision: **${result.evaluation.goDecision ?? "missing"}**`,
    `- Overdue tracks: ${result.evaluation.health.overdueCount}`,
    `- Healthy tracks: ${result.evaluation.health.healthyCount}`,
    "",
    "## Release train",
    "",
    "```bash",
    ...STEADY_STATE_RELEASE_TRAIN.map((cmd) => `npm run ${cmd}`),
    "```",
    "",
    "## Operator tracks",
    "",
  ];

  for (const track of result.evaluation.tracks) {
    lines.push(`### ${track.label}`);
    lines.push("");
    lines.push(`Owner: **${track.ownerRole}** · Status: **${track.status}**`);
    lines.push("");
    lines.push(track.detail);
    lines.push("");
  }

  lines.push(`Step 14 doc: [\`${POST_TERMINUS_STEADY_STATE_STEP14_DOC}\`](../${POST_TERMINUS_STEADY_STATE_STEP14_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateSteadyStateOperatorLoopWithMilestones();
  const markdown = buildSteadyStateOperatorLoopReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), POST_TERMINUS_STEADY_STATE_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${POST_TERMINUS_STEADY_STATE_REPORT_PATH}`);
  } else {
    console.log(markdown);
  }
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
