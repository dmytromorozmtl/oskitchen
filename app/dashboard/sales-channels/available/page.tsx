import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canManageIntegrations } from "@/lib/integrations/integrations-page-access";
import {
  isMarketplacePlaceholderProvider,
  marketplacePlaceholderHonestyLabel,
} from "@/lib/integrations/integration-honesty";
import { requireSalesChannelsManagePage } from "@/lib/channels/sales-channels-page-access";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { prisma } from "@/lib/prisma";

export default async function SalesChannelsAvailablePage() {
  const access = await requireSalesChannelsManagePage();
  if (!access.ok) {
    return access.deny;
  }
  const actor = access.actor;
  const { userId } = actor;
  const canManage = canManageIntegrations(actor.granted);
  const [connections, kitchen] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: await integrationConnectionListWhereForOwner(userId),
    }),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
  ]);
  const rows = resolveAllChannels(connections, kitchen?.demoMode ?? false).filter(
    (c) => c.effectiveStatus !== "LIVE" && c.connection?.status !== "CONNECTED",
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Available to connect</h2>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">Overview</Link>
        </Button>
      </div>
      {!canManage ? (
        <p className="text-sm text-muted-foreground">
          Channel setup requires integration management permission. Contact a workspace manager to
          connect new sales channels.
        </p>
      ) : null}
      <ul className="space-y-2 text-sm">
        {rows.map((c) => (
          <li key={c.providerKey} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
            <span className="flex flex-wrap items-center gap-2">
              <span>{c.label}</span>
              {c.isPlaceholder || isMarketplacePlaceholderProvider(c.providerKey) ? (
                <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
                  {marketplacePlaceholderHonestyLabel()}
                </Badge>
              ) : null}
            </span>
            {canManage ? (
              <Link href={c.setupRoute} className="text-primary hover:underline">
                {c.isPlaceholder || isMarketplacePlaceholderProvider(c.providerKey)
                  ? "View placeholder status"
                  : "Setup"}
              </Link>
            ) : (
              <span className="text-muted-foreground">Manager setup required</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
