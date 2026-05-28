#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { SERIES_A_PARTNER_EXPANSION_STEP7_DOC } from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { evaluateSeriesAPartnerExpansionEnv } from "@/scripts/ops/validate-series-a-partner-expansion-env";

export const SERIES_A_PARTNER_EXPANSION_PROGRESS_REPORT_PATH =
  "artifacts/series-a-partner-expansion-progress-report.md" as const;

export function buildSeriesAPartnerExpansionProgressReportMarkdown(
  result: ReturnType<typeof evaluateSeriesAPartnerExpansionEnv>,
): string {
  const lines: string[] = [
    "# Series A / Partner Expansion — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Prerequisites",
    "",
    `- Scale complete: **${result.scaleComplete ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Series A complete: ${result.seriesAComplete ? "yes" : "no"}`,
    "",
    "## Track checklist",
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
    lines.push("All tracked SERIES_A_* env vars present in shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:validate-series-a-partner-expansion-env");
  lines.push("npm run smoke:investor-narrative-onepager");
  lines.push("npm run smoke:competitor-feature-gap-matrix");
  lines.push("npm run smoke:woo-shopify-live");
  lines.push("npm run smoke:pilot-metrics-baseline");
  lines.push("```");
  lines.push("");
  lines.push(`Step 7 doc: [\`${SERIES_A_PARTNER_EXPANSION_STEP7_DOC}\`](../${SERIES_A_PARTNER_EXPANSION_STEP7_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateSeriesAPartnerExpansionEnv();
  const markdown = buildSeriesAPartnerExpansionProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), SERIES_A_PARTNER_EXPANSION_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SERIES_A_PARTNER_EXPANSION_PROGRESS_REPORT_PATH}`);
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
