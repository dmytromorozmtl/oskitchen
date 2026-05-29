#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";

export const CONTINUOUS_IMPROVEMENT_LOOP_PROGRESS_REPORT_PATH =
  "artifacts/continuous-improvement-loop-progress-report.md" as const;

export function buildContinuousImprovementLoopProgressReportMarkdown(
  result: ReturnType<typeof evaluateContinuousImprovementLoop>,
): string {
  const lines: string[] = [
    "# Continuous Improvement Loop — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Mode",
    "",
    `- Pure operational mode: **${result.pureOperationalMode ? "yes" : "no"}**`,
    `- Sustained ops complete: **${result.sustainedOpsComplete ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Overdue tracks: ${result.health.overdueCount}`,
    `- Due soon: ${result.health.dueSoonCount}`,
    `- Healthy: ${result.health.healthyCount}`,
    `- improvementLoopMilestone: **${result.improvementLoopMilestone}**`,
    `- Ready for weekly smokes: ${result.readyForWeeklySmokes ? "yes" : "no"}`,
    `- Ready for metrics smokes: ${result.readyForMetricsSmokes ? "yes" : "no"}`,
    `- Ready for governance smokes: ${result.readyForGovernanceSmokes ? "yes" : "no"}`,
    "",
    "## Recurring tracks",
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
    lines.push(`### ${icon} ${track.label} (${track.frequency})`);
    lines.push("");
    lines.push(`Status: **${track.status}**`);
    lines.push("");
    lines.push(track.detail);
    if (track.lastRunAt) {
      lines.push("");
      lines.push(`Last evidence: ${track.lastRunAt}`);
    }
    lines.push("");
  }

  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write");
  lines.push("npm run ops:validate-continuous-improvement-loop -- --json");
  lines.push("npm run smoke:woo-shopify-live");
  lines.push("npm run smoke:pilot-metrics-baseline");
  lines.push("npm run smoke:pilot-forbidden-claims-enforcement");
  lines.push("npm run test:ci:commercial-pilot-runbook:cert");
  lines.push("```");
  lines.push("");
  lines.push(
    `Step 10 doc: [\`${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC}\`](../${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateContinuousImprovementLoop();
  const markdown = buildContinuousImprovementLoopProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), CONTINUOUS_IMPROVEMENT_LOOP_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${CONTINUOUS_IMPROVEMENT_LOOP_PROGRESS_REPORT_PATH}`);
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
