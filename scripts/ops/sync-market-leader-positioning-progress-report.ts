#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { MARKET_LEADER_POSITIONING_STEP8_DOC } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { evaluateMarketLeaderPositioningEnv } from "@/scripts/ops/validate-market-leader-positioning-env";

export const MARKET_LEADER_POSITIONING_PROGRESS_REPORT_PATH =
  "artifacts/market-leader-positioning-progress-report.md" as const;

export function buildMarketLeaderPositioningProgressReportMarkdown(
  result: ReturnType<typeof evaluateMarketLeaderPositioningEnv>,
): string {
  const lines: string[] = [
    "# Market Leader Positioning — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Prerequisites",
    "",
    `- Series A complete: **${result.seriesAComplete ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Market leader complete: ${result.marketLeaderComplete ? "yes" : "no"}`,
    "",
    "## Pillar checklist",
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
    lines.push("All tracked MARKET_LEADER_* env vars present in shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:validate-market-leader-positioning-env");
  lines.push("npm run smoke:pilot-case-study-draft");
  lines.push("npm run smoke:pilot-forbidden-claims-enforcement");
  lines.push("npm run test:ci:commercial-pilot-runbook:cert");
  lines.push("```");
  lines.push("");
  lines.push(`Step 8 doc: [\`${MARKET_LEADER_POSITIONING_STEP8_DOC}\`](../${MARKET_LEADER_POSITIONING_STEP8_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateMarketLeaderPositioningEnv();
  const markdown = buildMarketLeaderPositioningProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), MARKET_LEADER_POSITIONING_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${MARKET_LEADER_POSITIONING_PROGRESS_REPORT_PATH}`);
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
