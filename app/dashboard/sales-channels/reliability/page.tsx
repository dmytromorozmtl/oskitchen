import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import {
  channelConflictWhereForOwner,
  channelImportBatchListWhereForOwner,
} from "@/lib/scope/channel-import-scope";
import { channelSyncJobListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ChannelReliabilityPage() {
  const { userId } = await getTenantActor();
  const since = new Date(Date.now() - 7 * 86400_000);

  const [webhookWhere, batchWhere, conflictWhere, syncJobWhere] = await Promise.all([
    getCachedWebhookEventListWhere(),
    channelImportBatchListWhereForOwner(userId),
    channelConflictWhereForOwner(userId),
    channelSyncJobListWhereForOwner(userId),
  ]);
  const [
    webhookProcessedOk,
    webhookProcessedErr,
    webhookPending,
    syncSuccess,
    syncFailed,
    openConflicts,
    batchesNeedReview,
  ] = await Promise.all([
    prisma.webhookEvent.count({
      where: {
        AND: [
          webhookWhere,
          { receivedAt: { gte: since }, processed: true, processingError: null },
        ],
      },
    }),
    prisma.webhookEvent.count({
      where: {
        AND: [
          webhookWhere,
          { receivedAt: { gte: since }, processed: true, processingError: { not: null } },
        ],
      },
    }),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { receivedAt: { gte: since }, processed: false }] },
    }),
    prisma.channelSyncJob.count({
      where: { AND: [syncJobWhere, { startedAt: { gte: since }, status: "SUCCESS" }] },
    }),
    prisma.channelSyncJob.count({
      where: { AND: [syncJobWhere, { startedAt: { gte: since }, status: "FAILED" }] },
    }),
    prisma.channelConflict.count({
      where: { AND: [conflictWhere, { status: "OPEN" }] },
    }),
    prisma.channelImportBatch.count({
      where: { AND: [batchWhere, { status: "NEEDS_REVIEW" }] },
    }),
  ]);

  const webhookTotal = webhookProcessedOk + webhookProcessedErr + webhookPending;
  const webhookRate =
    webhookTotal === 0 ? null : Math.round((webhookProcessedOk / webhookTotal) * 1000) / 10;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Reliability snapshot</h2>
        <p className="text-sm text-muted-foreground">
          Last 7 days, tenant-scoped. Channel downtime and partner SLAs remain placeholders until live
          telemetry ships.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhooks</CardTitle>
            <CardDescription>Processed vs errors vs pending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Success-like: {webhookProcessedOk}</p>
            <p>Recorded error: {webhookProcessedErr}</p>
            <p>Still pending: {webhookPending}</p>
            <p className="text-muted-foreground">
              Approx. success rate: {webhookRate == null ? "—" : `${webhookRate}%`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sync jobs</CardTitle>
            <CardDescription>Recorded job outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Success: {syncSuccess}</p>
            <p>Failed: {syncFailed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import health</CardTitle>
            <CardDescription>Staging + conflicts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Batches needing review: {batchesNeedReview}</p>
            <p>Open conflicts: {openConflicts}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
