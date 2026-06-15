#!/usr/bin/env npx tsx
/**
 * Exports commercial GO closure readiness checklist (honest Tier 2 gate + env + artifact).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildCommercialGoClosurePostTier2OrchestratorSummary,
  buildCommercialGoClosureReadinessChecklistMarkdown,
  COMMERCIAL_GO_CLOSURE_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/commercial-go-closure-post-tier2-orchestrator-era21";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { evaluateCommercialGoClosureEnv } from "@/scripts/ops/validate-commercial-go-closure-env";

export { buildCommercialGoClosureReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateCommercialGoClosureEnv();
  const goNoGoArtifactPresent = existsSync(
    join(process.cwd(), PILOT_GONOGO_SUMMARY_ARTIFACT_PATH),
  );
  const summary = buildCommercialGoClosurePostTier2OrchestratorSummary({
    evaluation,
    goNoGoArtifactPresent,
  });
  const markdown = buildCommercialGoClosureReadinessChecklistMarkdown({ summary, evaluation });

  if (write) {
    const outPath = join(process.cwd(), COMMERCIAL_GO_CLOSURE_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${COMMERCIAL_GO_CLOSURE_READINESS_CHECKLIST_PATH}`);
    return;
  }

  console.log(markdown);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
