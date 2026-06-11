import Link from "next/link";

import { canManageCronIncidentsForUser } from "@/actions/cron-incidents";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ProductionIncidentWorkflowForm } from "@/components/system/production-incident-workflow-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  listProductionIncidentAssignees,
  loadProductionIncidentRollup,
} from "@/services/incidents/production-incident-rollup-service";

function severityBadgeVariant(severity: "low" | "medium" | "high" | "critical") {
  if (severity === "critical") return "destructive";
  if (severity === "high") return "secondary";
  return "outline";
}

function statusBadgeVariant(status: "investigating" | "identified" | "monitoring" | "resolved") {
  if (status === "investigating") return "destructive";
  if (status === "identified") return "secondary";
  return "outline";
}

function workflowBadgeVariant(workflowStatus: "OPEN" | "ACKNOWLEDGED" | "MONITORING" | "RESOLVED") {
  if (workflowStatus === "OPEN") return "destructive";
  if (workflowStatus === "ACKNOWLEDGED") return "secondary";
  return "outline";
}

function Metric({
  title,
  value,
  detail,
}: {
  title: string;
  value: number;
  detail: string;
}) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function ProductionIncidentsPage() {
  const { sessionUser, userId } = await getTenantActor();
  const [rollup, canManageIncidents, assignees] = await Promise.all([
    loadProductionIncidentRollup(userId),
    canManageCronIncidentsForUser({ id: sessionUser.id, email: sessionUser.email }),
    listProductionIncidentAssignees(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Production incidents</h1>
            <Badge variant={rollup.summary.critical > 0 ? "destructive" : "secondary"}>
              {rollup.summary.open > 0 ? `${rollup.summary.open} open` : "No active incidents"}
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Executive rollup for production-only blockers across startup readiness, critical cron
            execution, and webhook recovery pressure. This surface is intentionally grouped and
            prioritized so platform operators can see the real queue without hunting through
            separate dashboards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/system-health">System health</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/error-recovery">Error recovery</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Open incidents"
          value={rollup.summary.open}
          detail="All active production incidents in the current rollup."
        />
        <Metric
          title="Critical"
          value={rollup.summary.critical}
          detail="Highest-severity incidents needing immediate platform action."
        />
        <Metric
          title="Startup readiness"
          value={rollup.summary.startupReadiness}
          detail="Production boot/readiness blockers from rate limiting or queue posture."
        />
        <Metric
          title="Webhook recovery"
          value={rollup.summary.webhookRecovery}
          detail="Grouped webhook recovery blockers currently pressuring operations."
        />
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Active incident queue</CardTitle>
          <CardDescription>
            Ordered by severity first, then workflow state, then most recent signal. Workflow and
            assignee changes persist independently from the live source and auto-reopen if the
            source stays unhealthy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rollup.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active production incidents are currently grouped into this rollup.
            </p>
          ) : (
            rollup.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <Badge variant={severityBadgeVariant(item.severity)}>
                        {item.severity}
                      </Badge>
                      <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                      <Badge variant={workflowBadgeVariant(item.workflowStatus)}>
                        {item.workflowStatus.toLowerCase()}
                      </Badge>
                      <Badge variant="outline">{item.source.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>
                        Owner {item.assignedToName ?? item.assignedToEmail ?? item.ownerLabel}
                      </span>
                      {item.assignedToName || item.assignedToEmail ? (
                        <span>Source owner {item.ownerLabel}</span>
                      ) : null}
                      {item.detectedAt ? (
                        <span>Detected {new Date(item.detectedAt).toISOString().slice(0, 19)}Z</span>
                      ) : null}
                      <span>Last seen {new Date(item.lastSeenAt).toISOString().slice(0, 19)}Z</span>
                      {item.acknowledgedAt ? (
                        <span>
                          Acknowledged by{" "}
                          {item.acknowledgedByName ?? item.acknowledgedByUserId ?? "platform staff"} at{" "}
                          {new Date(item.acknowledgedAt).toISOString().slice(0, 19)}Z
                        </span>
                      ) : null}
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
                      <Link href={item.href}>Open incident</Link>
                    </Button>
                    {canManageIncidents ? (
                      <ProductionIncidentWorkflowForm incident={item} assignees={assignees} />
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ActivityTimeline
        title="Incident timeline"
        description="The same incident rollup rendered as an executive feed for quick triage."
        items={rollup.timeline}
        emptyLabel="No production incident events are currently grouped here."
      />
    </div>
  );
}
