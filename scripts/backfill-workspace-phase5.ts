/**
 * Backfill workspace_id on external_products and channel_import_batches (null only).
 *
 *   npx tsx scripts/backfill-workspace-phase5.ts --dry-run
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
  console.log(dryRun ? "DRY RUN — Phase 5 external products" : "LIVE Phase 5 backfill");

  const externalProducts = await backfillTable(
    prisma,
    "external_products",
    dryRun,
    (owner) => prisma.externalProduct.count({ where: { userId: owner, workspaceId: null } }),
    async (wsId, owner) => {
      const batch = await prisma.externalProduct.findMany({
        where: { userId: owner, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) return 0;
      const r = await prisma.externalProduct.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: wsId },
      });
      return r.count;
    },
  );

  const importBatches = await backfillTable(
    prisma,
    "channel_import_batches",
    dryRun,
    (owner) => prisma.channelImportBatch.count({ where: { userId: owner, workspaceId: null } }),
    async (wsId, owner) => {
      const batch = await prisma.channelImportBatch.findMany({
        where: { userId: owner, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) return 0;
      const r = await prisma.channelImportBatch.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: wsId },
      });
      return r.count;
    },
  );

  console.log(
    dryRun
      ? "Dry run complete."
      : `Updated rows — external_products: ${externalProducts}, channel_import_batches: ${importBatches}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
