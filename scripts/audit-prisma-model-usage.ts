/**
 * Prisma unused model audit — Task 76 / docs/prisma-optimization-audit.md
 *
 * Usage: tsx scripts/audit-prisma-model-usage.ts [--write]
 * Output: artifacts/prisma-unused-models.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import {
  PRISMA_UNUSED_MODELS_ARTIFACT,
  buildPrismaUnusedModelsReport,
} from "./lib/prisma-model-usage-audit";

function main() {
  const root = process.cwd();
  const report = buildPrismaUnusedModelsReport(root);
  const shouldWrite = process.argv.includes("--write") || process.argv.includes("-w");

  console.log(`\nPrisma unused model audit (${report.version})\n`);
  console.log(`Models: ${report.schema.totalModels}`);
  console.log(
    `Zero runtime refs (Tier A): ${report.summary.zeroRuntimeReferences} | Low traffic (Tier C): ${report.summary.lowRuntimeReferences}`,
  );
  console.log(`Phase-1 drop review (no script/test refs): ${report.dropCandidates.phase1_review.length}`);
  console.log(`Overall: ${report.overall}`);

  if (report.tierA_orphan.length > 0) {
    console.log("\nTier A sample (first 15):");
    for (const row of report.tierA_orphan.slice(0, 15)) {
      console.log(`  - ${row.model} (${row.domain}) → ${row.recommendedAction}`);
    }
    if (report.tierA_orphan.length > 15) {
      console.log(`  ... and ${report.tierA_orphan.length - 15} more`);
    }
  }

  if (shouldWrite) {
    const artifactPath = join(root, PRISMA_UNUSED_MODELS_ARTIFACT);
    mkdirSync(dirname(artifactPath), { recursive: true });
    writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`\nArtifact: ${relative(root, artifactPath)}\n`);
  }
}

if (require.main === module) {
  main();
}
