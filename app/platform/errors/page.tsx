import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { loadPlatformObservabilityPanel } from "@/services/observability/observability-service";

export default async function PlatformErrorsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const { counts, rollup, events } = await loadPlatformObservabilityPanel();

  const label =
    rollup === "HEALTHY" ? "Healthy" : rollup === "DEGRADED" ? "Needs attention" : "Critical path";

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-semibold">Cross-tenant error signals</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Aggregated operational failures (webhooks, sync jobs, notifications, automations). Payloads and secrets are
          never shown — only redacted summaries and deep links into owning surfaces.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-500">Rollup</span>
        <Badge
          className={
            rollup === "HEALTHY"
              ? "border-emerald-700 bg-emerald-900/40 text-emerald-100"
              : rollup === "DEGRADED"
                ? "border-amber-700 bg-amber-900/40 text-amber-100"
                : "border-red-700 bg-red-900/40 text-red-100"
          }
        >
          {label}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Count title="Webhooks queued" value={counts.webhookQueued} />
        <Count title="Webhook errors (7d)" value={counts.webhookProcessingErrors7d} />
        <Count title="Open webhook job recoveries" value={counts.openWebhookJobRecoveries} />
        <Count title="Sync jobs failed" value={counts.channelSyncFailed} />
        <Count title="Notifications failed (7d)" value={counts.notificationFailures7d} />
        <Count title="Imports failed" value={counts.importJobsFailed} />
        <Count title="Channel batches failed" value={counts.channelImportBatchesFailed} />
        <Count title="Exports failed" value={counts.exportJobsFailed} />
        <Count title="Automation failures (7d)" value={counts.automationExecutionsFailed7d} />
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">Recent events</CardTitle>
          <CardDescription className="text-zinc-500">
            Newest first. Workspace labels resolve from the workspace owner profile when a matching row exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {events.length === 0 ? (
            <p className="text-zinc-500">No surfaced failures in the selected windows.</p>
          ) : (
            events.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-zinc-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-white">
                    {e.module} · {e.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-500">{e.lastSeen.toISOString().slice(0, 19)}Z</span>
                </div>
                <p className="text-xs text-zinc-400">{e.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                  {e.workspaceLabel ? <span>Workspace: {e.workspaceLabel}</span> : <span>Workspace: unknown</span>}
                  {e.provider ? <span>Provider: {e.provider}</span> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {e.safeRetryHref ? (
                    <Button asChild size="sm" variant="outline" className="border-zinc-700 text-zinc-100">
                      <Link href={e.safeRetryHref}>Open module</Link>
                    </Button>
                  ) : null}
                  {e.auditHref ? (
                    <Button asChild size="sm" variant="ghost" className="text-amber-200">
                      <Link href={e.auditHref}>Audit</Link>
                    </Button>
                  ) : null}
                </div>
                <p className="text-xs text-zinc-500">{e.nextRecommendedAction}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Count({ title, value }: { title: string; value: number }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums text-white">{value}</p>
      </CardContent>
    </Card>
  );
}
