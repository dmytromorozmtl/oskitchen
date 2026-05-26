/**
 * DB verification: rows with user_id but NULL workspace_id (post-backfill).
 *
 *   npx tsx scripts/workspace-post-backfill-verify.ts
 *   npx tsx scripts/workspace-post-backfill-verify.ts --sample-owners=5
 *   npx tsx scripts/workspace-post-backfill-verify.ts --tables=orders,menus
 */
import { PrismaClient } from "@prisma/client";

import { buildWorkspaceAuditReport } from "./lib/prisma-workspace-audit";
import { listScopedUserTables, type ScopedTableRef } from "./lib/workspace-table-map";

const prisma = new PrismaClient();

function parseArg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`${name}=`))?.split("=")[1]?.trim();
}

function parseIntArg(name: string, fallback: number): number {
  const raw = parseArg(name);
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function tableHasColumn(prisma: PrismaClient, table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    ) AS exists`,
    table,
    column,
  );
  return Boolean(rows[0]?.exists);
}

async function countNullWorkspace(table: ScopedTableRef): Promise<number> {
  const hasWorkspace = await tableHasColumn(prisma, table.table, "workspace_id");
  if (!hasWorkspace) {
    throw new Error("workspace_id column does not exist");
  }
  const hasUserId = await tableHasColumn(prisma, table.table, "user_id");
  const where =
    hasUserId && !table.userIdRequired
      ? `user_id IS NOT NULL AND workspace_id IS NULL`
      : `workspace_id IS NULL`;
  const rows = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(*)::bigint AS count FROM "${table.table}" WHERE ${where}`,
  );
  return Number(rows[0]?.count ?? 0);
}

async function sampleOwners(n: number) {
  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      ownerUserId: true,
      owner: { select: { email: true } },
    },
    orderBy: { createdAt: "asc" },
    take: n,
  });

  console.log(`\n=== Owner spot-check (${workspaces.length} workspace(s)) ===\n`);

  let ownerFailures = 0;
  for (const ws of workspaces) {
    const [scopedOrders, foreignOrders] = await Promise.all([
      prisma.order.count({ where: { workspaceId: ws.id } }),
      prisma.order.count({
        where: { userId: ws.ownerUserId, workspaceId: { not: ws.id } },
      }),
    ]);
    const ok = foreignOrders === 0;
    if (!ok) ownerFailures += 1;
    console.log(
      `${ok ? "OK" : "FAIL"}  ${ws.name} <${ws.owner.email}> — orders in_workspace=${scopedOrders} foreign=${foreignOrders}`,
    );
  }
  return ownerFailures;
}

async function main() {
  const schemaReport = buildWorkspaceAuditReport();
  if (schemaReport.needsMigration > 0) {
    console.error(
      `Schema not ready: ${schemaReport.needsMigration} model(s) missing workspaceId column. Run migrations first.`,
    );
    process.exit(1);
  }

  const tablesFilter = parseArg("--tables")?.split(",").map((t) => t.trim()).filter(Boolean);
  let tables = listScopedUserTables();
  if (tablesFilter?.length) {
    const set = new Set(tablesFilter);
    tables = tables.filter((t) => set.has(t.table) || set.has(t.model));
  }

  console.log("KitchenOS — post-backfill workspace_id verification\n");
  console.log(`Checking ${tables.length} user-scoped tables…\n`);

  const failures: { table: string; model: string; nullCount: number }[] = [];
  let checked = 0;
  let skipped = 0;
  let schemaBehind = false;

  for (const t of tables) {
    try {
      const nullCount = await countNullWorkspace(t);
      checked += 1;
      if (nullCount > 0) {
        failures.push({ table: t.table, model: t.model, nullCount });
        console.log(`  FAIL  ${t.table} (${t.model}): ${nullCount} row(s) with NULL workspace_id`);
      }
    } catch (e) {
      skipped += 1;
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("does not exist") || msg.includes("42703")) {
        schemaBehind = true;
      }
      console.log(`  SKIP  ${t.table} (${t.model}): column missing or unreachable`);
    }
  }

  if (checked === 0 && schemaBehind) {
    console.error(
      "\nDatabase is behind Prisma schema (workspace_id column missing). Run:\n  npm run prisma:migrate:safe\n",
    );
    await prisma.$disconnect();
    process.exit(1);
  }

  const strict = hasFlag("--strict");

  if (strict && skipped > 0) {
    console.error(
      `\nFAIL (--strict) — ${skipped} table(s) could not be verified (missing workspace_id column or DB error).`,
    );
    console.error("Run: npm run prisma:migrate:deploy");
    await prisma.$disconnect();
    process.exit(1);
  }

  if (failures.length === 0) {
    console.log(
      `\nOK — ${checked} tables checked, 0 rows pending backfill${skipped ? ` (${skipped} skipped; use --strict to fail)` : ""}.`,
    );
  } else {
    console.error(`\nFAIL — ${failures.length} table(s) still have NULL workspace_id:`);
    for (const f of failures.slice(0, 30)) {
      console.error(`  - ${f.table}: ${f.nullCount}`);
    }
    if (failures.length > 30) {
      console.error(`  … and ${failures.length - 30} more`);
    }
    console.error("\nRun: npm run workspace:backfill:phases-12-29 -- --execute");
  }

  const sampleN = parseIntArg("--sample-owners", 0);
  let ownerFailures = 0;
  if (sampleN > 0) {
    ownerFailures = await sampleOwners(sampleN);
  }

  await prisma.$disconnect();

  if (strict && ownerFailures > 0) {
    console.error(
      `\nFAIL (--strict) — ${ownerFailures} workspace(s) have orders on a different workspace_id for the same owner.`,
    );
    console.error("Run: npx tsx scripts/reconcile-duplicate-owner-workspaces.ts --execute");
    process.exit(1);
  }

  if (failures.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
