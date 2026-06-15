/**
 * Tables scoped by workspace_id only (no user_id): assign NULL rows to default workspace.
 * Run after owner backfill when NOT NULL migration is pending.
 *
 *   npx tsx scripts/backfill-workspace-only-tables.ts --execute
 */
import { PrismaClient } from "@prisma/client";

const TABLES = ["support_macros", "support_sla_policies"] as const;

async function main() {
  const execute = process.argv.includes("--execute");
  const prisma = new PrismaClient();
  const ws = await prisma.workspace.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  if (!ws) {
    console.error("No workspace found.");
    process.exit(1);
  }

  for (const table of TABLES) {
    const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM "${table}" WHERE workspace_id IS NULL`,
    );
    const pending = Number(rows[0]?.count ?? 0);
    if (!pending) continue;
    if (!execute) {
      console.log(`[dry] ${table}: ${pending} → workspace ${ws.name}`);
      continue;
    }
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET workspace_id = $1::uuid WHERE workspace_id IS NULL`,
      ws.id,
    );
    console.log(`✓ ${table}: +${updated}`);
  }

  const auditPending = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM audit_logs WHERE workspace_id IS NULL`,
  );
  const auditCount = Number(auditPending[0]?.count ?? 0);
  if (auditCount > 0) {
    if (!execute) {
      console.log(`[dry] audit_logs: ${auditCount} null workspace`);
    } else {
      const updated = await prisma.$executeRawUnsafe(
        `UPDATE audit_logs SET workspace_id = $1::uuid WHERE workspace_id IS NULL`,
        ws.id,
      );
      console.log(`✓ audit_logs: +${updated}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
