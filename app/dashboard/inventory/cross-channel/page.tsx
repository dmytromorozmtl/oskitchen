import Link from "next/link";

import { CrossChannelInventoryPanel } from "@/components/inventory/cross-channel-inventory-panel";
import { crossChannelSettingsFromConnection } from "@/lib/inventory/cross-channel-inventory-settings";
import { hasPermission } from "@/lib/permissions/guards";
import { prisma } from "@/lib/prisma";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadWorkspacePermissionPageActor } from "@/lib/ux/permission-denied-page-access-era19";
import { loadCrossChannelInventorySnapshot } from "@/services/inventory/cross-channel-inventory-sync";

export default async function CrossChannelInventoryPage() {
  const actor = await loadWorkspacePermissionPageActor();
  const userId = actor.userId;
  const canManage = hasPermission(actor.granted, "integrations.manage");

  const connectionWhere = await integrationConnectionListWhereForOwner(userId);

  const [snapshot, connections] = await Promise.all([
    loadCrossChannelInventorySnapshot(userId),
    prisma.integrationConnection.findMany({
      where: {
        AND: [
          connectionWhere,
          { provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] } },
        ],
      },
      select: { id: true, provider: true, name: true, settingsJson: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cross-channel inventory</h1>
          <p className="text-sm text-muted-foreground">
            POS master spine vs Shopify, WooCommerce, and DoorDash — sync status, conflicts, and
            low-stock alerts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/dashboard/inventory/pos-impacts" className="rounded-md border px-2 py-1">
            POS impacts
          </Link>
          <Link href="/dashboard/integrations/inventory-sync" className="rounded-md border px-2 py-1">
            Legacy sync
          </Link>
          <Link href="/dashboard/product-mapping" className="rounded-md border px-2 py-1">
            Product mapping →
          </Link>
        </div>
      </div>

      <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
        <span className="font-medium">Preview.</span> DoorDash inventory compare is BETA — push
        requires partner-approved menu APIs. POS quantity is the Kitchen spine master.
      </p>

      <CrossChannelInventoryPanel
        snapshot={snapshot}
        canManage={canManage}
        connections={connections.map((c) => ({
          id: c.id,
          provider: c.provider,
          name: c.name,
          settings: crossChannelSettingsFromConnection(c.settingsJson),
        }))}
      />
    </div>
  );
}
