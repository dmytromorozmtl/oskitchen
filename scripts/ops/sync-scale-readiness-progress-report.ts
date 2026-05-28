#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { SCALE_READINESS_STEP6_DOC } from "@/lib/commercial/scale-readiness-phases-era21";
import { evaluateScaleReadinessEnv } from "@/scripts/ops/validate-scale-readiness-env";

export const SCALE_READINESS_PROGRESS_REPORT_PATH =
  "artifacts/scale-readiness-progress-report.md" as const;

export function buildScaleReadinessProgressReportMarkdown(
  result: ReturnType<typeof evaluateScaleReadinessEnv>,
): string {
  const lines: string[] = [
    "# Scale Readiness — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Prerequisites",
    "",
    `- Month 2 complete: **${result.month2Complete ? "yes" : "no"}**`,
    `- GO decision: **${result.goDecision ?? "missing"}**`,
    `- Scale complete: ${result.scaleComplete ? "yes" : "no"}`,
    "",
    "## Gate checklist",
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
    lines.push("All tracked SCALE_* env vars present in shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:validate-scale-readiness-env");
  lines.push("npm run smoke:pilot-rollback-drill");
  lines.push("npm run smoke:commerce-webhook-drill");
  lines.push("npm run smoke:pilot-gono-go");
  lines.push("```");
  lines.push("");
  lines.push(`Step 6 doc: [\`${SCALE_READINESS_STEP6_DOC}\`](../${SCALE_READINESS_STEP6_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateScaleReadinessEnv();
  const markdown = buildScaleReadinessProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), SCALE_READINESS_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SCALE_READINESS_PROGRESS_REPORT_PATH}`);
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
