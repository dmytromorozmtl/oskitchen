/**
 * Full workspace migration dry-run report: schema audit + DB row counts (when DATABASE_URL set).
 *
 *   npx tsx scripts/workspace-migration-dry-run-report.ts
 *   npx tsx scripts/workspace-migration-dry-run-report.ts --json > report.json
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildWorkspaceAuditReport,
  workspaceIdCoveragePercent,
} from "./lib/prisma-workspace-audit";

const PILOT_PRIORITY_MODELS = [
  "CateringQuote",
  "ApiKey",
  "BillingCustomer",
  "AutomationRule",
  "CashCount",
  "AnalyticsEvent",
  "BankTransaction",
  "CompanyAccount",
  "CommissaryTransfer",
  "AdvisoryBoardApplication",
] as const;

async function main() {
  const jsonOut = process.argv.includes("--json");
  const report = buildWorkspaceAuditReport();
  const coverage = workspaceIdCoveragePercent(report);

  const pilotNeeds = PILOT_PRIORITY_MODELS.filter((m) =>
    report.needsMigrationModels.includes(m),
  );

  let backfillLog = "";
  let dbConnected = false;
  if (process.env.DATABASE_URL) {
    try {
      backfillLog = execSync("bash scripts/run-workspace-backfill-all.sh --dry-run", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
        env: process.env,
      });
      dbConnected = true;
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string };
      backfillLog = [err.stdout, err.stderr].filter(Boolean).join("\n");
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    schema: {
      coveragePercent: coverage,
      scoped: report.scoped,
      needsMigration: report.needsMigration,
      needsMigrationModels: report.needsMigrationModels,
    },
    pilotPriorityStillNeedsColumn: pilotNeeds,
    database: {
      connected: dbConnected,
      backfillDryRunLog: backfillLog.trim() || null,
    },
  };

  if (jsonOut) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("═══════════════════════════════════════════════════");
  console.log(" KitchenOS — workspaceId migration dry-run report");
  console.log("═══════════════════════════════════════════════════\n");
  console.log(`Schema coverage: ${coverage}% (${report.scoped} scoped / ${report.needsMigration} need column)`);
  console.log(`Total Prisma models: ${report.totalModels}\n`);

  if (pilotNeeds.length) {
    console.log("Pilot-priority models still missing workspaceId column:");
    for (const m of pilotNeeds) console.log(`  ⚠️  ${m}`);
    console.log("");
  }

  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set — skipping row-level backfill dry-run.");
    console.log("Set DATABASE_URL (staging) and re-run for row counts.\n");
  } else if (backfillLog) {
    console.log("Backfill dry-run (phases 1–7, 11):\n");
    console.log(backfillLog);
  }

  const outPath = join(process.cwd(), "artifacts/workspace-migration-dry-run-latest.txt");
  try {
    writeFileSync(
      outPath,
      [
        `# workspaceId dry-run ${payload.generatedAt}`,
        `coverage: ${coverage}%`,
        `needsMigration: ${report.needsMigration}`,
        "",
        "## Pilot priority",
        ...pilotNeeds.map((m) => `- ${m}`),
        "",
        "## Backfill log",
        backfillLog || "(none)",
      ].join("\n"),
      "utf8",
    );
    console.log(`\nWrote ${outPath}`);
  } catch {
    // artifacts/ may not exist in CI
  }

  console.log("\nNext: docs/WORKSPACE_MIGRATION_RUNBOOK.md · npm run workspace:backfill:all -- --dry-run");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
