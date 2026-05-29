#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import { evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones } from "@/scripts/ops/validate-series-a-partner-expansion-convergence-era25";

export function buildSeriesAPartnerExpansionConvergenceEra25ReportMarkdown(
  result: ReturnType<typeof evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Series A / Partner Expansion Convergence Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Series A convergence** — honest tracks from SERIES_A_* env + data room/partner artifacts.",
    "",
    "## Convergence status",
    "",
    `- Milestone: **${result.seriesAPartnerExpansionConvergenceEra25Milestone}**`,
    `- Scale convergence milestone: **${result.evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone}**`,
    `- Convergence blocked: **${result.evaluation.convergenceBlocked ? "yes" : "no"}**`,
    `- Scale convergence ready: **${result.evaluation.scaleConvergenceReady ? "yes" : "no"}**`,
    `- Series A complete: **${result.evaluation.seriesAState.seriesAComplete ? "yes" : "no"}**`,
    `- Progress: **${result.evaluation.seriesAState.completedBlockingCount}/${result.evaluation.seriesAState.totalBlockingCount} blocking tracks**`,
    `- Next track: **${result.evaluation.seriesAState.nextPhaseLabel ?? "none"}**`,
    `- GO decision: **${result.evaluation.seriesAState.goDecision ?? "missing"}**`,
    "",
    "## Tracks",
    "",
  ];

  for (const phase of result.evaluation.seriesAState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""} — ${phase.detail}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Convergence doc: [\`${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC}\`](../${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones();
  const markdown = buildSeriesAPartnerExpansionConvergenceEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH}`);
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
