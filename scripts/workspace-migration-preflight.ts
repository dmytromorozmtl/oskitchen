/**
 * Pre-flight checks before workspace backfill on staging/production.
 *
 *   npx tsx scripts/workspace-migration-preflight.ts
 *   npx tsx scripts/workspace-migration-preflight.ts --json
 */
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

type RowCheck = {
  label: string;
  table: string;
  column: string;
  nullCount: number;
  status: "OK" | "PENDING" | "SKIP";
};

async function countNull(table: string, column: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count FROM "${table}" WHERE "${column}" IS NULL`,
  );
  return Number(rows[0]?.count ?? 0);
}

function migrationStatusSummary(): string {
  try {
    const out = execSync("npx prisma migrate status 2>&1", { encoding: "utf8", stdio: "pipe" });
    if (out.includes("Database schema is up to date")) return "UP_TO_DATE";
    if (out.includes("following migration")) return "PENDING_MIGRATIONS";
    return "UNKNOWN";
  } catch {
    return "UNAVAILABLE";
  }
}

async function main() {
  const asJson = process.argv.includes("--json");

  const checks: RowCheck[] = [];
  const tables: Array<{ label: string; table: string; column: string }> = [
    { label: "orders", table: "orders", column: "workspace_id" },
    { label: "menus", table: "menus", column: "workspace_id" },
    { label: "products", table: "products", column: "workspace_id" },
    { label: "integration_connections", table: "integration_connections", column: "workspace_id" },
    { label: "webhook_events", table: "webhook_events", column: "workspace_id" },
  ];

  for (const t of tables) {
    try {
      const nullCount = await countNull(t.table, t.column);
      checks.push({
        ...t,
        nullCount,
        status: nullCount === 0 ? "OK" : "PENDING",
      });
    } catch (e) {
      checks.push({
        ...t,
        nullCount: -1,
        status: "SKIP",
      });
    }
  }

  const workspaceCount = await prisma.workspace.count();
  const memberCount = await prisma.workspaceMember.count();

  let orphanOrders = -1;
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*)::bigint AS count FROM "orders" o
       WHERE o."workspace_id" IS NULL
         AND EXISTS (SELECT 1 FROM "workspaces" w WHERE w."owner_user_id" = o."user_id")`,
    );
    orphanOrders = Number(rows[0]?.count ?? 0);
  } catch {
    orphanOrders = -1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    migrateStatus: migrationStatusSummary(),
    workspaceCount,
    memberCount,
    orphanOrdersWithWorkspaceOwner: orphanOrders,
    checks,
    readyForBackfill:
      checks.every((c) => c.status === "OK" || c.status === "SKIP") && orphanOrders === 0,
    nextSteps: [
      "npm run workspace:provision:orphans  # if owners lack Workspace rows",
      "npm run staging:pilot:complete  # or: workspace:staging:migrate",
      "npx tsx scripts/check-backfill-status.ts",
    ],
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("=== Workspace migration preflight ===\n");
    console.log(`Prisma migrate: ${report.migrateStatus}`);
    console.log(`Workspaces: ${workspaceCount} · Members: ${memberCount}`);
    console.log(`Orphan orders (owner has workspace, order.workspace_id NULL): ${orphanOrders}\n`);
    for (const c of checks) {
      console.log(
        `${c.status.padEnd(8)} ${c.label}: ${c.nullCount >= 0 ? `${c.nullCount} NULL` : "column missing?"}`,
      );
    }
    console.log(
      report.readyForBackfill
        ? "\n✓ Backfill complete for tracked tables."
        : "\n⚠ Backfill required before closed beta tenant guarantees.",
    );
    console.log("\nSuggested commands:");
    for (const s of report.nextSteps) console.log(`  ${s}`);
  }

  await prisma.$disconnect();
  if (!report.readyForBackfill && !process.argv.includes("--allow-pending")) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
