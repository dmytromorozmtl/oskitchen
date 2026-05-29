#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH, MAINTENANCE_MODE_STEP12_DOC } from "@/lib/commercial/maintenance-mode-phases-era24";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

export function buildMaintenanceModePlaybookReportMarkdown(
  result: ReturnType<typeof evaluateMaintenanceMode>,
): string {
  const lines: string[] = [
    "# Maintenance Mode — Playbook Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Status",
    "",
    `- Maintenance mode active: **${result.maintenanceModeActive ? "yes" : "no"}**`,
    `- Commercial pilot path complete: **${result.commercialPilotPathComplete ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Improvement loop overdue: ${result.improvementLoop.health.overdueCount}`,
    `- Product evolution overdue: ${result.productEvolution.health.overdueCount}`,
    `- Maintenance mode milestone: **${result.maintenanceModeMilestone}**`,
    `- Ready for weekly rhythm smokes: ${result.readyForWeeklyRhythmSmokes ? "yes" : "no"}`,
    `- Ready for monthly cadence smokes: ${result.readyForMonthlyCadenceSmokes ? "yes" : "no"}`,
    "",
    "## Operator rhythms",
    "",
  ];

  for (const rhythm of result.rhythms) {
    lines.push(`### ${rhythm.label}`);
    lines.push("");
    lines.push(`Owner: **${rhythm.ownerRole}** · Status: **${rhythm.status}**`);
    lines.push("");
    lines.push(rhythm.detail);
    lines.push("");
  }

  lines.push("## Release train (non-negotiable)");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run test:ci:commercial-pilot-runbook:cert");
  lines.push("npm run ops:validate-maintenance-mode -- --json");
  lines.push("```");
  lines.push("");
  lines.push(`Step 12 doc: [\`${MAINTENANCE_MODE_STEP12_DOC}\`](../${MAINTENANCE_MODE_STEP12_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateMaintenanceMode();
  const markdown = buildMaintenanceModePlaybookReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH}`);
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
