#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH,
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import { evaluatePaidPilotGoConvergenceEra25WithMilestones } from "@/scripts/ops/validate-paid-pilot-go-convergence-era25";

export function buildPaidPilotGoConvergenceEra25ReportMarkdown(
  result: ReturnType<typeof evaluatePaidPilotGoConvergenceEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Paid Pilot GO Convergence Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **B3 GO convergence** — honest GO/NO-GO from evaluator artifacts.",
    "",
    "## Convergence status",
    "",
    `- Milestone: **${result.paidPilotGoConvergenceEra25Milestone}**`,
    `- Breakthrough milestone: **${result.evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone}**`,
    `- Convergence blocked: **${result.evaluation.convergenceBlocked ? "yes" : "no"}**`,
    `- GO decision: **${result.evaluation.goState.decision ?? "missing artifact"}**`,
    `- ICP qualified: **${result.evaluation.goState.icpQualified ? "yes" : "no"}**`,
    `- LOI recorded: **${result.evaluation.goState.loiRecorded ? "yes" : "no"}**`,
    `- Forbidden claims passed: **${result.evaluation.goState.forbiddenClaimsPassed ? "yes" : "no"}**`,
    `- Kickoff checklist present: **${result.evaluation.kickoffChecklistPresent ? "yes" : "no"}**`,
    `- Artifact present: **${result.evaluation.goState.artifactPresent ? "yes" : "no"}**`,
    `- Blockers: **${result.evaluation.goState.blockerCount}**`,
    "",
    "## Human steps",
    "",
  ];

  for (const step of PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Convergence doc: [\`${PAID_PILOT_GO_CONVERGENCE_ERA25_DOC}\`](../${PAID_PILOT_GO_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluatePaidPilotGoConvergenceEra25WithMilestones();
  const markdown = buildPaidPilotGoConvergenceEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH}`);
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
