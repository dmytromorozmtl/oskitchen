/**
 * Owners with multiple workspaces break resolveOwnerWorkspaceId (first wins).
 * Merges all rows from duplicate workspace(s) into the primary (oldest), then deletes empty duplicates.
 *
 *   npx tsx scripts/reconcile-duplicate-owner-workspaces.ts --dry-run
 *   npx tsx scripts/reconcile-duplicate-owner-workspaces.ts --execute
 */
import { PrismaClient } from "@prisma/client";

import { listScopedUserTables } from "./lib/workspace-table-map";

const prisma = new PrismaClient();

async function tableHasColumn(table: string, column: string): Promise<boolean> {
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

async function countRowsForWorkspace(table: string, workspaceId: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(*)::bigint AS count FROM "${table}" WHERE workspace_id = $1::uuid`,
    workspaceId,
  );
  return Number(rows[0]?.count ?? 0);
}

const SKIP_MERGE_TABLES = new Set(["workspaces"]);

async function mergeWorkspaceIdOnTable(
  table: string,
  fromId: string,
  toId: string,
  execute: boolean,
): Promise<number> {
  if (SKIP_MERGE_TABLES.has(table)) return 0;
  if (!(await tableHasColumn(table, "workspace_id"))) return 0;
  const before = await countRowsForWorkspace(table, fromId);
  if (before === 0) return 0;
  if (execute) {
    if (table === "workspace_members") {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "workspace_members" wm
         WHERE wm.workspace_id = $1::uuid
           AND EXISTS (
             SELECT 1 FROM "workspace_members" existing
             WHERE existing.workspace_id = $2::uuid AND existing.user_id = wm.user_id
           )`,
        fromId,
        toId,
      );
    }
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "${table}" SET workspace_id = $1::uuid WHERE workspace_id = $2::uuid`,
        toId,
        fromId,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("23505")) {
        console.warn(`  ⚠ skip ${table}: unique constraint — reconcile manually or delete conflicting rows`);
        return 0;
      }
      throw e;
    }
  }
  return before;
}

async function main() {
  const execute = process.argv.includes("--execute");
  const mode = execute ? "EXECUTE" : "DRY-RUN";
  console.log(`OS Kitchen — reconcile duplicate owner workspaces (${mode})\n`);

  const dupOwners = await prisma.$queryRaw<{ owner_user_id: string; c: number }[]>`
    SELECT owner_user_id, COUNT(*)::int AS c
    FROM workspaces
    GROUP BY owner_user_id
    HAVING COUNT(*) > 1
    ORDER BY c DESC
  `;

  if (dupOwners.length === 0) {
    console.log("OK — no owners with multiple workspaces.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${dupOwners.length} owner(s) with multiple workspaces.\n`);
  const tables = listScopedUserTables();
  let mergedWorkspaces = 0;
  let rowsTouched = 0;

  for (const { owner_user_id: ownerId, c } of dupOwners) {
    const workspaces = await prisma.workspace.findMany({
      where: { ownerUserId: ownerId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const primary = workspaces[0]!;
    const duplicates = workspaces.slice(1);
    const owner = await prisma.userProfile.findUnique({
      where: { id: ownerId },
      select: { email: true },
    });

    console.log(
      `${owner?.email ?? ownerId} — ${c} workspace(s); primary="${primary.name}" (${primary.id})`,
    );

    for (const dup of duplicates) {
      let dupRows = 0;
      for (const t of tables) {
        dupRows += await mergeWorkspaceIdOnTable(t.table, dup.id, primary.id, execute);
      }
      rowsTouched += dupRows;
      console.log(
        `  ${execute ? "merge" : "would merge"} "${dup.name}" (${dup.id}) → primary; ~${dupRows} row(s)`,
      );

      if (execute) {
        await prisma.workspaceMember.deleteMany({ where: { workspaceId: dup.id } });
        let stillReferenced = false;
        for (const t of tables) {
          if (SKIP_MERGE_TABLES.has(t.table) || t.table === "workspace_members") continue;
          if ((await countRowsForWorkspace(t.table, dup.id)) > 0) {
            stillReferenced = true;
            break;
          }
        }
        if (stillReferenced) {
          console.warn(`  ⚠ duplicate workspace ${dup.id} still referenced — not deleting`);
        } else {
          await prisma.workspace.delete({ where: { id: dup.id } });
          mergedWorkspaces += 1;
        }
      }
    }
    console.log("");
  }

  console.log(
    `${execute ? "Done" : "Dry-run"} — ${dupOwners.length} owner(s); ${mergedWorkspaces} duplicate workspace(s) ${execute ? "removed" : "would be removed"}; ~${rowsTouched} row(s) reassigned.`,
  );
  if (!execute) {
    console.log("\nRe-run with --execute to apply.");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
