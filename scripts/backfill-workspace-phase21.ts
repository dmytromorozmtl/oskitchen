/**
 * Backfill workspace_id on Phase 21 models.
 */
import { PrismaClient } from "@prisma/client";

const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, uid: string) => Promise<number>;
  backfill: (p: PrismaClient, uid: string, ws: string) => Promise<number>;
}> = [
  {
    label: "loyalty_programs",
    count: (p, uid) => p.loyaltyProgram.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.loyaltyProgram.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "margin_rules",
    count: (p, uid) => p.marginRule.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.marginRule.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "meal_plans",
    count: (p, uid) => p.mealPlan.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.mealPlan.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "meal_plan_templates",
    count: (p, uid) => p.mealPlanTemplate.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.mealPlanTemplate.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "menu_channel_publishes",
    count: (p, uid) => p.menuChannelPublish.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.menuChannelPublish.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "menu_rotation_rules",
    count: (p, uid) => p.menuRotationRule.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.menuRotationRule.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "menu_templates",
    count: (p, uid) => p.menuTemplate.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.menuTemplate.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "notification_events",
    count: (p, uid) => p.notificationEvent.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.notificationEvent.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "notification_preferences",
    count: (p, uid) => p.notificationPreference.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.notificationPreference.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "notification_templates",
    count: (p, uid) => p.notificationTemplate.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.notificationTemplate.updateMany({
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

  console.log(`Phase 21 backfill — ${workspaces.length} workspace(s) — ${execute ? "EXECUTE" : "DRY RUN"}`);

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
