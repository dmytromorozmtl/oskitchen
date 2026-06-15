/**
 * Backfill workspace_id on integration_connections and webhook_events.
 *
 *   npx tsx scripts/backfill-workspace-phase2.ts --dry-run
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

async function main() {
  assertSafeEnvironment();
  const dryRun = process.argv.includes("--dry-run");
  const prisma = new PrismaClient();
  console.log(dryRun ? "DRY RUN" : "LIVE Phase 2 backfill");

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });

  let connTotal = 0;
  let whTotal = 0;

  for (const ws of workspaces) {
    if (dryRun) {
      const c = await prisma.integrationConnection.count({
        where: { userId: ws.ownerUserId, workspaceId: null },
      });
      const w = await prisma.webhookEvent.count({
        where: { userId: ws.ownerUserId, workspaceId: null },
      });
      if (c || w) console.log(`[dry-run] workspace ${ws.id}: connections=${c} webhooks=${w}`);
      continue;
    }

    for (;;) {
      const batch = await prisma.integrationConnection.findMany({
        where: { userId: ws.ownerUserId, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (batch.length === 0) break;
      const r = await prisma.integrationConnection.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: ws.id },
      });
      connTotal += r.count;
    }

    for (;;) {
      const batch = await prisma.webhookEvent.findMany({
        where: { userId: ws.ownerUserId, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (batch.length === 0) break;
      const r = await prisma.webhookEvent.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: ws.id },
      });
      whTotal += r.count;
    }

    await sleep(PAUSE_MS);
  }

  console.log(dryRun ? "Done (dry-run)" : `Done. connections=${connTotal} webhooks=${whTotal}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
