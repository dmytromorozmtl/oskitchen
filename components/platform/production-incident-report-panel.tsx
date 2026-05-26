import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductionIncidentExecutiveReport } from "@/services/incidents/production-incident-reporting-service";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 60_000) return "<1m";
  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

export function PlatformProductionIncidentReportPanel({
  title,
  description,
  report,
  maxAttention = 5,
}: {
  title: string;
  description: string;
  report: ProductionIncidentExecutiveReport;
  maxAttention?: number;
}) {
  const attention = report.attention.slice(0, maxAttention);
  const remediationAttention = report.remediationAttention.slice(0, maxAttention);
  const repeatOffenders = report.repeatOffenders.slice(0, maxAttention);
  const rootCauseTrends = report.rootCauseTrends.slice(0, maxAttention);

  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader>
        <CardTitle className="text-base text-white">{title}</CardTitle>
        <CardDescription className="text-zinc-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Ack Overdue"
            value={report.summary.ackOverdue}
            detail="Open incidents that breached acknowledgement SLA."
          />
          <Metric
            label="Resolution Overdue"
            value={report.summary.resolutionOverdue}
            detail="Open incidents older than their severity-based resolution target."
          />
          <Metric
            label="Unassigned"
            value={report.summary.unassigned}
            detail="Open incidents without an explicit workflow owner."
          />
          <Metric
            label="Aged >24h"
            value={report.summary.agedOver24h}
            detail="Open incidents older than one day."
          />
          <Metric
            label="Aged >72h"
            value={report.summary.agedOver72h}
            detail="Open incidents older than three days."
          />
          <Metric
            label="MTTA (30d)"
            value={formatDuration(report.summary.mttaMs)}
            detail="Mean time to acknowledge across recent incidents."
          />
          <Metric
            label="MTTR (30d)"
            value={formatDuration(report.summary.mttrMs)}
            detail="Mean time to resolve across incidents closed in the last 30 days."
          />
          <Metric
            label="Resolved 30d"
            value={report.summary.resolvedLast30d}
            detail="Resolved incidents included in the trailing report window."
          />
          <Metric
            label="Review Pending"
            value={report.summary.pendingReview}
            detail="Active or recent incidents still missing postmortem classification."
          />
          <Metric
            label="In Remediation"
            value={report.summary.inRemediation}
            detail="Incidents with follow-up work still assigned to remediation owners."
          />
          <Metric
            label="Review Complete"
            value={report.summary.completedReview}
            detail="Incidents with a completed root-cause review in the report window."
          />
          <Metric
            label="Remediation Overdue"
            value={report.summary.remediationOverdue}
            detail="Open remediation commitments that are past their due date."
          />
          <Metric
            label="Due Next 7d"
            value={report.summary.remediationDueNext7d}
            detail="Remediation commitments that require owner follow-through this week."
          />
          <Metric
            label="Owner Engaged"
            value={report.summary.remediationOwnerEngaged}
            detail="Remediation items where the current owner explicitly accepted the work."
          />
          <Metric
            label="Snoozed"
            value={report.summary.remediationSnoozed}
            detail="Accepted delays that suppress follow-up until the agreed snooze date."
          />
          <Metric
            label="Needs Reassign"
            value={report.summary.remediationReassignmentRequested}
            detail="Remediation items explicitly waiting for a new owner."
          />
          <Metric
            label="Task-Backed"
            value={report.summary.remediationTaskBacked}
            detail="In-remediation incidents that already have an active automation follow-up task."
          />
          <Metric
            label="Task Gaps"
            value={report.summary.remediationTaskMissing}
            detail="Incidents that should have a follow-up task but currently do not."
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
            <p className="font-medium text-white">Open by source</p>
            <div className="mt-2 space-y-1 text-xs text-zinc-500">
              <p>Startup readiness: {report.bySource.startup_readiness}</p>
              <p>Critical cron: {report.bySource.critical_cron}</p>
              <p>Webhook recovery: {report.bySource.webhook_recovery}</p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
            <p className="font-medium text-white">Open by workflow</p>
            <div className="mt-2 space-y-1 text-xs text-zinc-500">
              <p>Open: {report.byWorkflow.OPEN}</p>
              <p>Acknowledged: {report.byWorkflow.ACKNOWLEDGED}</p>
              <p>Monitoring: {report.byWorkflow.MONITORING}</p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
            <p className="font-medium text-white">Attention summary</p>
            <div className="mt-2 space-y-1 text-xs text-zinc-500">
              <p>Open incidents: {report.summary.open}</p>
              <p>Critical open: {report.summary.critical}</p>
              <p>High open: {report.summary.high}</p>
              <p>Awaiting acknowledgement: {report.summary.awaitingAcknowledgement}</p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
            <p className="font-medium text-white">Review backlog</p>
            <div className="mt-2 space-y-1 text-xs text-zinc-500">
              <p>Pending: {report.byReview.PENDING}</p>
              <p>In remediation: {report.byReview.IN_REMEDIATION}</p>
              <p>Completed: {report.byReview.COMPLETED}</p>
              <p>Overdue remediation: {report.summary.remediationOverdue}</p>
              <p>Reassignment requested: {report.summary.remediationReassignmentRequested}</p>
              <p>Task-backed: {report.summary.remediationTaskBacked}</p>
              <p>Task gaps: {report.summary.remediationTaskMissing}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Top attention queue</p>
          {attention.length === 0 ? (
            <p className="text-sm text-zinc-500">No active incident is currently breaching the reporting thresholds.</p>
          ) : (
            attention.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{item.title}</span>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase text-zinc-300">
                    {item.severity}
                  </span>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase text-zinc-300">
                    {item.workflowStatus.toLowerCase()}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>Age {formatDuration(item.ageMs)}</span>
                  <span>Owner {item.assignedToName ?? item.assignedToEmail ?? item.ownerLabel}</span>
                  {item.ackOverdue ? <span>Ack overdue</span> : null}
                  {item.resolutionOverdue ? <span>Resolution overdue</span> : null}
                  {item.unassigned ? <span>Unassigned</span> : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Remediation queue</p>
          {remediationAttention.length === 0 ? (
            <p className="text-sm text-zinc-500">No remediation commitments are currently overdue or actively assigned.</p>
          ) : (
            remediationAttention.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{item.title}</span>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase text-zinc-300">
                    {item.reviewStatus.toLowerCase()}
                  </span>
                  {item.rootCauseCategory ? (
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase text-zinc-300">
                      {item.rootCauseCategory.replace(/_/g, " ")}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>
                    Owner {item.remediationOwnerName ?? item.remediationOwnerEmail ?? "unassigned"}
                  </span>
                  <span>Due {item.remediationDueAt?.slice(0, 10) ?? "—"}</span>
                  <span>
                    Control {item.remediationControlStatus.toLowerCase().replace(/_/g, " ")}
                  </span>
                  {item.remediationTaskKind ? (
                    <span>
                      Task {item.remediationTaskKind.replace(/_/g, " ")}
                      {item.remediationTaskStatus
                        ? ` (${item.remediationTaskStatus.toLowerCase()})`
                        : ""}
                    </span>
                  ) : null}
                  {item.remediationTaskOwnerName || item.remediationTaskOwnerEmail ? (
                    <span>
                      Task owner {item.remediationTaskOwnerName ?? item.remediationTaskOwnerEmail}
                    </span>
                  ) : null}
                  {item.remediationTaskDueAt ? (
                    <span>Task due {item.remediationTaskDueAt.slice(0, 10)}</span>
                  ) : null}
                  {item.remediationSnoozedUntil ? (
                    <span>Snoozed until {item.remediationSnoozedUntil.slice(0, 10)}</span>
                  ) : null}
                  {item.remediationOverdue ? <span>Overdue</span> : null}
                  {item.dueWithin7d ? <span>Due within 7d</span> : null}
                  {item.remediationTaskMissing ? <span>Task missing</span> : null}
                </div>
                {item.remediationControlSummary ? (
                  <p className="mt-2 text-xs text-zinc-500">{item.remediationControlSummary}</p>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Root cause patterns</p>
          {rootCauseTrends.length === 0 ? (
            <p className="text-sm text-zinc-500">Root-cause trends will appear once incident reviews are classified.</p>
          ) : (
            rootCauseTrends.map((item) => (
              <div
                key={item.category}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{item.category.replace(/_/g, " ")}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>Incidents {item.incidentCount}</span>
                  <span>Still open {item.openCount}</span>
                  <span>Overdue remediation {item.remediationOverdueCount}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Repeat offender queue</p>
          {repeatOffenders.length === 0 ? (
            <p className="text-sm text-zinc-500">No recurring source families crossed the repeat-offender threshold.</p>
          ) : (
            repeatOffenders.map((item) => (
              <div
                key={item.familyKey}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{item.label}</span>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase text-zinc-300">
                    {item.source.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>Cycles {item.cycleCount}</span>
                  <span>Incident rows {item.incidentCount}</span>
                  <span>Reopens {item.reopenCount}</span>
                  <span>Open now {item.openCount}</span>
                  <span>Pending review {item.pendingReviewCount}</span>
                  <span>Unique source keys {item.uniqueSourceKeys}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
