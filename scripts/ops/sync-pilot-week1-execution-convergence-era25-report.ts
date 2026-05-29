#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
import { evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones } from "@/scripts/ops/validate-pilot-week1-execution-convergence-era25";

export function buildPilotWeek1ExecutionConvergenceEra25ReportMarkdown(
  result: ReturnType<typeof evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Pilot Week 1 Execution Convergence Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Week 1 convergence** — honest day phases from PILOT_WEEK1_* env + Day 5 artifacts.",
    "",
    "## Convergence status",
    "",
    `- Milestone: **${result.pilotWeek1ExecutionConvergenceEra25Milestone}**`,
    `- GO convergence milestone: **${result.evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone}**`,
    `- Convergence blocked: **${result.evaluation.convergenceBlocked ? "yes" : "no"}**`,
    `- GO convergence ready: **${result.evaluation.goConvergenceReady ? "yes" : "no"}**`,
    `- Week 1 complete: **${result.evaluation.week1State.week1Complete ? "yes" : "no"}**`,
    `- Progress: **${result.evaluation.week1State.completedPhaseCount}/${result.evaluation.week1State.totalPhaseCount} days**`,
    `- Next phase: **${result.evaluation.week1State.nextPhaseLabel ?? "none"}**`,
    "",
    "## Day phases",
    "",
  ];

  for (const phase of result.evaluation.week1State.phases) {
    lines.push(`- [${phase.complete ? "x" : " "}] **${phase.label}** — ${phase.detail}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Convergence doc: [\`${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC}\`](../${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones();
  const markdown = buildPilotWeek1ExecutionConvergenceEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH}`);
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
