import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { channelSyncJobListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export default async function SalesChannelsSyncJobsPage() {
  const { userId } = await getTenantActor();
  const jobs = await prisma.channelSyncJob.findMany({
    where: await channelSyncJobListWhereForOwner(userId),
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Sync jobs</h2>
          <p className="text-sm text-muted-foreground">
            Manual and API-triggered syncs log here. Jobs are tenant-scoped and never store secrets.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">Overview</Link>
        </Button>
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sync jobs recorded yet — run WooCommerce or Shopify sync from their setup pages once
          credentials are saved.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Started</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(j.startedAt, { addSuffix: true })}
                </TableCell>
                <TableCell>{j.provider}</TableCell>
                <TableCell>{j.type}</TableCell>
                <TableCell>{j.status}</TableCell>
                <TableCell>{j.recordsProcessed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
