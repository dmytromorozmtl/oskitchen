/**
 * Prisma index audit — fail when tenant-scope FK fields lack index coverage.
 *
 * Usage:
 *   npm run check:prisma-indexes
 */
import {
  auditPrismaSchemaIndexes,
  formatPrismaIndexAuditLines,
} from "@/lib/prisma/prisma-index-audit";

function main(): void {
  const summary = auditPrismaSchemaIndexes();

  console.log("");
  for (const line of formatPrismaIndexAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Prisma index audit OK");
}

main();
