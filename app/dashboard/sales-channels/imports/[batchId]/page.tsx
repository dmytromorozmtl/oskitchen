import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireChannelActor } from "@/lib/channels/require-channel-actor";
import {
  canApproveChannelImports,
  canViewChannelRawPayload,
} from "@/lib/channels/channel-permissions";
import { channelImportBatchByIdWhereForOwner } from "@/lib/scope/channel-import-scope";
import { requireIntegrationsReadActor } from "@/lib/integrations/require-integrations-actor";
import { prisma } from "@/lib/prisma";
import { ImportBatchToolbar } from "@/components/sales-channels/import-batch-toolbar";
import { ImportRollbackButton } from "@/components/sales-channels/import-rollback-button";
import { StagingRecordActions } from "@/components/sales-channels/staging-record-actions";

export default async function ChannelImportBatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const read = await requireIntegrationsReadActor({ operation: "channel.import.view_batch" });
  if (!read.ok) {
    return (
      <p className="rounded-xl border border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        {read.error}
      </p>
    );
  }

  const { profile, userId } = await requireChannelActor();
  const { batchId } = await params;

  const batch = await prisma.channelImportBatch.findFirst({
    where: await channelImportBatchByIdWhereForOwner(userId, batchId),
    include: { records: { orderBy: { createdAt: "asc" } } },
  });
  if (!batch) notFound();

  const validIds = batch.records
    .filter((r) => r.validationStatus === "VALID" && !r.importedAt)
    .map((r) => r.id);

  const permissionCtx = {
    email: profile.email,
    role: profile.role,
    granted: read.actor.granted,
  };
  const canApprove = canApproveChannelImports(permissionCtx);
  const canRaw = canViewChannelRawPayload(permissionCtx);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Import batch</h2>
          <p className="font-mono text-xs text-muted-foreground">{batch.id}</p>
          <p className="text-sm text-muted-foreground">
            Status {batch.status} · {batch.sourceType} · {batch.provider}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/sales-channels/staging">All batches</Link>
          </Button>
          {canApprove ? <ImportRollbackButton batchId={batch.id} /> : null}
        </div>
      </div>

      {canApprove ? (
        <ImportBatchToolbar batchId={batch.id} validRecordIds={validIds} />
      ) : (
        <p className="text-xs text-muted-foreground">
          Approvals require <span className="font-mono">integrations.manage</span> in this workspace.
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>External id</TableHead>
            <TableHead>Validation</TableHead>
            <TableHead>Imported</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batch.records.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.externalId}</TableCell>
              <TableCell>{r.validationStatus}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {r.importedAt ? r.importedEntityId ?? "yes" : "—"}
              </TableCell>
              <TableCell className="text-right">
                <StagingRecordActions
                  recordId={r.id}
                  canApprove={canApprove && r.validationStatus === "VALID" && !r.importedAt}
                  canRetry={canApprove}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {canRaw ? (
        <div className="rounded-xl border border-border/70 bg-muted/10 p-3 text-xs text-muted-foreground">
          Raw payloads are available on each record in the database for permitted users — UI
          redaction is planned; never copy secrets into tickets.
        </div>
      ) : null}
    </div>
  );
}
