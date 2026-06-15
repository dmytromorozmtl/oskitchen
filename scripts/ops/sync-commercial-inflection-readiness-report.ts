#!/usr/bin/env npx tsx
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { buildCommercialInflectionReadinessOrchestratorReportMarkdown } from "@/lib/commercial/commercial-inflection-readiness-post-linear-closure-orchestrator-era28";
import { COMMERCIAL_INFLECTION_READINESS_REPORT_PATH } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { buildCommercialInflectionReadinessOrchestratorSummary } from "@/lib/commercial/commercial-inflection-readiness-post-linear-closure-orchestrator-era28";

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateCommercialInflectionReadiness();
  const summary = buildCommercialInflectionReadinessOrchestratorSummary({
    evaluation,
    artifacts: {
      inflectionReportPresent: existsReport(),
    },
  });
  const markdown = buildCommercialInflectionReadinessOrchestratorReportMarkdown(summary);

  if (write) {
    const path = join(process.cwd(), COMMERCIAL_INFLECTION_READINESS_REPORT_PATH);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, markdown, "utf8");
    console.log(`Wrote ${COMMERCIAL_INFLECTION_READINESS_REPORT_PATH}`);
    return;
  }

  console.log(markdown);
}

function existsReport(): boolean {
  return existsSync(join(process.cwd(), COMMERCIAL_INFLECTION_READINESS_REPORT_PATH));
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
