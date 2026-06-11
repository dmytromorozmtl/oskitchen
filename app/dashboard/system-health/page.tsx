import Link from "next/link";

import { canManageProductionIncidentsForUser } from "@/actions/production-incidents";
import { SystemHealthAttentionStrip } from "@/components/dashboard/system-health-attention-strip";
import { SystemHealthMetricNextAction } from "@/components/dashboard/system-health-metric-next-action";
import { ProductionIncidentWorkflowForm } from "@/components/system/production-incident-workflow-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadProductionIncidentRollup } from "@/services/incidents/production-incident-rollup-service";
import { listProductionIncidentAssignees } from "@/services/incidents/production-incident-rollup-service";
import { loadWorkspaceObservabilityPanel } from "@/services/observability/observability-service";
import { loadOperationHealth } from "@/services/operations/operation-health-service";
import type { SystemHealthMetricId } from "@/lib/system-health/system-health-focus-era18";

export default async function SystemHealthPage() {
  const { sessionUser, userId } = await getTenantActor();
  const [{ rollup, today }, obs, incidentRollup, canManageIncidents, assignees] = await Promise.all([
    loadOperationHealth(userId),
    loadWorkspaceObservabilityPanel(userId),
    loadProductionIncidentRollup(userId),
    canManageProductionIncidentsForUser({ id: sessionUser.id, email: sessionUser.email }),
    listProductionIncidentAssignees(),
  ]);
  const startupReadinessIncidents = incidentRollup.items.filter(
    (item) => item.source === "startup_readiness",
  );

  const snapshot = {
    rollup,
    failedWebhooks: today.kpis.failedWebhooks,
    errorIntegrations: today.kpis.errorIntegrations,
    integrityIssueCount: today.kpis.integrityIssueCount,
    openSupportTickets: today.kpis.openSupportTickets,
    unmatchedExternalProducts: today.kpis.unmatchedExternalProducts,
    webhookProcessingErrors7d: obs.counts.webhookProcessingErrors7d,
    openWebhookJobRecoveries: obs.counts.openWebhookJobRecoveries,
    channelSyncFailed: obs.counts.channelSyncFailed,
    notificationFailures7d: obs.counts.notificationFailures7d,
    productionIncidentsCritical: incidentRollup.summary.critical,
    productionIncidentsOpen: incidentRollup.summary.open,
    startupReadinessIncidents: startupReadinessIncidents.length,
  } as const;

  const label =
    rollup === "HEALTHY" ? "Healthy" : rollup === "DEGRADED" ? "Needs attention" : "Critical path";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">System health</h1>
            <Badge variant={rollup === "HEALTHY" ? "secondary" : "destructive"}>{label}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Workspace-level signals derived from Today, integrations, and integrity checks. Use Error
            recovery for deep links into each queue.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/error-recovery">Error recovery</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/today">Today</Link>
          </Button>
        </div>
      </div>

      <SystemHealthAttentionStrip snapshot={snapshot} recentEvents={obs.events} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Metric id="failed-webhooks" title="Failed webhooks" value={today.kpis.failedWebhooks} />
        <Metric id="integration-errors" title="Integration errors" value={today.kpis.errorIntegrations} />
        <Metric id="integrity-flags" title="Integrity flags" value={today.kpis.integrityIssueCount} />
        <Metric id="open-support" title="Open support tickets" value={today.kpis.openSupportTickets} />
        <Metric id="unmapped-catalog" title="Unmapped catalog rows" value={today.kpis.unmatchedExternalProducts} />
        <Metric id="active-orders" title="Active orders" value={today.kpis.activeOrders} />
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Readiness</CardTitle>
          <CardDescription>Onboarding coverage from workspace settings and catalog state.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Overall {today.readiness.overall}% — review categories on Today or Implementation checklist.
        </CardContent>
      </Card>

      {canManageIncidents ? (
        <Card
          className={
            startupReadinessIncidents.length > 0
              ? "border-destructive/40 bg-destructive/5 shadow-sm"
              : "border-border/80 bg-card/90 shadow-sm"
          }
        >
          <CardHeader>
            <CardTitle className="text-base">Production startup readiness</CardTitle>
            <CardDescription>
              Boot and readiness blockers that would stop a real production-serving node from meeting
              required posture. This card is tied to the same persistent incident workflow as the
              incident rollup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {startupReadinessIncidents.length === 0 ? (
              <p>No active production startup readiness incidents are currently open.</p>
            ) : (
              startupReadinessIncidents.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 bg-background/70 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <Badge variant={item.severity === "critical" ? "destructive" : "secondary"}>
                          {item.severity}
                        </Badge>
                        <Badge variant={item.workflowStatus === "OPEN" ? "destructive" : item.workflowStatus === "ACKNOWLEDGED" ? "secondary" : "outline"}>
                          {item.workflowStatus.toLowerCase()}
                        </Badge>
                      </div>
                      <p>{item.summary}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span>Owner {item.assignedToName ?? item.assignedToEmail ?? item.ownerLabel}</span>
                        {item.badges.map((badge) => (
                          <span
                            key={`${item.id}:${badge}`}
                            className="rounded-full border border-border/60 px-2 py-0.5"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <Button asChild variant="ghost" className="rounded-full">
                        <Link href="/dashboard/system-health/incidents">Open incident queue</Link>
                      </Button>
                      <ProductionIncidentWorkflowForm
                        incident={item}
                        assignees={assignees}
                        className="grid w-full min-w-[320px] gap-2 rounded-lg border border-border/60 bg-background p-3 text-xs md:w-[360px]"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Observability (7d window)</CardTitle>
          <CardDescription>
            Cross-module failures with redacted summaries. Operational rollup:{" "}
            <span className="font-medium text-foreground">{obs.rollup}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <ObsStat label="Webhook errors (7d)" value={obs.counts.webhookProcessingErrors7d} />
            <ObsStat label="Open webhook job recoveries" value={obs.counts.openWebhookJobRecoveries} />
            <ObsStat label="Webhooks queued" value={obs.counts.webhookQueued} />
            <ObsStat label="Sync failed" value={obs.counts.channelSyncFailed} />
            <ObsStat label="Notifications failed (7d)" value={obs.counts.notificationFailures7d} />
            <ObsStat label="Imports failed" value={obs.counts.importJobsFailed} />
            <ObsStat label="Channel batches failed" value={obs.counts.channelImportBatchesFailed} />
            <ObsStat label="Exports failed" value={obs.counts.exportJobsFailed} />
            <ObsStat label="Automation failures (7d)" value={obs.counts.automationExecutionsFailed7d} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Latest signals</p>
            {obs.events.length === 0 ? (
              <p className="text-xs">No surfaced failures in the recent window.</p>
            ) : (
              obs.events.slice(0, 6).map((e) => (
                <div key={e.id} className="rounded-md border border-border/60 px-3 py-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {e.module} · {e.severity}
                    </span>
                    <span className="text-muted-foreground">{e.lastSeen.toISOString().slice(0, 19)}Z</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{e.summary}</p>
                  {e.safeRetryHref ? (
                    <Link href={e.safeRetryHref} className="mt-2 inline-block text-primary underline-offset-4 hover:underline">
                      Open module
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card
        className={
          incidentRollup.summary.critical > 0
            ? "border-destructive/40 bg-destructive/5 shadow-sm"
            : "border-border/80 bg-card/90 shadow-sm"
        }
      >
        <CardHeader>
          <CardTitle className="text-base">Production incident rollup</CardTitle>
          <CardDescription>
            Unified production blockers across startup readiness, critical cron execution, and webhook
            recovery. Critical attention:{" "}
            <span className="font-medium text-foreground">
              {incidentRollup.summary.critical}
            </span>
            critical / {incidentRollup.summary.open} open total.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <ObsStat label="Critical" value={incidentRollup.summary.critical} />
            <ObsStat label="High" value={incidentRollup.summary.high} />
            <ObsStat label="Startup readiness" value={incidentRollup.summary.startupReadiness} />
            <ObsStat label="Webhook recovery" value={incidentRollup.summary.webhookRecovery} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/system-health/incidents">Open incident rollup</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/dashboard/system-health/cron-execution">Open cron audit</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/dashboard/error-recovery">Recovery hub</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ObsStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function Metric({
  id,
  title,
  value,
}: {
  id: SystemHealthMetricId;
  title: string;
  value: number;
}) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
        <SystemHealthMetricNextAction metricId={id} value={value} />
      </CardContent>
    </Card>
  );
}
