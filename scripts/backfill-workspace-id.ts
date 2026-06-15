/**
 * Backfill workspace_id on orders, menus, products from workspace owner.
 *
 * Usage (local/staging only — requires explicit approval for production):
 *   npx tsx scripts/backfill-workspace-id.ts
 *   npx tsx scripts/backfill-workspace-id.ts --dry-run
 *
 * Batches of 500 rows with 100ms pause between batches.
 */
import { PrismaClient } from "@prisma/client";

const BATCH = 500;
const PAUSE_MS = 100;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function countPending(
  prisma: PrismaClient,
  countForOwner: (ownerUserId: string) => Promise<number>,
): Promise<number> {
  const workspaces = await prisma.workspace.findMany({ select: { ownerUserId: true } });
  let total = 0;
  for (const ws of workspaces) {
    total += await countForOwner(ws.ownerUserId);
  }
  return total;
}

async function backfillTable(
  prisma: PrismaClient,
  label: string,
  dryRun: boolean,
  countForOwner: (ownerUserId: string) => Promise<number>,
  run: (workspaceId: string, ownerUserId: string) => Promise<number>,
) {
  if (dryRun) {
    const pending = await countPending(prisma, countForOwner);
    console.log(`[dry-run] ${label}: ${pending} row(s) would receive workspaceId`);
    return pending;
  }

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });
  let total = 0;
  for (const ws of workspaces) {
    const n = await run(ws.id, ws.ownerUserId);
    if (n > 0) {
      console.log(`${label}: updated ${n} rows for workspace ${ws.id}`);
      total += n;
    }
    await sleep(PAUSE_MS);
  }
  return total;
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

  console.log(dryRun ? "DRY RUN — no writes" : "LIVE backfill starting…");

  const orders = await backfillTable(
    prisma,
    "orders",
    dryRun,
    (ownerUserId) => prisma.order.count({ where: { userId: ownerUserId, workspaceId: null } }),
    async (workspaceId, ownerUserId) => {
    let updated = 0;
    for (;;) {
      const batch = await prisma.order.findMany({
        where: { userId: ownerUserId, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (batch.length === 0) break;
      const r = await prisma.order.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId },
      });
      updated += r.count;
      await sleep(PAUSE_MS);
    }
    return updated;
    },
  );

  const menus = await backfillTable(
    prisma,
    "menus",
    dryRun,
    (ownerUserId) => prisma.menu.count({ where: { userId: ownerUserId, workspaceId: null } }),
    async (workspaceId, ownerUserId) => {
    let updated = 0;
    for (;;) {
      const batch = await prisma.menu.findMany({
        where: { userId: ownerUserId, workspaceId: null },
        select: { id: true },
        take: BATCH,
      });
      if (batch.length === 0) break;
      const r = await prisma.menu.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId },
      });
      updated += r.count;
      await sleep(PAUSE_MS);
    }
    return updated;
    },
  );

  const products = await backfillTable(
    prisma,
    "products",
    dryRun,
    (ownerUserId) =>
      prisma.product.count({ where: { workspaceId: null, menu: { userId: ownerUserId } } }),
    async (workspaceId, ownerUserId) => {
    let updated = 0;
    for (;;) {
      const batch = await prisma.product.findMany({
        where: { workspaceId: null, menu: { userId: ownerUserId } },
        select: { id: true },
        take: BATCH,
      });
      if (batch.length === 0) break;
      const r = await prisma.product.updateMany({
        where: { id: { in: batch.map((b) => b.id) } },
        data: { workspaceId },
      });
      updated += r.count;
      await sleep(PAUSE_MS);
    }
    return updated;
    },
  );

  const grand = orders + menus + products;
  console.log(
    dryRun
      ? `\nDry run complete — ${grand} total row(s) across orders/menus/products.\nNext: npm run workspace:audit && phase scripts per docs/WORKSPACE_MIGRATION_RUNBOOK.md`
      : `Done. orders=${orders} menus=${menus} products=${products}`,
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
