#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_PATH,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
  TERMINAL_ERA25_EXIT,
  TERMINAL_FORBIDDEN_ACTIONS,
  TERMINAL_FOREVER_COMMANDS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { evaluateLinearPathPermanentlyClosedWithMilestones } from "@/scripts/ops/validate-linear-path-permanently-closed";

export function buildLinearPathPermanentlyClosedReportMarkdown(
  result: ReturnType<typeof evaluateLinearPathPermanentlyClosedWithMilestones>,
): string {
  const lines: string[] = [
    "# Linear Path — Permanently Closed Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Terminal status",
    "",
    `- Terminal closure active: **${result.evaluation.terminalClosureActive ? "yes" : "no"}**`,
    `- Linear path permanently closed: **${result.evaluation.linearPathPermanentlyClosed ? "yes" : "no"}**`,
    `- Linear path milestone: **${result.linearPathPermanentlyClosedMilestone}**`,
    `- Absolute end milestone: **${result.absoluteEnd.absoluteEndMilestone}**`,
    `- Doc chain steps: **${result.evaluation.docChainSteps}**`,
    `- Missing docs: **${result.missingDocChainDocs.length}**`,
    `- Terminus guard: **${result.guard.guardPassed ? "PASS" : "FAIL"}**`,
    `- Path progress: **${result.evaluation.completedSteps}/${result.evaluation.totalSteps}**`,
    `- GO decision: **${result.evaluation.goDecision ?? "missing"}**`,
    `- Ready for absolute end smokes: **${result.readyForAbsoluteEndSmokes ? "yes" : "no"}**`,
    `- Ready for doc chain smokes: **${result.readyForDocChainSmokes ? "yes" : "no"}**`,
    "",
    "## Doc chain (Steps 1–16)",
    "",
  ];

  for (const [index, docPath] of LINEAR_PATH_DOC_CHAIN_STEP_DOCS.entries()) {
    lines.push(`${index + 1}. [\`${docPath}\`](../${docPath})`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of TERMINAL_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Forbidden (never)");
  lines.push("");
  for (const rule of TERMINAL_FORBIDDEN_ACTIONS) {
    lines.push(`- ${rule}`);
  }
  lines.push("");
  lines.push("## era25+ exit (only path for new gates)");
  lines.push("");
  for (const step of TERMINAL_ERA25_EXIT) {
    lines.push(`- ${step}`);
  }
  lines.push("");
  lines.push(`Step 16 doc: [\`${LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC}\`](../${LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateLinearPathPermanentlyClosedWithMilestones();
  const markdown = buildLinearPathPermanentlyClosedReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_PATH}`);
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
