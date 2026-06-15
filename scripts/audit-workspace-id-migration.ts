/**
 * Audits Prisma models for workspaceId migration status.
 *
 *   npx tsx scripts/audit-workspace-id-migration.ts
 *   npx tsx scripts/audit-workspace-id-migration.ts --json
 */
import { buildWorkspaceAuditReport } from "./lib/prisma-workspace-audit";

function main() {
  const report = buildWorkspaceAuditReport();
  const jsonOut = process.argv.includes("--json");

  if (jsonOut) {
    console.log(
      JSON.stringify(
        {
          totalModels: report.totalModels,
          scoped: report.scoped,
          needsMigration: report.needsMigration,
          noUserScope: report.noUserScope,
          needsMigrationModels: report.needsMigrationModels,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("OS Kitchen — workspaceId migration audit\n");
  console.log(`Total models: ${report.totalModels}`);
  console.log(`  ✅ workspaceId present: ${report.scoped}`);
  console.log(`  ⚠️  userId only (needs migration): ${report.needsMigration}`);
  console.log(`  —  no userId field: ${report.noUserScope}\n`);

  if (report.needsMigration) {
    console.log("Models with userId but NO workspaceId:\n");
    for (const m of report.needsMigrationModels) {
      console.log(`  ⚠️  ${m}`);
    }
    console.log("\nRun: npm run workspace:migration:dry-run-report");
    process.exitCode = 1;
  } else {
    console.log("All user-scoped models have workspaceId.");
  }
}

main();
