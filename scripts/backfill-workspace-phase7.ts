/**
 * Backfill workspace_id on error_recovery_items and product_mapping_aliases.
 *
 *   npx tsx scripts/backfill-workspace-phase7.ts --dry-run
 */
import { PrismaClient } from "@prisma/client";

const BATCH = 500;
const PAUSE_MS = 100;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function assertSafeEnvironment() {
  const allowProd = process.argv.includes("--allow-production");
  if (process.env.NODE_ENV === "production" && !allowProd) {
    console.error(
      "Refusing to run on NODE_ENV=production without --allow-production. Use staging first.",
    );
    process.exit(1);
  }
}

async function backfillTable(
  prisma: PrismaClient,
  label: string,
  dryRun: boolean,
  countNull: (ownerUserId: string) => Promise<number>,
  updateBatch: (workspaceId: string, ownerUserId: string) => Promise<number>,
) {
  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });
  let total = 0;
  for (const ws of workspaces) {
    if (dryRun) {
      const n = await countNull(ws.ownerUserId);
      if (n) console.log(`[dry-run] workspace ${ws.id}: ${label}=${n}`);
      continue;
    }
    for (;;) {
      const n = await updateBatch(ws.id, ws.ownerUserId);
      if (n === 0) break;
      total += n;
      await sleep(PAUSE_MS);
    }
  }
  return total;
}

async function main() {
  assertSafeEnvironment();
  const dryRun = process.argv.includes("--dry-run");
  const prisma = new PrismaClient();
  console.log(dryRun ? "DRY RUN — Phase 7 recovery + aliases" : "LIVE Phase 7 backfill");

  const recoveries = await backfillTable(
    prisma,
    "error_recovery_items",
    dryRun,
    (owner) => prisma.errorRecoveryItem.count({ where: { userId: owner, workspaceId: null } }),
    async (wsId, owner) => {
      const batch = await prisma.errorRecoveryItem.findMany({
        where: { userId: owner, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) return 0;
      const r = await prisma.errorRecoveryItem.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: wsId },
      });
      return r.count;
    },
  );

  const aliases = await backfillTable(
    prisma,
    "product_mapping_aliases",
    dryRun,
    (owner) => prisma.productMappingAlias.count({ where: { userId: owner, workspaceId: null } }),
    async (wsId, owner) => {
      const batch = await prisma.productMappingAlias.findMany({
        where: { userId: owner, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) return 0;
      const r = await prisma.productMappingAlias.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: wsId },
      });
      return r.count;
    },
  );

  console.log(
    dryRun
      ? "Dry run complete."
      : `Updated rows — error_recovery_items: ${recoveries}, product_mapping_aliases: ${aliases}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
