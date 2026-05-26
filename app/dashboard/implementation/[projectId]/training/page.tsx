import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { TRAINING_TRACKS } from "@/lib/implementation/implementation-types";
import { getProject } from "@/services/implementation/implementation-service";

export default async function TrainingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const trainingItems = project.checklistItems.filter((c) => c.moduleKey === "training" || c.phaseId === project.phases.find((p) => p.key === "TRAINING")?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Training</h1>
      <ProjectSubnav projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Training tracks</CardTitle>
          <CardDescription>Role × module matrix recommended for this implementation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 text-left">Role</th>
                  <th className="px-2 py-2 text-left">Modules</th>
                </tr>
              </thead>
              <tbody>
                {TRAINING_TRACKS.map((track) => (
                  <tr key={track.role} className="border-t">
                    <td className="px-2 py-2 font-medium">{track.label}</td>
                    <td className="px-2 py-2 capitalize">
                      <div className="flex flex-wrap gap-1">
                        {track.modules.map((m) => (
                          <Badge key={m} variant="outline">
                            {m.replaceAll("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training checklist items</CardTitle>
          <CardDescription>Pulled from this project&apos;s checklist.</CardDescription>
        </CardHeader>
        <CardContent>
          {trainingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No training-related checklist items yet.</p>
          ) : (
            <ul className="space-y-2">
              {trainingItems.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                  <span>{item.title}</span>
                  <Badge variant="outline">{item.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
