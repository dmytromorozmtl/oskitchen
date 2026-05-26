import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getProject, listEvents } from "@/services/implementation/implementation-service";

export default async function ActivityPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const events = await listEvents(projectId, userId, 200);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
      <ProjectSubnav projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>Every state change is recorded.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 border-b pb-1.5">
                  <div>
                    <div className="font-medium">{e.summary ?? e.eventType}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.eventType} {e.performedBy ? `· ${e.performedBy}` : ""}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{e.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
