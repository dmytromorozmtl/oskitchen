#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH,
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
} from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";

export function buildCommercialPilotPathStatusReportMarkdown(
  result: ReturnType<typeof evaluateCommercialPilotPath>,
): string {
  const lines: string[] = [
    "# Commercial Pilot Path — Status Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Steps complete: **${result.summary.completedSteps}/${result.summary.totalSteps}**`,
    `- Gate chain complete: **${result.summary.gateStepsComplete ? "yes" : "no"}**`,
    `- Commercial pilot path complete: **${result.summary.pathComplete ? "yes" : "no"}**`,
    `- Engineering terminus active: **${result.summary.engineeringTerminusActive ? "yes" : "no"}**`,
    `- GO decision: **${result.summary.goDecision ?? "missing"}**`,
    "",
  ];

  if (result.summary.firstBlockedStep) {
    lines.push("## First blocked step");
    lines.push("");
    lines.push(
      `Step **${result.summary.firstBlockedStep.step}** — ${result.summary.firstBlockedStep.label}`,
    );
    lines.push("");
    lines.push(result.summary.firstBlockedStep.detail);
    lines.push("");
  }

  lines.push("## Step catalog");
  lines.push("");

  for (const step of result.steps) {
    lines.push(`### Step ${step.step} — ${step.label}`);
    lines.push("");
    lines.push(`- Kind: **${step.kind}**`);
    lines.push(`- Policy: \`${step.policyId}\``);
    lines.push(`- Status: **${step.complete ? "complete" : "blocked"}**`);
    lines.push(`- Detail: ${step.detail}`);
    lines.push(`- Validate: \`${step.validateCommand}\``);
    lines.push(`- Doc: [\`${step.docPath}\`](../${step.docPath})`);
    lines.push("");
  }

  lines.push("## Master validate (non-negotiable)");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:validate-commercial-pilot-path -- --json");
  lines.push("npm run test:ci:commercial-pilot-runbook:cert");
  lines.push("npm run ops:validate-maintenance-mode -- --json");
  lines.push("```");
  lines.push("");
  lines.push(`Step 13 doc: [\`${ENGINEERING_PATH_TERMINUS_STEP13_DOC}\`](../${ENGINEERING_PATH_TERMINUS_STEP13_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateCommercialPilotPath();
  const markdown = buildCommercialPilotPathStatusReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH}`);
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
