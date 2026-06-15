/**
 * Backfill workspace_id on product_mappings.
 *
 *   npx tsx scripts/backfill-workspace-phase6.ts --dry-run
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
  console.log(dryRun ? "DRY RUN — Phase 6 product mappings" : "LIVE Phase 6 backfill");

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });
  let total = 0;
  for (const ws of workspaces) {
    if (dryRun) {
      const n = await prisma.productMapping.count({
        where: { userId: ws.ownerUserId, workspaceId: null },
      });
      if (n) console.log(`[dry-run] workspace ${ws.id}: product_mappings=${n}`);
      continue;
    }
    for (;;) {
      const batch = await prisma.productMapping.findMany({
        where: { userId: ws.ownerUserId, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (!batch.length) break;
      const r = await prisma.productMapping.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: ws.id },
      });
      total += r.count;
      await sleep(PAUSE_MS);
    }
  }

  console.log(dryRun ? "Dry run complete." : `Updated product_mappings: ${total}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
