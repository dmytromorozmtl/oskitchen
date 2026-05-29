#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH,
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import { evaluateScaleReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-scale-readiness-convergence-era25";

export function buildScaleReadinessConvergenceEra25ReportMarkdown(
  result: ReturnType<typeof evaluateScaleReadinessConvergenceEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Scale Readiness Convergence Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Scale convergence** — honest gates from SCALE_* env + rollback/data room artifacts.",
    "",
    "## Convergence status",
    "",
    `- Milestone: **${result.scaleReadinessConvergenceEra25Milestone}**`,
    `- Month 2 convergence milestone: **${result.evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone}**`,
    `- Convergence blocked: **${result.evaluation.convergenceBlocked ? "yes" : "no"}**`,
    `- Month 2 convergence ready: **${result.evaluation.month2ConvergenceReady ? "yes" : "no"}**`,
    `- Scale complete: **${result.evaluation.scaleState.scaleComplete ? "yes" : "no"}**`,
    `- Progress: **${result.evaluation.scaleState.completedBlockingCount}/${result.evaluation.scaleState.totalBlockingCount} blocking gates**`,
    `- Next gate: **${result.evaluation.scaleState.nextPhaseLabel ?? "none"}**`,
    `- GO decision: **${result.evaluation.scaleState.goDecision ?? "missing"}**`,
    "",
    "## Gates",
    "",
  ];

  for (const phase of result.evaluation.scaleState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""} — ${phase.detail}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Convergence doc: [\`${SCALE_READINESS_CONVERGENCE_ERA25_DOC}\`](../${SCALE_READINESS_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateScaleReadinessConvergenceEra25WithMilestones();
  const markdown = buildScaleReadinessConvergenceEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH}`);
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
