#!/usr/bin/env npx tsx
/**
 * Exports Tier 2 golden path readiness checklist (honest P0 gate + artifact + env).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildTier2GoldenPathPostP0OrchestratorSummary,
  buildTier2GoldenPathReadinessChecklistMarkdown,
  TIER2_GOLDEN_PATH_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/tier2-golden-path-post-p0-orchestrator-era21";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { evaluateTier2GoldenPathEnv } from "@/scripts/ops/validate-tier2-golden-path-env";

export { buildTier2GoldenPathReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateTier2GoldenPathEnv();
  const artifactPresent = existsSync(join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT));
  const summary = buildTier2GoldenPathPostP0OrchestratorSummary({ evaluation, artifactPresent });
  const markdown = buildTier2GoldenPathReadinessChecklistMarkdown({ summary, evaluation });

  if (write) {
    const outPath = join(process.cwd(), TIER2_GOLDEN_PATH_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${TIER2_GOLDEN_PATH_READINESS_CHECKLIST_PATH}`);
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
