#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { COMMERCIAL_GO_CLOSURE_STEP3_DOC } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { evaluateCommercialGoClosureEnv } from "@/scripts/ops/validate-commercial-go-closure-env";

export const COMMERCIAL_GO_CLOSURE_PROGRESS_REPORT_PATH =
  "artifacts/commercial-go-closure-progress-report.md" as const;

export function buildCommercialGoClosureProgressReportMarkdown(
  result: ReturnType<typeof evaluateCommercialGoClosureEnv>,
): string {
  const lines: string[] = [
    "# Commercial GO Closure — Progress Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Prerequisites",
    "",
    `- P0: **${result.prerequisites.p0ProofStatus ?? "missing"}**`,
    `- Tier 2: **${result.prerequisites.tier2ProofStatus ?? "missing"}**`,
    `- Prerequisites complete: ${result.prerequisites.prerequisitesComplete ? "yes" : "no"}`,
    "",
    "## Phase checklist",
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
    lines.push("All tracked commercial GO env vars present in shell.");
  } else {
    for (const key of result.missing) {
      lines.push(`- \`${key}\` — not set`);
    }
  }

  lines.push("");
  lines.push(`**GO artifact:** \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`**Decision:** ${result.decision ?? "not evaluated"}`);
  lines.push(`**Ready for orchestrator:** ${result.readyForGoOrchestrator ? "yes" : "no"}`);
  lines.push("");
  lines.push("## Next commands");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run ops:validate-commercial-go-closure-env");
  lines.push("npm run smoke:pilot-forbidden-claims-enforcement");
  lines.push("npm run smoke:pilot-gono-go");
  lines.push("```");
  lines.push("");
  lines.push(`Step 3 doc: [\`${COMMERCIAL_GO_CLOSURE_STEP3_DOC}\`](../${COMMERCIAL_GO_CLOSURE_STEP3_DOC})`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const result = evaluateCommercialGoClosureEnv();
  const markdown = buildCommercialGoClosureProgressReportMarkdown(result);

  if (write) {
    const outPath = join(process.cwd(), COMMERCIAL_GO_CLOSURE_PROGRESS_REPORT_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${COMMERCIAL_GO_CLOSURE_PROGRESS_REPORT_PATH}`);
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
