#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { evaluateSustainedOperationalExcellenceEnv } from "@/scripts/ops/validate-sustained-operational-excellence-env";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_PROGRESS_REPORT_PATH =
  "artifacts/sustained-operational-excellence-progress-report.md" as const;

export function buildSustainedOperationalExcellenceProgressReportMarkdown(
  result: ReturnType<typeof evaluateSustainedOperationalExcellenceEnv>,
): string {
  const lines: string[] = [
    "# Sustained Operational Excellence — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Prerequisites",
    "",
    `- Market leader complete: **${result.marketLeaderComplete ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Sustained ops complete: ${result.sustainedOpsComplete ? "yes" : "no"}`,
    "",
    "## Cadence checklist",
    "",
  ];

  for (const phase of result.phases) {
    const icon = phase.complete ? "✅" : phase.optional ? "➖" : "⬜";
    lines.push(`### ${icon} ${phase.label}${phase.optional ? " (optional)" : ""}`);
    lines.push("");
    lines.push(phase.detail);
    lines.push("");
  }

  lines.push("## Env vars");
  lines.push("");
  if (result.missing.length === 0) {
    lines.push("All tracked SUSTAINED_OPS_* env vars present in shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:validate-sustained-operational-excellence-env");
  lines.push("npm run smoke:woo-shopify-live");
  lines.push("npm run smoke:pilot-metrics-baseline");
  lines.push("npm run smoke:pilot-forbidden-claims-enforcement");
  lines.push("```");
  lines.push("");
  lines.push(
    `Step 9 doc: [\`${SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC}\`](../${SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateSustainedOperationalExcellenceEnv();
  const markdown = buildSustainedOperationalExcellenceProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SUSTAINED_OPERATIONAL_EXCELLENCE_PROGRESS_REPORT_PATH}`);
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
