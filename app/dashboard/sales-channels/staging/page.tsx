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
import { channelImportBatchListWhereForOwner } from "@/lib/scope/channel-import-scope";
import { prisma } from "@/lib/prisma";
import { ChannelImportBatchStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

export default async function ChannelStagingPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const { userId } = await getTenantActor();
  const sp = (await searchParams) ?? {};
  const statusFilter = sp.status?.trim();
  const statusWhere =
    statusFilter &&
    (Object.values(ChannelImportBatchStatus) as string[]).includes(statusFilter)
      ? { status: statusFilter as ChannelImportBatchStatus }
      : {};

  const batchWhere = await channelImportBatchListWhereForOwner(userId);
  const batches = await prisma.channelImportBatch.findMany({
    where: {
      AND: [batchWhere, statusWhere],
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Import staging</h2>
          <p className="text-sm text-muted-foreground">
            Every webhook and sync job creates a traceable batch before risky operations. Approve
            rows only when validation is green — this does not replace encrypted credentials or live
            partner certification.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels/conflicts">Open conflicts</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          className="rounded-full border border-border/70 px-3 py-1 hover:bg-muted"
          href="/dashboard/sales-channels/staging"
        >
          All
        </Link>
        {["NEEDS_REVIEW", "READY_TO_IMPORT", "IMPORTED", "PARTIAL", "FAILED", "CANCELLED"].map((s) => (
          <Link
            key={s}
            className="rounded-full border border-border/70 px-3 py-1 hover:bg-muted"
            href={`/dashboard/sales-channels/staging?status=${s}`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No import batches yet. Connect WooCommerce or Shopify, run a sync, or use the simulator —
          the first webhook will appear here automatically.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Records</TableHead>
              <TableHead className="text-right w-[100px]"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(b.createdAt, { addSuffix: true })}
                </TableCell>
                <TableCell>{b.provider}</TableCell>
                <TableCell>{b.sourceType}</TableCell>
                <TableCell>{b.status}</TableCell>
                <TableCell className="text-right text-xs">
                  {b.totalRecords} total · {b.validRecords} ok · {b.warningRecords} warn ·{" "}
                  {b.errorRecords} err · {b.importedRecords} imported
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <Link href={`/dashboard/sales-channels/imports/${b.id}`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
