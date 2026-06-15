#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { PILOT_WEEK1_EXECUTION_STEP4_DOC } from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";

export const PILOT_WEEK1_PROGRESS_REPORT_PATH =
  "artifacts/pilot-week1-progress-report.md" as const;

export function buildPilotWeek1ProgressReportMarkdown(
  result: ReturnType<typeof evaluatePilotWeek1Env>,
): string {
  const lines: string[] = [
    "# Pilot Week 1 — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Milestone",
    "",
    `- week1Milestone: **${result.week1Milestone}**`,
    "",
    "## Prerequisites",
    "",
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Prerequisites complete: ${result.prerequisites.prerequisitesComplete ? "yes" : "no"}`,
    `- Week 1 complete: ${result.week1Complete ? "yes" : "no"}`,
    "",
    "## Day checklist",
    "",
  ];

  for (const phase of result.phases) {
    lines.push(`### ${phase.complete ? "✅" : "⬜"} ${phase.label}`);
    lines.push("");
    lines.push(phase.detail);
    lines.push("");
  }

  lines.push("## Env vars");
  lines.push("");
  if (result.missing.length === 0) {
    lines.push("All tracked PILOT_WEEK1_* env vars present in shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push(`**GO artifact:** \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`**Ready for Day 5 smokes:** ${result.readyForDay5Smokes ? "yes" : "no"}`);
  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:run-pilot-week1-execution-post-go-orchestrator -- --write");
  lines.push("npm run ops:validate-pilot-week1-env -- --json");
  lines.push("npm run smoke:pilot-metrics-baseline");
  lines.push("npm run smoke:pilot-case-study-draft");
  lines.push("npm run smoke:pilot-gono-go");
  lines.push("```");
  lines.push("");
  lines.push(`Step 4 doc: [\`${PILOT_WEEK1_EXECUTION_STEP4_DOC}\`](../${PILOT_WEEK1_EXECUTION_STEP4_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluatePilotWeek1Env();
  const markdown = buildPilotWeek1ProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), PILOT_WEEK1_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${PILOT_WEEK1_PROGRESS_REPORT_PATH}`);
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
