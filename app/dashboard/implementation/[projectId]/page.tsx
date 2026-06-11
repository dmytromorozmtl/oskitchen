import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { ReadinessBadge } from "@/components/dashboard/implementation/readiness-badge";
import { RunReadinessButton, MarkGoLiveButton } from "@/components/dashboard/implementation/project-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  CHECKLIST_PRIORITY_LABEL,
  CHECKLIST_STATUS_LABEL,
  IMPLEMENTATION_STATUS_LABEL,
  PHASE_STATUS_LABEL,
} from "@/lib/implementation/implementation-status";
import { prisma } from "@/lib/prisma";
import { getProject } from "@/services/implementation/implementation-service";
import { getLatestReadiness } from "@/services/implementation/readiness-service";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const [readiness, risksOpen, eventsCount] = await Promise.all([
    getLatestReadiness({ userId, projectId }),
    prisma.implementationRisk.count({ where: { projectId, status: "open" } }),
    prisma.implementationEvent.count({ where: { projectId } }),
  ]);

  const blockers = project.checklistItems.filter((c) => c.status === "BLOCKED");
  const requiredOpen = project.checklistItems.filter((c) => c.requiredForGoLive && c.status !== "DONE" && c.status !== "SKIPPED");
  const tasksDone = project.checklistItems.filter((c) => c.status === "DONE").length;
  const totalTasks = project.checklistItems.length;
  const nextItem =
    project.checklistItems.find((c) => c.status === "TODO" || c.status === "IN_PROGRESS") ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/dashboard/implementation"
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Implementation Center
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{project.businessName}</h1>
          <p className="text-sm text-muted-foreground">
            {project.businessType ?? "Type unset"} ·{" "}
            {project.assignedOwner ?? "Owner unassigned"} ·{" "}
            {project.targetGoLiveDate
              ? `Go-live ${project.targetGoLiveDate.toLocaleDateString()}`
              : "No go-live date"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{IMPLEMENTATION_STATUS_LABEL[project.status]}</Badge>
          <ReadinessBadge snapshot={readiness} />
        </div>
      </header>

      <ProjectSubnav projectId={projectId} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {readiness ? `${readiness.score}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{readiness?.band ?? "Not checked"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {tasksDone}/{totalTasks}
            </p>
            <p className="text-xs text-muted-foreground">{blockers.length} blockers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Required open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{requiredOpen.length}</p>
            <p className="text-xs text-muted-foreground">For go-live</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Risks open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{risksOpen}</p>
            <p className="text-xs text-muted-foreground">{eventsCount} audit events</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next best action</CardTitle>
          <CardDescription>
            Always one action at a time. Run readiness to refresh required-check status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextItem ? (
            <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium">{nextItem.title}</div>
                {nextItem.description ? (
                  <p className="text-xs text-muted-foreground">{nextItem.description}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{CHECKLIST_PRIORITY_LABEL[nextItem.priority]}</Badge>
                <Badge>{CHECKLIST_STATUS_LABEL[nextItem.status]}</Badge>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/implementation/${projectId}/checklist`}>Open checklist</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All checklist items are complete or skipped.</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <RunReadinessButton projectId={projectId} />
            <MarkGoLiveButton projectId={projectId} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phases</CardTitle>
          <CardDescription>Onboarding lifecycle from Discovery → Post-launch.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {project.phases.map((phase) => (
              <div key={phase.id} className="rounded-md border bg-card p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{phase.name}</span>
                  <Badge variant="outline">{PHASE_STATUS_LABEL[phase.status]}</Badge>
                </div>
                {phase.dueDate ? (
                  <p className="text-xs text-muted-foreground">
                    Due {phase.dueDate.toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
