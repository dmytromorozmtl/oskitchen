/**
 * Backfill workspace_id on Phase 19 models.
 */
import { PrismaClient } from "@prisma/client";

const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, uid: string) => Promise<number>;
  backfill: (p: PrismaClient, uid: string, ws: string) => Promise<number>;
}> = [
  {
    label: "import_mapping_templates",
    count: (p, uid) => p.importMappingTemplate.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.importMappingTemplate.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "ingredient_declarations",
    count: (p, uid) => p.ingredientDeclaration.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.ingredientDeclaration.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "ingredient_demand_lines",
    count: (p, uid) => p.ingredientDemandLine.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.ingredientDemandLine.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "ingredient_demand_runs",
    count: (p, uid) => p.ingredientDemandRun.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.ingredientDemandRun.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "ingredient_lots",
    count: (p, uid) => p.ingredientLot.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.ingredientLot.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "ingredient_substitutions",
    count: (p, uid) => p.ingredientSubstitution.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.ingredientSubstitution.updateMany({
          where: { userId: uid, workspaceId: null },
          data: { workspaceId: ws },
        })
      ).count,
  },
  {
    label: "inventory_counts",
    count: (p, uid) => p.inventoryCount.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.inventoryCount.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "invoice_records",
    count: (p, uid) => p.invoiceRecord.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.invoiceRecord.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "iot_sensor_devices",
    count: (p, uid) => p.iotSensorDevice.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (await p.iotSensorDevice.updateMany({ where: { userId: uid, workspaceId: null }, data: { workspaceId: ws } }))
        .count,
  },
  {
    label: "kitchen_module_preferences",
    count: (p, uid) => p.kitchenModulePreference.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) =>
      (
        await p.kitchenModulePreference.updateMany({
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

  console.log(`Phase 19 backfill — ${workspaces.length} workspace(s) — ${execute ? "EXECUTE" : "DRY RUN"}`);

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
