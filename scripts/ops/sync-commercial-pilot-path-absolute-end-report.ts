#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
  PATH_ABSOLUTE_END_FOREVER_COMMANDS,
  PATH_ABSOLUTE_END_GUARDRAILS,
  STEADY_STATE_PRODUCT_SURFACES,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { evaluateCommercialPilotPathAbsoluteEndWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path-absolute-end";

export function buildCommercialPilotPathAbsoluteEndReportMarkdown(
  result: ReturnType<typeof evaluateCommercialPilotPathAbsoluteEndWithMilestones>,
): string {
  const lines: string[] = [
    "# Commercial Pilot Path — Absolute End Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Status",
    "",
    `- Absolute end active: **${result.evaluation.absoluteEndActive ? "yes" : "no"}**`,
    `- Path engineering closed: **${result.evaluation.pathEngineeringClosed ? "yes" : "no"}**`,
    `- Steps complete: **${result.evaluation.completedSteps}/${result.evaluation.totalSteps}**`,
    `- Absolute end milestone: **${result.absoluteEndMilestone}**`,
    `- Steady state milestone: **${result.steadyState.steadyStateMilestone}**`,
    `- Engineering path milestone: **${result.steadyState.pathEvaluation.engineeringPathTerminusMilestone}**`,
    `- era25 sustained ops convergence ready: **${result.steadyState.pathEvaluation.maintenanceMode.prerequisites.sustainedOpsConvergenceReady ? "yes" : "no"}**`,
    `- Product evolution ready: **${result.steadyState.pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady ? "yes" : "no"}**`,
    `- Maintenance mode milestone: **${result.steadyState.pathEvaluation.maintenanceMode.maintenanceModeMilestone}**`,
    `- Ready for steady state smokes: ${result.readyForSteadyStateSmokes ? "yes" : "no"}`,
    `- Ready for path closure smokes: ${result.readyForPathClosureSmokes ? "yes" : "no"}`,
    `- GO decision: **${result.evaluation.goDecision ?? "missing"}**`,
    "",
    "## Path layers (Steps 12–15)",
    "",
  ];

  for (const layer of result.evaluation.pathLayers) {
    lines.push(`- **Step ${layer.step}** — ${layer.label} · \`${layer.policyId}\` · ${layer.role}`);
  }

  lines.push("");
  lines.push("## Steady-state product surfaces");
  lines.push("");
  lines.push("| Need | Route | Rhythm | Feature |");
  lines.push("|------|-------|--------|---------|");
  for (const surface of STEADY_STATE_PRODUCT_SURFACES) {
    lines.push(
      `| ${surface.label} | \`${surface.route}\` | ${surface.rhythm} | ${surface.linkedFeature} |`,
    );
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of PATH_ABSOLUTE_END_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Guardrails");
  lines.push("");
  for (const rule of PATH_ABSOLUTE_END_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }
  lines.push("");
  lines.push(`Step 15 doc: [\`${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC}\`](../${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateCommercialPilotPathAbsoluteEndWithMilestones();
  const markdown = buildCommercialPilotPathAbsoluteEndReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH}`);
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
