/**
 * Prisma performance audit — indexes, N+1 heuristics, soft delete coverage, OOM risk.
 *
 * Usage: tsx scripts/audit-prisma-performance.ts [--write]
 * Output: artifacts/prisma-performance-audit.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import {
  PRISMA_PERFORMANCE_AUDIT_ARTIFACT,
  buildPrismaPerformanceAuditReport,
} from "./lib/prisma-performance-audit";

function main() {
  const root = process.cwd();
  const report = buildPrismaPerformanceAuditReport(root);
  const shouldWrite = process.argv.includes("--write") || process.argv.includes("-w");

  console.log(`\nPrisma performance audit (${report.version})\n`);
  console.log(
    `Models: ${report.schema.totalModels} | indexes: ${report.schema.totalIndexDeclarations} | workspace scoped: ${report.schema.workspaceScoped}`,
  );
  console.log(
    `Soft delete coverage (candidates): ${report.softDelete.coveragePercent}% | N+1 signals: ${report.nPlusOne.count} | unbounded findMany: ${report.oomRisk.unboundedFindManyCount}`,
  );
  console.log(`Overall: ${report.overall}`);

  if (report.recommendations.length > 0) {
    console.log("\nRecommendations:");
    for (const rec of report.recommendations) {
      console.log(`  - ${rec}`);
    }
  }

  if (shouldWrite) {
    const artifactPath = join(root, PRISMA_PERFORMANCE_AUDIT_ARTIFACT);
    mkdirSync(dirname(artifactPath), { recursive: true });
    writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`\nArtifact: ${relative(root, artifactPath)}\n`);
  }
}

if (require.main === module) {
  main();
}
