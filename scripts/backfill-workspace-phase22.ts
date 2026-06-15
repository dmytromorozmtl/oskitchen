/**
 * Backfill workspace_id on Phase 22 models.
 */
import { PrismaClient } from "@prisma/client";

const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, uid: string) => Promise<number>;
  backfill: (p: PrismaClient, uid: string, ws: string) => Promise<number>;
}> = [
  {
    label: "nutrition_profiles",
    count: (p, uid) => p.nutritionProfile.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.nutritionProfile.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "onboarding_calls",
    count: (p, uid) =>
      p.onboardingCall.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.onboardingCall.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "operations_checklists",
    count: (p, uid) => p.operationsChecklist.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.operationsChecklist.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "operations_audits",
    count: (p, uid) => p.operationsAudit.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.operationsAudit.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "order_channels",
    count: (p, uid) => p.orderChannel.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.orderChannel.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "packaging_items",
    count: (p, uid) => p.packagingItem.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.packagingItem.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "packing_batches",
    count: (p, uid) => p.packingBatch.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.packingBatch.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "packing_events",
    count: (p, uid) => p.packingEvent.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.packingEvent.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } })).count,
  },
  {
    label: "packing_scan_events",
    count: (p, uid) => p.packingScanEvent.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.packingScanEvent.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function backfillOrganizationMembers(prisma: PrismaClient, execute: boolean) {
  const pending = await prisma.organizationMember.count({ where: { workspaceId: null } });
  if (!pending) return 0;
  if (!execute) {
    console.log(`[dry] organization_members (by org): ${pending}`);
    return 0;
  }
  let total = 0;
  const members = await prisma.organizationMember.findMany({
    where: { workspaceId: null },
    select: { id: true, organizationId: true },
  });
  for (const member of members) {
    const ws = await prisma.workspace.findFirst({
      where: { organizationId: member.organizationId },
      select: { id: true },
    });
    if (!ws) continue;
    await prisma.organizationMember.update({
      where: { id: member.id },
      data: { workspaceId: ws.id },
    });
    total += 1;
    await sleep(PAUSE_MS);
  }
  if (total) console.log(`✓ organization_members +${total}`);
  return total;
}

async function main() {
  const execute = process.argv.includes("--execute");
  const prisma = new PrismaClient();
  const workspaces = await prisma.workspace.findMany({ select: { id: true, ownerUserId: true } });

  console.log(`Phase 22 backfill — ${workspaces.length} workspace(s) — ${execute ? "EXECUTE" : "DRY RUN"}`);

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

  total += await backfillOrganizationMembers(prisma, execute);

  console.log(execute ? `Done. ${total} rows updated.` : "Dry run complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
