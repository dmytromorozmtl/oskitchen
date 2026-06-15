#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import { evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones } from "@/scripts/ops/validate-sustained-operational-excellence-convergence-era25";

export function buildSustainedOperationalExcellenceConvergenceEra25ReportMarkdown(
  result: ReturnType<typeof evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Sustained Operational Excellence Convergence Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Sustained ops convergence** — honest cadences from SUSTAINED_OPS_* env + artifact freshness.",
    "",
    "## Convergence status",
    "",
    `- Milestone: **${result.sustainedOperationalExcellenceConvergenceEra25Milestone}**`,
    `- Market leader convergence milestone: **${result.evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone}**`,
    `- Convergence blocked: **${result.evaluation.convergenceBlocked ? "yes" : "no"}**`,
    `- Market leader convergence ready: **${result.evaluation.marketLeaderConvergenceReady ? "yes" : "no"}**`,
    `- Sustained ops complete: **${result.evaluation.sustainedOpsState.sustainedOpsComplete ? "yes" : "no"}**`,
    `- Progress: **${result.evaluation.sustainedOpsState.completedBlockingCount}/${result.evaluation.sustainedOpsState.totalBlockingCount} blocking cadences**`,
    `- Next cadence: **${result.evaluation.sustainedOpsState.nextPhaseLabel ?? "none"}**`,
    `- GO decision: **${result.evaluation.sustainedOpsState.goDecision ?? "missing"}**`,
    "",
    "## Cadences",
    "",
  ];

  for (const phase of result.evaluation.sustainedOpsState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""} — ${phase.detail}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Convergence doc: [\`${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC}\`](../${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones();
  const markdown = buildSustainedOperationalExcellenceConvergenceEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH}`);
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
