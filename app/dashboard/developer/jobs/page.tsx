import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { getBackgroundJobSnapshot } from "@/services/developer/job-monitor-service";
import { getQueueAndSyncJobCounts } from "@/services/developer/queue-monitor-service";

export default async function DeveloperJobsPage() {
  const ctx = await requireDeveloperCenterAccess();
  const [queues, jobs] = await Promise.all([
    getQueueAndSyncJobCounts(ctx.userId),
    getBackgroundJobSnapshot(ctx.userId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Queues & jobs</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Operational backlog across channel sync, channel imports, import center, and exports.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Channel sync</CardTitle>
            <CardDescription>Queued / running / failed</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Pending: {queues.channelSync.pending}</p>
            <p>Running: {queues.channelSync.running}</p>
            <p className="text-destructive">Failed: {queues.channelSync.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Channel imports</CardTitle>
            <CardDescription>Active batches / failed</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Active: {queues.channelImport.active}</p>
            <p className="text-destructive">Failed: {queues.channelImport.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Import center</CardTitle>
            <CardDescription>Spreadsheet jobs</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Queued: {jobs.importCenter.queued}</p>
            <p className="text-destructive">Failed: {jobs.importCenter.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exports</CardTitle>
            <CardDescription>CSV / report jobs</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Queued: {jobs.exports.queued}</p>
            <p className="text-destructive">Failed: {jobs.exports.failed}</p>
          </CardContent>
        </Card>
      </div>

      {queues.channelSync.failed + queues.channelImport.failed + jobs.importCenter.failed + jobs.exports.failed ===
      0 ? (
        <p className="text-sm text-muted-foreground">All background jobs are healthy.</p>
      ) : null}
    </div>
  );
}
