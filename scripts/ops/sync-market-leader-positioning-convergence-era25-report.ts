#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import { evaluateMarketLeaderPositioningConvergenceEra25WithMilestones } from "@/scripts/ops/validate-market-leader-positioning-convergence-era25";

export function buildMarketLeaderPositioningConvergenceEra25ReportMarkdown(
  result: ReturnType<typeof evaluateMarketLeaderPositioningConvergenceEra25WithMilestones>,
): string {
  const lines: string[] = [
    "# era25 Market Leader Positioning Convergence Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Market leader convergence** — honest pillars from MARKET_LEADER_* env + moat/analyst artifacts.",
    "",
    "## Convergence status",
    "",
    `- Milestone: **${result.marketLeaderPositioningConvergenceEra25Milestone}**`,
    `- Series A convergence milestone: **${result.evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone}**`,
    `- Convergence blocked: **${result.evaluation.convergenceBlocked ? "yes" : "no"}**`,
    `- Series A convergence ready: **${result.evaluation.seriesAConvergenceReady ? "yes" : "no"}**`,
    `- Market leader complete: **${result.evaluation.marketLeaderState.marketLeaderComplete ? "yes" : "no"}**`,
    `- Progress: **${result.evaluation.marketLeaderState.completedBlockingCount}/${result.evaluation.marketLeaderState.totalBlockingCount} blocking pillars**`,
    `- Next pillar: **${result.evaluation.marketLeaderState.nextPhaseLabel ?? "none"}**`,
    `- GO decision: **${result.evaluation.marketLeaderState.goDecision ?? "missing"}**`,
    "",
    "## Pillars",
    "",
  ];

  for (const phase of result.evaluation.marketLeaderState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""} — ${phase.detail}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push(
    `Convergence doc: [\`${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC}\`](../${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateMarketLeaderPositioningConvergenceEra25WithMilestones();
  const markdown = buildMarketLeaderPositioningConvergenceEra25ReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH}`);
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
