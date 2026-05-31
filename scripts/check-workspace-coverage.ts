/**
 * CI guard: workspaceId field coverage on user-scoped Prisma models.
 *
 *   npx tsx scripts/check-workspace-coverage.ts
 *   npx tsx scripts/check-workspace-coverage.ts --fail-below 100
 *   npx tsx scripts/check-workspace-coverage.ts --max-needs-migration 180
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildWorkspaceAuditReport,
  workspaceIdCoveragePercent,
} from "./lib/prisma-workspace-audit";

function parseArg(name: string): number | undefined {
  const hit = process.argv.find((a) => a.startsWith(`${name}=`));
  if (!hit) return undefined;
  const n = Number(hit.split("=")[1]);
  return Number.isFinite(n) ? n : undefined;
}

function main() {
  const report = buildWorkspaceAuditReport();
  const coverage = workspaceIdCoveragePercent(report);
  const failBelow = parseArg("--fail-below");
  const maxNeeds = parseArg("--max-needs-migration");

  console.log("OS Kitchen — workspaceId coverage check\n");
  console.log(`User-scoped models: ${report.scoped + report.needsMigration}`);
  console.log(`  ✅ with workspaceId field: ${report.scoped}`);
  console.log(`  ⚠️  userId only (needs column): ${report.needsMigration}`);
  console.log(`Coverage: ${coverage}% (target 100%)\n`);

  let failed = false;

  if (failBelow !== undefined && coverage < failBelow) {
    console.error(`FAIL: coverage ${coverage}% < --fail-below=${failBelow}`);
    failed = true;
  }

  if (maxNeeds !== undefined && report.needsMigration > maxNeeds) {
    console.error(
      `FAIL: ${report.needsMigration} models need migration > --max-needs-migration=${maxNeeds}`,
    );
    failed = true;
  }

  if (failBelow === 100 && report.needsMigration > 0) {
    console.error("\nModels still missing workspaceId column:\n");
    for (const m of report.needsMigrationModels.slice(0, 40)) {
      console.error(`  - ${m}`);
    }
    if (report.needsMigrationModels.length > 40) {
      console.error(`  … and ${report.needsMigrationModels.length - 40} more`);
    }
    console.error("\nSee docs/WORKSPACE_MIGRATION_RUNBOOK.md");
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }

  console.log("OK — workspace coverage check passed.");
}

main();
