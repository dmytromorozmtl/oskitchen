#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

export const SUSTAINED_PRODUCT_EVOLUTION_PROGRESS_REPORT_PATH =
  "artifacts/sustained-product-evolution-progress-report.md" as const;

export function buildSustainedProductEvolutionProgressReportMarkdown(
  result: ReturnType<typeof evaluateSustainedProductEvolution>,
): string {
  const lines: string[] = [
    "# Sustained Product Evolution — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Mode",
    "",
    `- Product evolution ready: **${result.productEvolutionReady ? "yes" : "no"}**`,
    `- Improvement loop active: **${result.continuousImprovementLoopActive ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Overdue tracks: ${result.health.overdueCount}`,
    `- productEvolutionMilestone: **${result.productEvolutionMilestone}**`,
    `- Ready for feedback smokes: ${result.readyForFeedbackSmokes ? "yes" : "no"}`,
    `- Ready for leapfrog smokes: ${result.readyForLeapfrogSmokes ? "yes" : "no"}`,
    "",
    "## Product evolution tracks",
    "",
  ];

  for (const track of result.tracks) {
    const icon =
      track.status === "healthy"
        ? "✅"
        : track.status === "overdue"
          ? "🔴"
          : track.status === "due_soon"
            ? "🟡"
            : "ℹ️";
    lines.push(`### ${icon} ${track.label}`);
    lines.push("");
    lines.push(`Owner: **${track.ownerRole}** · Status: **${track.status}**`);
    lines.push("");
    lines.push(track.detail);
    lines.push("");
  }

  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write");
  lines.push("npm run ops:validate-sustained-product-evolution -- --json");
  lines.push("npm run ops:export-sustained-product-evolution-ownership-matrix -- --write");
  lines.push("npm run smoke:pilot-metrics-baseline");
  lines.push("npm run smoke:competitor-feature-gap-matrix");
  lines.push("```");
  lines.push("");
  lines.push(
    `Step 11 doc: [\`${SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC}\`](../${SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateSustainedProductEvolution();
  const markdown = buildSustainedProductEvolutionProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), SUSTAINED_PRODUCT_EVOLUTION_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SUSTAINED_PRODUCT_EVOLUTION_PROGRESS_REPORT_PATH}`);
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
