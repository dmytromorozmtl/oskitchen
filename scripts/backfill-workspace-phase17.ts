/**
 * Backfill workspace_id on Phase 17 models.
 */
import { PrismaClient } from "@prisma/client";

const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, uid: string) => Promise<number>;
  backfill: (p: PrismaClient, uid: string, ws: string) => Promise<number>;
}> = [
  {
    label: "entitlement_overrides",
    count: (p, uid) => p.entitlementOverride.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.entitlementOverride.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "delivery_dispatches",
    count: (p, uid) => p.deliveryDispatch.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.deliveryDispatch.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "delivery_proofs",
    count: (p, uid) => p.deliveryProof.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.deliveryProof.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "doordash_deliveries",
    count: (p, uid) => p.doorDashDelivery.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.doorDashDelivery.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "delivery_zones",
    count: (p, uid) => p.deliveryZone.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.deliveryZone.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "delivery_slots",
    count: (p, uid) => p.deliverySlot.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.deliverySlot.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "driver_profiles",
    count: (p, uid) => p.driverProfile.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.driverProfile.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "data_templates",
    count: (p, uid) => p.dataTemplate.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.dataTemplate.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "executive_snapshots",
    count: (p, uid) => p.executiveSnapshot.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.executiveSnapshot.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "executive_insights",
    count: (p, uid) => p.executiveInsight.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.executiveInsight.updateMany({
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

  console.log(`Phase 17 backfill — ${workspaces.length} workspace(s) — ${execute ? "EXECUTE" : "DRY RUN"}`);

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
