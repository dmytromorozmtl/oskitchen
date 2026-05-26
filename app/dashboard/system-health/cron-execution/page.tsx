import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import {
  canManageCronIncidentsForUser,
} from "@/actions/cron-incidents";
import { updateProductionIncidentWorkflowFormAction } from "@/actions/production-incidents";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  type CronExecutionAuditRow,
  loadProductionCronExecutionAudit,
} from "@/services/cron/cron-execution-evidence";
import {
  loadProductionIncidentRollup,
  type ProductionIncidentItem,
} from "@/services/incidents/production-incident-rollup-service";
import { buildCriticalCronIncidentSourceKey } from "@/services/incidents/production-incident-source-keys";

function statusBadge(row: CronExecutionAuditRow) {
  const variant =
    row.status === "healthy"
      ? "secondary"
      : row.status === "pending_initial_run"
        ? "outline"
        : "destructive";
  const label =
    row.status === "pending_initial_run"
      ? "Pending first run"
      : row.status === "healthy"
        ? "Healthy"
        : row.status === "stale"
          ? "Stale"
          : "Failing";
  return <Badge variant={variant}>{label}</Badge>;
}

function fmtRelative(value: string | null) {
  if (!value) return "—";
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function incidentBadge(row: CronExecutionAuditRow) {
  const variant =
    row.incidentState === "acknowledged"
      ? "secondary"
      : row.incidentState === "open"
        ? "destructive"
        : row.incidentState === "resolved"
          ? "outline"
          : "outline";
  const label =
    row.incidentState === "acknowledged"
      ? "Acknowledged"
      : row.incidentState === "open"
        ? "Open"
        : row.incidentState === "resolved"
          ? "Resolved"
          : "None";
  return <Badge variant={variant}>{label}</Badge>;
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

function autoEscalationLabel(reason: CronExecutionAuditRow["autoEscalationReason"]) {
  if (reason === "repeated_failures") return "Repeated failures";
  if (reason === "prolonged_outage") return "Prolonged outage";
  return null;
}

function followUpLabel(kind: CronExecutionAuditRow["autoEscalationFollowUpKind"]) {
  if (kind === "rerouted") return "Auto-rerouted";
  if (kind === "reminded") return "Reminder sent";
  return null;
}

function engagementBadge(row: CronExecutionAuditRow) {
  const state = row.autoEscalationEngagementState;
  const variant =
    state === "first_response_overdue" || state === "missing_ticket"
      ? "destructive"
      : state === "unassigned"
        ? "outline"
        : state === "engaged"
          ? "secondary"
          : "outline";
  const label =
    state === "unassigned"
      ? "Unassigned"
      : state === "awaiting_first_response"
        ? "Awaiting first response"
        : state === "first_response_overdue"
          ? "First response overdue"
          : state === "engaged"
            ? "Engaged"
            : state === "resolved"
              ? "Resolved"
              : state === "missing_ticket"
                ? "Missing support ticket"
                : "Not escalated";
  return <Badge variant={variant}>{label}</Badge>;
}

function Metric({ title, value, detail }: { title: string; value: number; detail: string }) {
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

export default async function CronExecutionAuditPage() {
  const { sessionUser } = await getTenantActor();
  const [audit, canManageIncidents, incidentRollup] = await Promise.all([
    loadProductionCronExecutionAudit(),
    canManageCronIncidentsForUser({ id: sessionUser.id, email: sessionUser.email }),
    loadProductionIncidentRollup(),
  ]);
  const incidentBySourceKey = new Map(
    incidentRollup.items
      .filter((item) => item.source === "critical_cron")
      .map((item) => [item.sourceKey, item] as const),
  );
  const enforcementEnabled = process.env.NODE_ENV === "production";
  const topBadgeVariant =
    audit.summary.criticalStalledAutoEscalations > 0
      ? "destructive"
      : audit.summary.criticalAutoEscalatedIncidents > 0 || audit.summary.criticalOpenIncidents > 0
      ? "destructive"
      : audit.summary.criticalAcknowledgedIncidents > 0
        ? "outline"
        : "secondary";
  const topBadgeLabel =
    audit.summary.criticalStalledAutoEscalations > 0
      ? "Critical escalation stalled"
      : audit.summary.criticalAutoEscalatedIncidents > 0
      ? "Critical incident auto-escalated"
      : audit.summary.criticalOpenIncidents > 0
      ? "Open critical incident"
      : audit.summary.criticalAcknowledgedIncidents > 0
        ? "Acknowledged critical incident"
        : "Healthy";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Cron execution audit</h1>
            <Badge variant={topBadgeVariant}>{topBadgeLabel}</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Operational truth for production cron execution evidence. Health readiness only gates on
            fast critical cron routes, but this audit shows every allowlisted production cron, its last
            success or failure, and the owning module to inspect first.
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

      {!enforcementEnabled ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Readiness gating is production-only</CardTitle>
            <CardDescription>
              This audit still shows cron evidence in non-production environments, but stale or pending
              rows do not degrade `/api/health` outside production.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Critical stalled"
          value={audit.summary.criticalStalledAutoEscalations}
          detail="Critical auto-escalations missing an owner or overdue for first human response."
        />
        <Metric
          title="Critical auto-escalated"
          value={audit.summary.criticalAutoEscalatedIncidents}
          detail="Critical incidents that already opened a support escalation ticket."
        />
        <Metric
          title="Unassigned escalations"
          value={audit.summary.unassignedAutoEscalations}
          detail="Auto-escalated incidents without a resolved support owner or missing linked ticket."
        />
        <Metric
          title="First response overdue"
          value={audit.summary.firstResponseOverdueAutoEscalations}
          detail="Assigned auto-escalations that exceeded first-response SLA without human follow-up."
        />
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Production cron rows</CardTitle>
          <CardDescription>
            Sorted with critical cron routes first, then stale/failing rows. Last error previews are
            display-redacted.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cron</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last success</TableHead>
                <TableHead>Last failure</TableHead>
                <TableHead>Consecutive failures</TableHead>
                <TableHead>Last status</TableHead>
                <TableHead className="min-w-[280px]">Recovery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.rows.map((row) => {
                const preview = toSafeErrorPreview(row.lastError, 160, {
                  redactEmail: true,
                  redactPhone: true,
                });
                const activeIncident = row.incidentMarker
                  ? incidentBySourceKey.get(
                      buildCriticalCronIncidentSourceKey(row.slug, row.incidentMarker),
                    ) ?? null
                  : null;
                return (
                  <TableRow key={row.slug}>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{row.label}</span>
                          {row.critical ? (
                            <Badge variant="outline" className="text-[10px]">
                              critical
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">{row.summary}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{row.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">{statusBadge(row)}</TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-2">
                        {activeIncident ? workflowBadge(activeIncident) : incidentBadge(row)}
                        {activeIncident?.acknowledgedAt ? (
                          <p className="text-xs text-muted-foreground">
                            {activeIncident.acknowledgedByName ??
                              activeIncident.acknowledgedByUserId ??
                              "Platform staff"}{" "}
                            · {fmtRelative(activeIncident.acknowledgedAt)}
                          </p>
                        ) : row.incidentState === "acknowledged" ? (
                          <p className="text-xs text-muted-foreground">
                            {row.incidentAcknowledgedByName ?? row.incidentAcknowledgedByUserId ?? "Platform staff"} ·{" "}
                            {fmtRelative(row.incidentAcknowledgedAt)}
                          </p>
                        ) : null}
                        {activeIncident?.assignedToName || activeIncident?.assignedToEmail ? (
                          <p className="text-xs text-muted-foreground">
                            Workflow owner {activeIncident.assignedToName ?? activeIncident.assignedToEmail}
                          </p>
                        ) : null}
                        {activeIncident?.workflowStatus === "RESOLVED" && activeIncident.resolutionSummary ? (
                          <p className="text-xs text-muted-foreground">
                            Resolution: {activeIncident.resolutionSummary}
                          </p>
                        ) : null}
                        {row.autoEscalatedAt ? (
                          <div className="space-y-1">
                            {engagementBadge(row)}
                            <p className="text-xs text-muted-foreground">
                              Auto-escalated {fmtRelative(row.autoEscalatedAt)}
                              {autoEscalationLabel(row.autoEscalationReason)
                                ? ` · ${autoEscalationLabel(row.autoEscalationReason)}`
                                : ""}
                            </p>
                            {row.autoEscalationAssignedToName || row.autoEscalationAssignedToEmail ? (
                              <p className="text-xs text-muted-foreground">
                                Owner {row.autoEscalationAssignedToName ?? row.autoEscalationAssignedToEmail ?? "—"}
                                {row.autoEscalationFirstResponseAt
                                  ? ` · first response ${fmtRelative(row.autoEscalationFirstResponseAt)}`
                                  : row.autoEscalationFirstResponseDueAt
                                    ? ` · due ${fmtRelative(row.autoEscalationFirstResponseDueAt)}`
                                    : ""}
                              </p>
                            ) : row.autoEscalationFirstResponseDueAt ? (
                              <p className="text-xs text-muted-foreground">
                                No owner confirmed yet · first response due {fmtRelative(row.autoEscalationFirstResponseDueAt)}
                              </p>
                            ) : null}
                            {row.autoEscalationFollowUpKind && row.autoEscalationFollowUpAt ? (
                              <p className="text-xs text-muted-foreground">
                                {followUpLabel(row.autoEscalationFollowUpKind)} {fmtRelative(row.autoEscalationFollowUpAt)}
                              </p>
                            ) : null}
                            {row.autoEscalationTicketId && row.autoEscalationTicketRef ? (
                              <Link
                                href={`/dashboard/support/${row.autoEscalationTicketId}`}
                                className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                              >
                                {row.autoEscalationTicketRef}
                              </Link>
                            ) : null}
                          </div>
                        ) : activeIncident?.workflowStatus === "RESOLVED" ? (
                          <p className="text-xs text-muted-foreground">
                            Marked resolved in the unified production incident lifecycle.
                          </p>
                        ) : row.incidentState === "resolved" ? (
                          <p className="text-xs text-muted-foreground">
                            Recovered after the last degraded cycle.
                          </p>
                        ) : row.incidentState === "open" ? (
                          <p className="text-xs text-muted-foreground">
                            No platform acknowledgement recorded for the current degraded cycle.
                          </p>
                        ) : row.incidentState === "acknowledged" ? (
                          <p className="text-xs text-muted-foreground">
                            Acknowledged by platform staff and waiting for recovery.
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">No active incident.</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground">
                      <div>{row.schedule}</div>
                      <div>window {Math.round(row.windowMs / 60_000)}m</div>
                    </TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground">
                      {fmtRelative(row.lastSucceededAt)}
                    </TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground">
                      {fmtRelative(row.lastFailedAt)}
                    </TableCell>
                    <TableCell className="align-top text-sm tabular-nums">{row.consecutiveFailures}</TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground">
                      {row.lastStatusCode ?? "—"}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{row.responseHint}</p>
                        <SensitiveErrorPreview
                          text={preview.text === "—" ? null : preview.text}
                          redacted={preview.redacted}
                          textClassName="text-xs text-destructive"
                        />
                        <Link
                          href={row.ownerHref}
                          className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {row.ownerLabel}
                        </Link>
                        <Link
                          href={`/dashboard/system-health/cron-execution/${row.slug}`}
                          className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Open history
                        </Link>
                        {canManageIncidents && activeIncident?.workflowStatus === "OPEN" ? (
                          <form action={updateProductionIncidentWorkflowFormAction}>
                            <input type="hidden" name="incidentId" value={activeIncident.id} />
                            <input type="hidden" name="workflowStatus" value="ACKNOWLEDGED" />
                            <input type="hidden" name="assignedToId" value={activeIncident.assignedToId ?? ""} />
                            <input type="hidden" name="resolutionSummary" value="" />
                            <Button type="submit" size="sm" variant="secondary" className="rounded-full">
                              Acknowledge
                            </Button>
                          </form>
                        ) : null}
                        {canManageIncidents &&
                        activeIncident &&
                        activeIncident.workflowStatus !== "OPEN" ? (
                          <form action={updateProductionIncidentWorkflowFormAction}>
                            <input type="hidden" name="incidentId" value={activeIncident.id} />
                            <input type="hidden" name="workflowStatus" value="OPEN" />
                            <input type="hidden" name="assignedToId" value={activeIncident.assignedToId ?? ""} />
                            <input type="hidden" name="resolutionSummary" value="" />
                            <Button type="submit" size="sm" variant="outline" className="rounded-full">
                              Reopen
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
