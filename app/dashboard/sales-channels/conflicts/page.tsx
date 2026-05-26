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
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

import { ConflictResolveButtons } from "@/components/sales-channels/conflict-resolve-buttons";

export default async function ChannelConflictsPage() {
  const { userId } = await getTenantActor();
  const conflicts = await prisma.channelConflict.findMany({
    where: { AND: [await channelConflictWhereForOwner(userId), { status: "OPEN" }] },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { batch: { select: { id: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Conflict resolution</h2>
        <p className="text-sm text-muted-foreground">
          Operator-first queue for duplicates, mapping gaps, and risky payloads. Resolving here does
          not mutate partner systems — it updates KitchenOS staging metadata only.
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link href="/dashboard/sales-channels/staging">Back to staging</Link>
      </Button>

      {conflicts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open conflicts. Great — or run a simulation.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opened</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conflicts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(c.createdAt, { addSuffix: true })}
                </TableCell>
                <TableCell>{c.severity}</TableCell>
                <TableCell className="font-mono text-xs">{c.conflictType}</TableCell>
                <TableCell>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.description}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="sm" className="rounded-full">
                      <Link href={`/dashboard/sales-channels/imports/${c.batch.id}`}>Batch</Link>
                    </Button>
                    <ConflictResolveButtons conflictId={c.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
