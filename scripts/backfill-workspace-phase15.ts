/**
 * Backfill workspace_id on Phase 15 models.
 *
 *   npx tsx scripts/backfill-workspace-phase15.ts --dry-run
 *   npx tsx scripts/backfill-workspace-phase15.ts --execute
 */
import { PrismaClient } from "@prisma/client";

const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, uid: string) => Promise<number>;
  backfill: (p: PrismaClient, uid: string, ws: string) => Promise<number>;
}> = [
  {
    label: "kitchen_settings",
    count: (p, uid) => p.kitchenSettings.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.kitchenSettings.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "channel_setup_progress",
    count: (p, uid) => p.channelSetupProgress.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.channelSetupProgress.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "channel_retry_attempts",
    count: (p, uid) => p.channelRetryAttempt.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.channelRetryAttempt.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "costing_runs",
    count: (p, uid) => p.costingRun.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.costingRun.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "inventory_stock",
    count: (p, uid) => p.inventoryStock.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.inventoryStock.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "gift_cards",
    count: (p, uid) => p.giftCard.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.giftCard.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "customer_segments",
    count: (p, uid) => p.customerSegment.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.customerSegment.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "delivery_routes",
    count: (p, uid) => p.deliveryRoute.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.deliveryRoute.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "forecast_runs",
    count: (p, uid) => p.forecastRun.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.forecastRun.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "copilot_settings",
    count: (p, uid) => p.copilotSettings.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.copilotSettings.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const execute = process.argv.includes("--execute");
  const prisma = new PrismaClient();
  const workspaces = await prisma.workspace.findMany({ select: { id: true, ownerUserId: true } });

  console.log(`Phase 15 backfill — ${workspaces.length} workspace(s) — ${execute ? "EXECUTE" : "DRY RUN"}`);

  let total = 0;
  for (const ws of workspaces) {
    for (const table of TABLES) {
      const pending = await table.count(prisma, ws.ownerUserId);
      if (!pending) continue;
      if (!execute) {
        console.log(`[dry] ${table.label}: ${pending}`);
        continue;
      }
      const n = await table.backfill(prisma, ws.ownerUserId, ws.id);
      total += n;
      if (n) console.log(`✓ ${table.label} +${n}`);
      await sleep(PAUSE_MS);
    }
  }

  console.log(execute ? `Done. ${total} rows updated.` : "Dry run complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
