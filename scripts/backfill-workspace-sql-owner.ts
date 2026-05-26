/**
 * SQL backfill: set workspace_id from workspace.owner_user_id for all scoped tables.
 * Faster and complete vs per-phase scripts for owner rows.
 *
 *   npx tsx scripts/backfill-workspace-sql-owner.ts --dry-run
 *   npx tsx scripts/backfill-workspace-sql-owner.ts --execute
 *   npx tsx scripts/backfill-workspace-sql-owner.ts --execute --via-members
 */
import { PrismaClient } from "@prisma/client";

import { listScopedUserTables } from "./lib/workspace-table-map";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function tableHasColumns(
  prisma: PrismaClient,
  table: string,
  columns: string[],
): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ ok: boolean }[]>(
    `SELECT COUNT(*) = $2 AS ok
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = ANY($3::text[])`,
    table,
    columns.length,
    columns,
  );
  return Boolean(rows[0]?.ok);
}

async function countPending(
  prisma: PrismaClient,
  table: string,
  userIdRequired: boolean,
): Promise<number> {
  const userClause = userIdRequired
    ? `t.user_id = w.owner_user_id`
    : `t.user_id IS NOT NULL AND t.user_id = w.owner_user_id`;
  const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count
     FROM "${table}" t
     INNER JOIN workspaces w ON ${userClause}
     WHERE t.workspace_id IS NULL`,
  );
  return Number(rows[0]?.count ?? 0);
}

async function backfillOwner(
  prisma: PrismaClient,
  table: string,
  userIdRequired: boolean,
  execute: boolean,
): Promise<number> {
  const exists = await tableHasColumns(prisma, table, ["workspace_id", "user_id"]);
  if (!exists) return 0;

  const pending = await countPending(prisma, table, userIdRequired);
  if (!pending) return 0;
  if (!execute) {
    console.log(`[dry] ${table}: ${pending} owner row(s)`);
    return pending;
  }

  const userClause = userIdRequired
    ? `t.user_id = w.owner_user_id`
    : `t.user_id IS NOT NULL AND t.user_id = w.owner_user_id`;
  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "${table}" t
     SET workspace_id = w.id
     FROM workspaces w
     WHERE ${userClause} AND t.workspace_id IS NULL`,
  );
  if (updated > 0) console.log(`✓ ${table}: +${updated}`);
  return updated;
}

async function backfillMembers(prisma: PrismaClient, table: string, execute: boolean): Promise<number> {
  const exists = await tableHasColumns(prisma, table, ["workspace_id", "user_id"]);
  if (!exists) return 0;

  const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count
     FROM "${table}" t
     INNER JOIN workspace_members wm ON t.user_id = wm.user_id
     WHERE t.workspace_id IS NULL`,
  );
  const pending = Number(rows[0]?.count ?? 0);
  if (!pending) return 0;
  if (!execute) {
    console.log(`[dry] ${table}: ${pending} member row(s)`);
    return pending;
  }

  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "${table}" t
     SET workspace_id = wm.workspace_id
     FROM workspace_members wm
     WHERE t.user_id = wm.user_id AND t.workspace_id IS NULL`,
  );
  if (updated > 0) console.log(`✓ ${table} (members): +${updated}`);
  return updated;
}

async function main() {
  const execute = hasFlag("--execute");
  const viaMembers = hasFlag("--via-members");
  const prisma = new PrismaClient();
  const tables = listScopedUserTables();

  console.log(
    `SQL owner backfill — ${tables.length} table(s) — ${execute ? "EXECUTE" : "DRY RUN"}${viaMembers ? " + members" : ""}`,
  );

  let total = 0;
  for (const t of tables) {
    total += await backfillOwner(prisma, t.table, t.userIdRequired, execute);
    if (viaMembers) {
      total += await backfillMembers(prisma, t.table, execute);
    }
  }

  if (execute) {
    const menuLinked = await prisma.$executeRawUnsafe(
      `UPDATE products p
       SET workspace_id = m.workspace_id
       FROM menus m
       WHERE p.menu_id = m.id AND p.workspace_id IS NULL AND m.workspace_id IS NOT NULL`,
    );
    if (menuLinked > 0) console.log(`✓ products (via menus): +${menuLinked}`);
    total += menuLinked;
  }

  console.log(execute ? `Done. ${total} row(s) updated.` : `Dry run complete. ${total} row(s) would update.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
