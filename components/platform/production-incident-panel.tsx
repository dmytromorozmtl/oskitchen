import Link from "next/link";

import { ProductionIncidentRemediationControlForm } from "@/components/system/production-incident-remediation-control-form";
import { ProductionIncidentReviewForm } from "@/components/system/production-incident-review-form";
import { ProductionIncidentWorkflowForm } from "@/components/system/production-incident-workflow-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ProductionIncidentAssigneeOption,
  ProductionIncidentItem,
} from "@/services/incidents/production-incident-rollup-service";

function severityClass(severity: ProductionIncidentItem["severity"]) {
  if (severity === "critical") return "border-rose-700 bg-rose-900/40 text-rose-100";
  if (severity === "high") return "border-amber-700 bg-amber-900/40 text-amber-100";
  return "border-zinc-700 bg-zinc-900/50 text-zinc-200";
}

function workflowClass(workflowStatus: ProductionIncidentItem["workflowStatus"]) {
  if (workflowStatus === "OPEN") return "border-rose-700 bg-rose-900/40 text-rose-100";
  if (workflowStatus === "ACKNOWLEDGED") return "border-zinc-600 bg-zinc-800 text-zinc-100";
  return "border-zinc-700 bg-zinc-900/50 text-zinc-300";
}

export function PlatformProductionIncidentPanel({
  title,
  description,
  incidents,
  assignees,
  canManage,
  emptyLabel,
  ctaHref = "/platform/incidents",
  ctaLabel = "Open incident hub",
  maxItems,
  showReviewForm = false,
}: {
  title: string;
  description: string;
  incidents: ProductionIncidentItem[];
  assignees: ProductionIncidentAssigneeOption[];
  canManage: boolean;
  emptyLabel: string;
  ctaHref?: string;
  ctaLabel?: string;
  maxItems?: number;
  showReviewForm?: boolean;
}) {
  const visibleIncidents =
    typeof maxItems === "number" ? incidents.slice(0, maxItems) : incidents;
  const hiddenCount = Math.max(0, incidents.length - visibleIncidents.length);

  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader>
        <CardTitle className="text-base text-white">{title}</CardTitle>
        <CardDescription className="text-zinc-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-zinc-300">
        {visibleIncidents.length === 0 ? (
          <p className="text-zinc-500">{emptyLabel}</p>
        ) : (
          visibleIncidents.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{item.title}</p>
                    <Badge className={severityClass(item.severity)}>{item.severity}</Badge>
                    <Badge className={workflowClass(item.workflowStatus)}>
                      {item.workflowStatus.toLowerCase()}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      {item.source.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-zinc-400">{item.summary}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span>
                      Owner {item.assignedToName ?? item.assignedToEmail ?? item.ownerLabel}
                    </span>
                    <span>Last seen {new Date(item.lastSeenAt).toISOString().slice(0, 19)}Z</span>
                    {item.acknowledgedAt ? (
                      <span>
                        Acknowledged by{" "}
                        {item.acknowledgedByName ?? item.acknowledgedByUserId ?? "platform staff"}
                      </span>
                    ) : null}
                    <span>Review {item.reviewStatus.toLowerCase()}</span>
                    {item.rootCauseCategory ? (
                      <span>Root cause {item.rootCauseCategory.replace(/_/g, " ")}</span>
                    ) : null}
                    {item.remediationOwnerName || item.remediationOwnerEmail ? (
                      <span>
                        Remediation owner{" "}
                        {item.remediationOwnerName ?? item.remediationOwnerEmail}
                      </span>
                    ) : null}
                    {item.remediationDueAt ? (
                      <span>
                        Remediation due {item.remediationDueAt.slice(0, 10)}
                        {item.remediationOverdue ? " (overdue)" : ""}
                      </span>
                    ) : null}
                    <span>
                      Remediation control{" "}
                      {item.remediationControlStatus.toLowerCase().replace(/_/g, " ")}
                    </span>
                    {item.remediationTaskKind ? (
                      <span>
                        Follow-up task {item.remediationTaskKind.replace(/_/g, " ")}
                        {item.remediationTaskStatus
                          ? ` (${item.remediationTaskStatus.toLowerCase()})`
                          : ""}
                      </span>
                    ) : null}
                    {item.remediationTaskOwnerName || item.remediationTaskOwnerEmail ? (
                      <span>
                        Task owner{" "}
                        {item.remediationTaskOwnerName ?? item.remediationTaskOwnerEmail}
                      </span>
                    ) : null}
                    {item.remediationTaskDueAt ? (
                      <span>Task due {item.remediationTaskDueAt.slice(0, 10)}</span>
                    ) : null}
                    {item.remediationTaskMissing ? (
                      <span className="text-rose-300">Follow-up task missing</span>
                    ) : null}
                    {item.remediationSnoozedUntil ? (
                      <span>Snoozed until {item.remediationSnoozedUntil.slice(0, 10)}</span>
                    ) : null}
                    {item.badges.map((badge) => (
                      <span
                        key={`${item.id}:${badge}`}
                        className="rounded-full border border-zinc-700 px-2 py-0.5"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  {item.reviewSummary ? (
                    <p className="text-xs text-zinc-500">Review: {item.reviewSummary}</p>
                  ) : null}
                  {item.remediationControlSummary ? (
                    <p className="text-xs text-zinc-500">
                      Remediation control: {item.remediationControlSummary}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <Button asChild variant="ghost" size="sm" className="rounded-full text-amber-200 hover:text-amber-100">
                    <Link href={item.href}>Open source view</Link>
                  </Button>
                  {item.remediationTaskHref ? (
                    <Button asChild variant="ghost" size="sm" className="rounded-full text-zinc-300 hover:text-white">
                      <Link href={item.remediationTaskHref}>Open follow-up task</Link>
                    </Button>
                  ) : null}
                  {canManage ? (
                    <div className="space-y-2">
                      <ProductionIncidentWorkflowForm
                        incident={item}
                        assignees={assignees}
                        className="grid w-full min-w-[320px] gap-2 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-xs md:w-[380px]"
                      />
                      {showReviewForm ? (
                        <>
                          <ProductionIncidentReviewForm incident={item} assignees={assignees} />
                          {item.reviewStatus === "IN_REMEDIATION" ? (
                            <ProductionIncidentRemediationControlForm incident={item} />
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="link" className="px-0 text-amber-200">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          {hiddenCount > 0 ? (
            <p className="text-xs text-zinc-500">
              {hiddenCount} more incident{hiddenCount === 1 ? "" : "s"} remain in the queue.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
