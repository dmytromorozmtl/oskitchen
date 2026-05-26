/**
 * Backfill workspace_id on external_orders, channel_conflicts, channel_sync_jobs.
 *
 *   npx tsx scripts/backfill-workspace-phase4.ts --dry-run
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
  console.log(dryRun ? "DRY RUN — Phase 4 channels" : "LIVE Phase 4 backfill");

  const external = await backfillTable(
    prisma,
    "external_orders",
    dryRun,
    (owner) => prisma.externalOrder.count({ where: { userId: owner, workspaceId: null } }),
    async (wsId, owner) => {
      const batch = await prisma.externalOrder.findMany({
        where: { userId: owner, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) return 0;
      const r = await prisma.externalOrder.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: wsId },
      });
      return r.count;
    },
  );

  const conflicts = await backfillTable(
    prisma,
    "channel_conflicts",
    dryRun,
    (owner) => prisma.channelConflict.count({ where: { userId: owner, workspaceId: null } }),
    async (wsId, owner) => {
      const batch = await prisma.channelConflict.findMany({
        where: { userId: owner, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) return 0;
      const r = await prisma.channelConflict.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: wsId },
      });
      return r.count;
    },
  );

  const syncJobs = await backfillTable(
    prisma,
    "channel_sync_jobs",
    dryRun,
    (owner) => prisma.channelSyncJob.count({ where: { userId: owner, workspaceId: null } }),
    async (wsId, owner) => {
      const batch = await prisma.channelSyncJob.findMany({
        where: { userId: owner, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) return 0;
      const r = await prisma.channelSyncJob.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: wsId },
      });
      return r.count;
    },
  );

  console.log(
    dryRun
      ? "Dry run complete."
      : `Updated rows — external_orders: ${external}, channel_conflicts: ${conflicts}, channel_sync_jobs: ${syncJobs}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
