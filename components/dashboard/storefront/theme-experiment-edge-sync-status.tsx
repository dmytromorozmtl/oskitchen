import { Badge } from "@/components/ui/badge";
import { ThemeExperimentEdgeSyncRetry } from "@/components/dashboard/storefront/theme-experiment-admin-actions";
import {
  edgeSyncCanRetry,
  type ThemeExperimentEdgeSyncDashboardStatus,
} from "@/services/storefront/theme-experiment-edge-sync-status";

const LABEL_VARIANT: Record<
  ThemeExperimentEdgeSyncDashboardStatus["label"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  synced: "default",
  queued: "secondary",
  processing: "secondary",
  retrying: "outline",
  dead: "destructive",
  not_configured: "outline",
  app_only: "outline",
};

export function ThemeExperimentEdgeSyncStatus({
  status,
}: {
  status: ThemeExperimentEdgeSyncDashboardStatus;
}) {
  const showRetry = edgeSyncCanRetry(status);

  return (
    <div className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{status.headline}</span>
          <Badge variant={LABEL_VARIANT[status.label]}>{status.label}</Badge>
        </div>
        {showRetry ? <ThemeExperimentEdgeSyncRetry canRetry /> : null}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{status.detail}</p>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        DB v{status.dbVersion}
        {status.edgeConfigured ? (
          <>
            {" "}
            · Edge v{status.edgeVersion ?? "—"} {status.versionsMatch ? "✓" : "≠"}
          </>
        ) : null}
        {status.lastJob ? (
          <>
            {" "}
            · job {status.lastJob.status} (attempts {status.lastJob.attemptCount})
          </>
        ) : null}
      </p>
    </div>
  );
}
