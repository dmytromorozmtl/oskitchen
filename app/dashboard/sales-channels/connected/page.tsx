import Link from "next/link";

import { ChannelCard } from "@/components/channels/channel-card";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { prisma } from "@/lib/prisma";

export default async function SalesChannelsConnectedPage() {
  const { userId } = await getTenantActor();
  const [connections, kitchen] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: await integrationConnectionListWhereForOwner(userId),
    }),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
  ]);
  const rows = resolveAllChannels(connections, kitchen?.demoMode ?? false).filter(
    (c) => c.connection?.status === "CONNECTED" || c.effectiveStatus === "LIVE",
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Connected channels</h2>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">Overview</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No live integrations yet — start with storefront or WooCommerce.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <ChannelCard key={c.providerKey} row={c} />
          ))}
        </div>
      )}
    </div>
  );
}
