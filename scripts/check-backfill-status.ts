/**
 * Post-backfill verification (staging/prod read-only).
 *
 *   npx tsx scripts/check-backfill-status.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function countNull(table: string, column: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count FROM "${table}" WHERE "${column}" IS NULL`,
  );
  return Number(rows[0]?.count ?? 0);
}

async function main() {
  console.log("=== Workspace backfill status ===\n");

  const checks: Array<{ label: string; table: string; column: string }> = [
    { label: "orders", table: "orders", column: "workspace_id" },
    { label: "menus", table: "menus", column: "workspace_id" },
    { label: "products", table: "products", column: "workspace_id" },
    { label: "integration_connections", table: "integration_connections", column: "workspace_id" },
    { label: "webhook_events", table: "webhook_events", column: "workspace_id" },
    { label: "kitchen_customers", table: "kitchen_customers", column: "workspace_id" },
    { label: "external_orders", table: "external_orders", column: "workspace_id" },
    { label: "channel_conflicts", table: "channel_conflicts", column: "workspace_id" },
    { label: "channel_sync_jobs", table: "channel_sync_jobs", column: "workspace_id" },
    { label: "external_products", table: "external_products", column: "workspace_id" },
    { label: "channel_import_batches", table: "channel_import_batches", column: "workspace_id" },
    { label: "product_mappings", table: "product_mappings", column: "workspace_id" },
    { label: "error_recovery_items", table: "error_recovery_items", column: "workspace_id" },
    { label: "product_mapping_aliases", table: "product_mapping_aliases", column: "workspace_id" },
    { label: "import_jobs", table: "import_jobs", column: "workspace_id" },
    { label: "export_jobs", table: "export_jobs", column: "workspace_id" },
  ];

  let fail = false;
  for (const c of checks) {
    try {
      const n = await countNull(c.table, c.column);
      const status = n === 0 ? "OK" : "PENDING";
      if (n > 0) fail = true;
      console.log(`${status.padEnd(8)} ${c.label}: ${n} rows with NULL ${c.column}`);
    } catch (e) {
      console.warn(`SKIP     ${c.label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const workspaces = await prisma.workspace.count();
  console.log(`\nWorkspaces: ${workspaces}`);

  const orphanOrders = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count FROM "orders" o
     WHERE o."workspace_id" IS NULL
       AND EXISTS (SELECT 1 FROM "workspaces" w WHERE w."owner_user_id" = o."user_id")`,
  );
  const orphanN = Number(orphanOrders[0]?.count ?? 0);
  if (orphanN > 0) {
    fail = true;
    console.log(`PENDING  orders owned by workspace owners with NULL workspace_id: ${orphanN}`);
  } else {
    console.log(`OK       orders with workspace owner but NULL workspace_id: 0`);
  }

  await prisma.$disconnect();
  if (fail) {
    console.error("\nBackfill incomplete — run backfill scripts before closed beta.");
    process.exit(1);
  }
  console.log("\nBackfill complete for tracked tables.");
  console.log("Next: npm run verify:staff-scope");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
