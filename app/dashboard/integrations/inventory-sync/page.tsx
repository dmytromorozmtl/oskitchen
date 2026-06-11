import Link from "next/link";

import { InventorySyncPanel } from "@/components/integrations/inventory-sync-panel";
import { inventorySyncSettingsFromConnection } from "@/lib/integrations/inventory-sync-settings";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  listStoredInventoryConflicts,
  loadInventorySyncSnapshot,
} from "@/services/integrations/inventory-sync-load";

export default async function InventorySyncPage() {
  const { userId } = await requireTenantActor();
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);

  const [snapshot, connections, storedConflicts] = await Promise.all([
    loadInventorySyncSnapshot(userId),
    prisma.integrationConnection.findMany({
      where: { AND: [connectionWhere, { provider: { in: ["SHOPIFY", "WOOCOMMERCE"] } }] },
      select: { id: true, provider: true, name: true, settingsJson: true },
      orderBy: { name: "asc" },
    }),
    listStoredInventoryConflicts(userId),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory sync</h1>
          <p className="text-sm text-muted-foreground">
            Bidirectional Shopify & WooCommerce stock push/pull with conflict resolution.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/dashboard/integrations/shopify" className="rounded-md border px-2 py-1">
            Shopify
          </Link>
          <Link href="/dashboard/integrations/woocommerce" className="rounded-md border px-2 py-1">
            WooCommerce
          </Link>
          <Link href="/dashboard/product-mapping" className="rounded-md border px-2 py-1">
            Product mapping →
          </Link>
        </div>
      </div>

      <InventorySyncPanel
        snapshot={snapshot}
        storedConflicts={storedConflicts}
        connections={connections.map((c) => ({
          id: c.id,
          provider: c.provider,
          name: c.name,
          settings: inventorySyncSettingsFromConnection(c.settingsJson),
        }))}
      />
    </div>
  );
}
