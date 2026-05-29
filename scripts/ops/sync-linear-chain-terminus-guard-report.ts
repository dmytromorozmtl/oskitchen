#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS,
  LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearChainTerminusGuardWithMilestones } from "@/scripts/ops/validate-linear-chain-terminus-guard";

export function buildLinearChainTerminusGuardReportMarkdown(
  result: ReturnType<typeof evaluateLinearChainTerminusGuardWithMilestones>,
): string {
  const lines: string[] = [
    "# Linear Chain Terminus Guard Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Step 17 FORBIDDEN** — not a catalog step · meta-doc + guard only.",
    "",
    "## Guard status",
    "",
    `- Guard passed: **${result.guard.guardPassed ? "yes" : "no"}**`,
    `- Guard milestone: **${result.linearChainTerminusGuardMilestone}**`,
    `- Linear path milestone: **${result.linearPathPermanentlyClosedMilestone}**`,
    `- Step 17 forbidden: **yes**`,
    `- Max linear step: **${result.guard.maxLinearStep}**`,
    `- Catalog step count: **${result.guard.catalogStepCount}**`,
    `- Violations: **${result.guard.violations.length}**`,
    `- Ready for linear path closure smokes: **${result.readyForLinearPathClosureSmokes ? "yes" : "no"}**`,
    `- Ready for catalog integrity smokes: **${result.readyForCatalogIntegritySmokes ? "yes" : "no"}**`,
    "",
    "## Violations",
    "",
  ];

  if (result.guard.violations.length === 0) {
    lines.push("- none — catalog integrity PASS");
  } else {
    for (const violation of result.guard.violations) {
      lines.push(`- **${violation.id}** — ${violation.detail}`);
    }
  }

  lines.push("");
  lines.push("## Forbidden proposals (never)");
  lines.push("");
  for (const proposal of LINEAR_CHAIN_FORBIDDEN_PROPOSALS) {
    lines.push(`- ${proposal}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push(
    `Step 17 forbidden doc: [\`${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC}\`](../${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateLinearChainTerminusGuardWithMilestones();
  const markdown = buildLinearChainTerminusGuardReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH}`);
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
