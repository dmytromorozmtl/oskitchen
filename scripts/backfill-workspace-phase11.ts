/**
 * Backfill workspace_id on import_jobs and export_jobs.
 *
 *   npx tsx scripts/backfill-workspace-phase11.ts --dry-run
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
  workspaces: { id: string; ownerUserId: string }[],
) {
  let total = 0;
  for (const ws of workspaces) {
    if (dryRun) {
      const n =
        label === "import_jobs"
          ? await prisma.importJob.count({
              where: { userId: ws.ownerUserId, workspaceId: null },
            })
          : await prisma.exportJob.count({
              where: { userId: ws.ownerUserId, workspaceId: null },
            });
      if (n) console.log(`[dry-run] workspace ${ws.id}: ${label}=${n}`);
      continue;
    }
    for (;;) {
      const batch =
        label === "import_jobs"
          ? await prisma.importJob.findMany({
              where: { userId: ws.ownerUserId, workspaceId: null },
              select: { id: true },
              take: BATCH,
            })
          : await prisma.exportJob.findMany({
              where: { userId: ws.ownerUserId, workspaceId: null },
              select: { id: true },
              take: BATCH,
            });
      if (!batch.length) break;
      const ids = batch.map((b) => b.id);
      const r =
        label === "import_jobs"
          ? await prisma.importJob.updateMany({
              where: { id: { in: ids } },
              data: { workspaceId: ws.id },
            })
          : await prisma.exportJob.updateMany({
              where: { id: { in: ids } },
              data: { workspaceId: ws.id },
            });
      total += r.count;
      await sleep(PAUSE_MS);
    }
  }
  return total;
}

async function main() {
  assertSafeEnvironment();
  const dryRun = process.argv.includes("--dry-run");
  const prisma = new PrismaClient();
  console.log(dryRun ? "DRY RUN — Phase 11 import/export jobs" : "LIVE Phase 11 backfill");

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });

  const importTotal = await backfillTable(prisma, "import_jobs", dryRun, workspaces);
  const exportTotal = await backfillTable(prisma, "export_jobs", dryRun, workspaces);

  console.log(
    dryRun
      ? "Dry run complete."
      : `Updated import_jobs: ${importTotal}, export_jobs: ${exportTotal}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
