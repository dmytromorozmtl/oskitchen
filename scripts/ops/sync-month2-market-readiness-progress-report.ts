#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { MONTH2_MARKET_READINESS_STEP5_DOC } from "@/lib/commercial/month2-market-readiness-phases-era21";
import { evaluateMonth2MarketReadinessEnv } from "@/scripts/ops/validate-month2-market-readiness-env";

export const MONTH2_MARKET_READINESS_PROGRESS_REPORT_PATH =
  "artifacts/month2-market-readiness-progress-report.md" as const;

export function buildMonth2MarketReadinessProgressReportMarkdown(
  result: ReturnType<typeof evaluateMonth2MarketReadinessEnv>,
): string {
  const lines: string[] = [
    "# Month 2 Market Readiness — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Prerequisites",
    "",
    `- Week 1 complete: **${result.week1Complete ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Month 2 complete: ${result.month2Complete ? "yes" : "no"}`,
    "",
    "## Workstream checklist",
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
    lines.push("All tracked Month 2 env vars present in shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:validate-month2-market-readiness-env");
  lines.push("npm run smoke:investor-narrative-onepager");
  lines.push("npm run smoke:pilot-forbidden-claims-enforcement");
  lines.push("npm run smoke:pilot-case-study-draft");
  lines.push("npm run smoke:pilot-gono-go");
  lines.push("```");
  lines.push("");
  lines.push(
    `Step 5 doc: [\`${MONTH2_MARKET_READINESS_STEP5_DOC}\`](../${MONTH2_MARKET_READINESS_STEP5_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateMonth2MarketReadinessEnv();
  const markdown = buildMonth2MarketReadinessProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), MONTH2_MARKET_READINESS_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${MONTH2_MARKET_READINESS_PROGRESS_REPORT_PATH}`);
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
