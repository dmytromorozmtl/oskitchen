import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import {
  canManageCronIncidentsForUser,
} from "@/actions/cron-incidents";
import { updateProductionIncidentWorkflowFormAction } from "@/actions/production-incidents";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  loadCronExecutionTimelineItems,
  loadProductionCronExecutionAudit,
} from "@/services/cron/cron-execution-evidence";
import {
  loadProductionIncidentRollup,
  type ProductionIncidentItem,
} from "@/services/incidents/production-incident-rollup-service";
import { buildCriticalCronIncidentSourceKey } from "@/services/incidents/production-incident-source-keys";
import { isAllowedProductionCronSlug } from "@/services/cron/production-manifest";

function fmtRelative(value: string | null) {
  if (!value) return "—";
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function autoEscalationLabel(reason: "repeated_failures" | "prolonged_outage" | null) {
  if (reason === "repeated_failures") return "Repeated failures";
  if (reason === "prolonged_outage") return "Prolonged outage";
  return null;
}

function followUpLabel(kind: "rerouted" | "reminded" | null) {
  if (kind === "rerouted") return "Auto-rerouted";
  if (kind === "reminded") return "Reminder sent";
  return null;
}

function engagementLabel(
  state:
    | "none"
    | "missing_ticket"
    | "unassigned"
    | "awaiting_first_response"
    | "first_response_overdue"
    | "engaged"
    | "resolved",
) {
  switch (state) {
    case "missing_ticket":
      return "Missing support ticket";
    case "unassigned":
      return "Unassigned";
    case "awaiting_first_response":
      return "Awaiting first response";
    case "first_response_overdue":
      return "First response overdue";
    case "engaged":
      return "Engaged";
    case "resolved":
      return "Resolved";
    case "none":
      return "Not escalated";
  }
}

function workflowBadge(item: ProductionIncidentItem) {
  const variant =
    item.workflowStatus === "ACKNOWLEDGED"
      ? "secondary"
      : item.workflowStatus === "OPEN"
        ? "destructive"
        : "outline";
  return <Badge variant={variant}>{item.workflowStatus.toLowerCase()}</Badge>;
}

export default async function CronExecutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isAllowedProductionCronSlug(slug)) notFound();

  const { sessionUser } = await getTenantActor();
  const [audit, timeline, canManageIncidents, incidentRollup] = await Promise.all([
    loadProductionCronExecutionAudit(),
    loadCronExecutionTimelineItems(slug, 25),
    canManageCronIncidentsForUser({ id: sessionUser.id, email: sessionUser.email }),
    loadProductionIncidentRollup(),
  ]);
  const row = audit.rows.find((item) => item.slug === slug);
  if (!row) notFound();
  const activeIncident = row.incidentMarker
    ? incidentRollup.items.find(
        (item) =>
          item.source === "critical_cron" &&
          item.sourceKey === buildCriticalCronIncidentSourceKey(row.slug, row.incidentMarker),
      ) ?? null
    : null;

  const preview = toSafeErrorPreview(row.lastError, 220, {
    redactEmail: true,
    redactPhone: true,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{row.label}</h1>
            <Badge variant={row.status === "healthy" ? "secondary" : "destructive"}>
              {row.status}
            </Badge>
            {activeIncident ? workflowBadge(activeIncident) : <Badge variant="outline">{row.incidentState}</Badge>}
          </div>
          <p className="mt-2 max-w-3xl text-muted-foreground">{row.summary}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{row.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/system-health/cron-execution">Back to cron audit</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href={row.ownerHref}>{row.ownerLabel}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Last success" value={fmtRelative(row.lastSucceededAt)} />
        <StatCard title="Last failure" value={fmtRelative(row.lastFailedAt)} />
        <StatCard title="Consecutive failures" value={String(row.consecutiveFailures)} />
        <StatCard title="Last status code" value={row.lastStatusCode != null ? String(row.lastStatusCode) : "—"} />
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Current recovery state</CardTitle>
          <CardDescription>{row.responseHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeIncident ? (
              workflowBadge(activeIncident)
            ) : (
              <Badge variant={row.incidentState === "open" ? "destructive" : row.incidentState === "acknowledged" ? "secondary" : "outline"}>
                {row.incidentState}
              </Badge>
            )}
            {row.critical ? <Badge variant="outline">critical</Badge> : null}
            <Badge variant="outline">schedule {row.schedule}</Badge>
            <Badge variant="outline">window {Math.round(row.windowMs / 60_000)}m</Badge>
          </div>
          {activeIncident?.acknowledgedAt ? (
            <p className="text-sm text-muted-foreground">
              Acknowledged by {activeIncident.acknowledgedByName ?? activeIncident.acknowledgedByUserId ?? "platform staff"}{" "}
              {fmtRelative(activeIncident.acknowledgedAt)}.
            </p>
          ) : row.incidentState === "acknowledged" ? (
            <p className="text-sm text-muted-foreground">
              Acknowledged by {row.incidentAcknowledgedByName ?? row.incidentAcknowledgedByUserId ?? "platform staff"}{" "}
              {fmtRelative(row.incidentAcknowledgedAt)}.
            </p>
          ) : null}
          {activeIncident?.assignedToName || activeIncident?.assignedToEmail ? (
            <p className="text-sm text-muted-foreground">
              Workflow owner {activeIncident.assignedToName ?? activeIncident.assignedToEmail}.
            </p>
          ) : null}
          {activeIncident?.workflowStatus === "RESOLVED" && activeIncident.resolutionSummary ? (
            <p className="text-sm text-muted-foreground">
              Resolution: {activeIncident.resolutionSummary}
            </p>
          ) : null}
          {row.autoEscalatedAt ? (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Auto-escalated {fmtRelative(row.autoEscalatedAt)}
                {autoEscalationLabel(row.autoEscalationReason)
                  ? ` · ${autoEscalationLabel(row.autoEscalationReason)}`
                  : ""}
                .
              </p>
              {row.autoEscalationTicketId && row.autoEscalationTicketRef ? (
                <Link
                  href={`/dashboard/support/${row.autoEscalationTicketId}`}
                  className="inline-block font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open support ticket {row.autoEscalationTicketRef}
                </Link>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge
                  variant={
                    row.autoEscalationEngagementState === "first_response_overdue" ||
                    row.autoEscalationEngagementState === "missing_ticket"
                      ? "destructive"
                      : row.autoEscalationEngagementState === "engaged"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {engagementLabel(row.autoEscalationEngagementState)}
                </Badge>
                {row.autoEscalationAssignedToName || row.autoEscalationAssignedToEmail ? (
                  <span>
                    Owner {row.autoEscalationAssignedToName ?? row.autoEscalationAssignedToEmail ?? "—"}
                  </span>
                ) : null}
                {row.autoEscalationFirstResponseAt ? (
                  <span>First response {fmtRelative(row.autoEscalationFirstResponseAt)}</span>
                ) : row.autoEscalationFirstResponseDueAt ? (
                  <span>First response due {fmtRelative(row.autoEscalationFirstResponseDueAt)}</span>
                ) : null}
                {row.autoEscalationFollowUpKind && row.autoEscalationFollowUpAt ? (
                  <span>
                    {followUpLabel(row.autoEscalationFollowUpKind)}{" "}
                    {fmtRelative(row.autoEscalationFollowUpAt)}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
          <SensitiveErrorPreview
            text={preview.text === "—" ? null : preview.text}
            redacted={preview.redacted}
            textClassName="text-sm text-destructive"
          />
          {canManageIncidents && activeIncident?.workflowStatus === "OPEN" ? (
            <form action={updateProductionIncidentWorkflowFormAction}>
              <input type="hidden" name="incidentId" value={activeIncident.id} />
              <input type="hidden" name="workflowStatus" value="ACKNOWLEDGED" />
              <input type="hidden" name="assignedToId" value={activeIncident.assignedToId ?? ""} />
              <input type="hidden" name="resolutionSummary" value="" />
              <Button type="submit" size="sm" variant="secondary" className="rounded-full">
                Acknowledge incident
              </Button>
            </form>
          ) : null}
          {canManageIncidents && activeIncident && activeIncident.workflowStatus !== "OPEN" ? (
            <form action={updateProductionIncidentWorkflowFormAction}>
              <input type="hidden" name="incidentId" value={activeIncident.id} />
              <input type="hidden" name="workflowStatus" value="OPEN" />
              <input type="hidden" name="assignedToId" value={activeIncident.assignedToId ?? ""} />
              <input type="hidden" name="resolutionSummary" value="" />
              <Button type="submit" size="sm" variant="outline" className="rounded-full">
                Reopen incident
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <ActivityTimeline
        title="Recent timeline"
        description="Append-only execution and incident transitions for this production cron."
        items={timeline}
        emptyLabel="No cron transitions recorded yet."
      />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
