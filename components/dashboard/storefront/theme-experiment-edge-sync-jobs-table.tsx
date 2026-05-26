import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EdgeSyncJobHistoryRow } from "@/services/storefront/storefront-edge-sync-job-history";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  SUCCEEDED: "default",
  QUEUED: "secondary",
  PROCESSING: "secondary",
  DEAD: "destructive",
};

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ThemeExperimentEdgeSyncJobsTable({ jobs }: { jobs: EdgeSyncJobHistoryRow[] }) {
  if (jobs.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No edge sync jobs yet. Saving the experiment enqueues the first job.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">v</TableHead>
            <TableHead className="text-xs">Attempts</TableHead>
            <TableHead className="text-xs">Error</TableHead>
            <TableHead className="text-xs text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <Badge variant={STATUS_VARIANT[job.status] ?? "outline"} className="font-mono text-[10px]">
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{job.expectedVersion}</TableCell>
              <TableCell className="font-mono text-xs">
                {job.attemptCount}/{job.maxAttempts}
              </TableCell>
              <TableCell className="max-w-[200px] truncate font-mono text-[10px] text-muted-foreground">
                {job.lastError ?? "—"}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">{formatWhen(job.updatedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
