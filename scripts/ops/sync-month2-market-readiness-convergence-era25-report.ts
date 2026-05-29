#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import { evaluateMonth2MarketReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-month2-market-readiness-convergence-era25";

export function buildMonth2MarketReadinessConvergenceEra25ReportMarkdown(
  result: ReturnType<typeof evaluateMonth2MarketReadinessConvergenceEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Month 2 Market Readiness Convergence Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Month 2 convergence** — honest workstreams from MONTH2_* env + artifacts.",
    "",
    "## Convergence status",
    "",
    `- Milestone: **${result.month2MarketReadinessConvergenceEra25Milestone}**`,
    `- Week 1 convergence milestone: **${result.evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone}**`,
    `- Convergence blocked: **${result.evaluation.convergenceBlocked ? "yes" : "no"}**`,
    `- Week 1 convergence ready: **${result.evaluation.week1ConvergenceReady ? "yes" : "no"}**`,
    `- Month 2 complete: **${result.evaluation.month2State.month2Complete ? "yes" : "no"}**`,
    `- Progress: **${result.evaluation.month2State.completedBlockingCount}/${result.evaluation.month2State.totalBlockingCount} blocking workstreams**`,
    `- Next workstream: **${result.evaluation.month2State.nextPhaseLabel ?? "none"}**`,
    `- Metrics baseline PASSED: **${result.evaluation.month2State.metricsBaselinePassed ? "yes" : "no"}**`,
    "",
    "## Workstreams",
    "",
  ];

  for (const phase of result.evaluation.month2State.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""} — ${phase.detail}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Convergence doc: [\`${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC}\`](../${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateMonth2MarketReadinessConvergenceEra25WithMilestones();
  const markdown = buildMonth2MarketReadinessConvergenceEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH}`);
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
