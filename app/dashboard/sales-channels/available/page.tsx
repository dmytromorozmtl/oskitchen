import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { prisma } from "@/lib/prisma";

export default async function SalesChannelsAvailablePage() {
  const { userId } = await getTenantActor();
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
      <ul className="space-y-2 text-sm">
        {rows.map((c) => (
          <li key={c.providerKey} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
            <span>{c.label}</span>
            <Link href={c.setupRoute} className="text-primary hover:underline">
              Setup
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
