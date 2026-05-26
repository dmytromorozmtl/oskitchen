/**
 * Backfill workspace_id on kitchen_customers from workspace owner.
 *
 *   npx tsx scripts/backfill-workspace-phase3.ts --dry-run
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
  console.log(dryRun ? "DRY RUN — Phase 3 CRM" : "LIVE Phase 3 backfill (kitchen_customers)");

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });

  let total = 0;
  for (const ws of workspaces) {
    if (dryRun) {
      const n = await prisma.kitchenCustomer.count({
        where: { userId: ws.ownerUserId, workspaceId: null },
      });
      if (n) console.log(`[dry-run] workspace ${ws.id}: customers=${n}`);
      continue;
    }

    for (;;) {
      const batch = await prisma.kitchenCustomer.findMany({
        where: { userId: ws.ownerUserId, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (batch.length === 0) break;
      const r = await prisma.kitchenCustomer.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId: ws.id },
      });
      total += r.count;
      await sleep(PAUSE_MS);
    }
  }

  console.log(dryRun ? "Dry run complete." : `Updated ${total} kitchen_customers rows.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
