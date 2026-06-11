import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { PHASE_STATUS_LABEL } from "@/lib/implementation/implementation-status";
import { getProject } from "@/services/implementation/implementation-service";

export default async function TimelinePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
      <ProjectSubnav projectId={projectId} />
      <Card>
        <CardHeader>
          <CardTitle>Phases</CardTitle>
          <CardDescription>Lifecycle of this implementation project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {project.phases.map((phase, idx) => {
              const itemCount = project.checklistItems.filter((c) => c.phaseId === phase.id).length;
              const done = project.checklistItems.filter(
                (c) => c.phaseId === phase.id && c.status === "DONE",
              ).length;
              return (
                <li key={phase.id} className="rounded-md border bg-card p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">
                        {idx + 1}. {phase.name}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {done}/{itemCount} items complete
                        {phase.dueDate ? ` · due ${phase.dueDate.toLocaleDateString()}` : ""}
                        {phase.completedAt
                          ? ` · completed ${phase.completedAt.toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <Badge variant="outline">{PHASE_STATUS_LABEL[phase.status]}</Badge>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
