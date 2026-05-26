/**
 * Backfill workspace_id on Phase 13 models (owner workspace per userId).
 *
 *   npx tsx scripts/backfill-workspace-phase13.ts --dry-run
 *   npx tsx scripts/backfill-workspace-phase13.ts --execute
 */
import { PrismaClient } from "@prisma/client";

const BATCH = 500;
const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, ownerUserId: string) => Promise<number>;
  backfill: (p: PrismaClient, ownerUserId: string, workspaceId: string) => Promise<number>;
}> = [
  {
    label: "billing_events",
    count: (p, uid) => p.billingEvent.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.billingEvent.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "usage_events",
    count: (p, uid) => p.usageEvent.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.usageEvent.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "app_feedback",
    count: (p, uid) => p.appFeedback.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.appFeedback.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "ingredients",
    count: (p, uid) => p.ingredient.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.ingredient.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "notification_logs",
    count: (p, uid) => p.notificationLog.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.notificationLog.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "copilot_conversations",
    count: (p, uid) => p.copilotConversation.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.copilotConversation.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "recipes",
    count: (p, uid) => p.recipe.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.recipe.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "push_subscriptions",
    count: (p, uid) => p.pushSubscription.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.pushSubscription.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "notification_rules",
    count: (p, uid) => p.notificationRule.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.notificationRule.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "suppliers",
    count: (p, uid) => p.supplier.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.supplier.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const execute = process.argv.includes("--execute");
  const dryRun = !execute;
  const prisma = new PrismaClient();

  const owners = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });

  console.log(`Phase 13 backfill — ${owners.length} workspaces — ${dryRun ? "DRY RUN" : "EXECUTE"}`);

  let totalUpdated = 0;
  for (const { id: workspaceId, ownerUserId } of owners) {
    for (const table of TABLES) {
      const pending = await table.count(prisma, ownerUserId);
      if (pending === 0) continue;
      if (dryRun) {
        console.log(`  [dry] ${table.label}: ${pending} rows for owner ${ownerUserId.slice(0, 8)}…`);
        continue;
      }
      const updated = await table.backfill(prisma, ownerUserId, workspaceId);
      if (updated > 0) {
        console.log(`  ${table.label}: +${updated}`);
        totalUpdated += updated;
      }
      await sleep(PAUSE_MS);
    }
  }

  console.log(dryRun ? "Dry run complete." : `Done. Updated ${totalUpdated} rows.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
