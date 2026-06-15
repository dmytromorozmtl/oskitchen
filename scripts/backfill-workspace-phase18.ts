/**
 * Backfill workspace_id on Phase 18 models.
 */
import { PrismaClient } from "@prisma/client";

const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, uid: string) => Promise<number>;
  backfill: (p: PrismaClient, uid: string, ws: string) => Promise<number>;
}> = [
  {
    label: "food_safety_checklists",
    count: (p, uid) => p.foodSafetyChecklist.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.foodSafetyChecklist.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "food_safety_audits",
    count: (p, uid) => p.foodSafetyAudit.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.foodSafetyAudit.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "food_safety_corrective_actions",
    count: (p, uid) => p.foodSafetyCorrectiveAction.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.foodSafetyCorrectiveAction.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "franchises",
    count: (p, uid) => p.franchise.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.franchise.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "go_live_projects",
    count: (p, uid) => p.goLiveProject.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.goLiveProject.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "go_live_test_runs",
    count: (p, uid) => p.goLiveTestRun.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.goLiveTestRun.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "grubhub_deliveries",
    count: (p, uid) => p.grubhubDelivery.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.grubhubDelivery.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "holiday_packages",
    count: (p, uid) => p.holidayPackage.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.holidayPackage.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "holiday_package_orders",
    count: (p, uid) => p.holidayPackageOrder.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.holidayPackageOrder.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "implementation_projects",
    count: (p, uid) => p.implementationProject.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.implementationProject.updateMany({
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

  console.log(`Phase 18 backfill — ${workspaces.length} workspace(s) — ${execute ? "EXECUTE" : "DRY RUN"}`);

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
