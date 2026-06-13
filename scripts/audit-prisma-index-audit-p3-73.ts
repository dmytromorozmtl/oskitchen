/**
 * Audit Prisma index coverage (Blueprint P3-73).
 *
 * Usage:
 *   npm run audit:prisma-index-audit-p3-73
 */
import {
  auditPrismaIndexAuditP3_73,
  formatPrismaIndexAuditP3_73AuditLines,
} from "@/lib/prisma/prisma-index-audit-p3-73-audit";
import {
  auditPrismaSchemaIndexes,
  formatPrismaIndexAuditLines,
} from "@/lib/prisma/prisma-index-audit";

function main(): void {
  const upstream = auditPrismaSchemaIndexes();

  console.log("");
  for (const line of formatPrismaIndexAuditLines(upstream)) {
    console.log(line);
  }
  console.log("");

  const summary = auditPrismaIndexAuditP3_73();

  for (const line of formatPrismaIndexAuditP3_73AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Prisma index audit P3-73 OK");
}

main();
