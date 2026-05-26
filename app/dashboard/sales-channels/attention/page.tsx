import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { loadSalesChannelMetrics } from "@/lib/channels/sales-channel-metrics";
import { prisma } from "@/lib/prisma";

export default async function SalesChannelsAttentionPage() {
  const { userId } = await getTenantActor();
  const [connections, kitchen, metrics] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: await integrationConnectionListWhereForOwner(userId),
    }),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    loadSalesChannelMetrics(userId),
  ]);
  const rows = resolveAllChannels(connections, kitchen?.demoMode ?? false).filter(
    (c) =>
      c.effectiveStatus === "ERROR" ||
      c.effectiveStatus === "NEEDS_CREDENTIALS" ||
      c.effectiveStatus === "PARTNER_ACCESS_REQUIRED",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Needs attention</h2>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">Overview</Link>
        </Button>
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
        <p>Failed imports: {metrics.failedExternalImports}</p>
        <p>Unmapped products: {metrics.unmatchedProducts}</p>
        <p>Webhook backlog / issues: {metrics.webhookFailures}</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing flagged — still review failed imports above.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((c) => (
            <li key={c.providerKey} className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
              <p className="font-medium text-foreground">{c.label}</p>
              <p className="text-muted-foreground">{c.nextAction}</p>
              <Link href={c.setupRoute} className="text-primary hover:underline">
                Open setup
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
