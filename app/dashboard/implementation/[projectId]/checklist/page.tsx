import { notFound } from "next/navigation";

import { ChecklistRow } from "@/components/dashboard/implementation/checklist-row";
import { GenerateTasksPanel } from "@/components/dashboard/implementation/project-actions";
import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { PHASE_DEFINITIONS } from "@/lib/implementation/implementation-types";
import { getProject } from "@/services/implementation/implementation-service";

export default async function ChecklistPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const byPhase = new Map<string, typeof project.checklistItems>();
  for (const item of project.checklistItems) {
    const phaseKey = project.phases.find((p) => p.id === item.phaseId)?.key ?? "DISCOVERY";
    const list = byPhase.get(phaseKey) ?? [];
    list.push(item);
    byPhase.set(phaseKey, list);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Checklist</h1>
      <ProjectSubnav projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Generate tasks (preview-first)</CardTitle>
          <CardDescription>
            Preview the tasks that would be created from open checklist items. Nothing is created until you
            confirm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateTasksPanel projectId={projectId} />
        </CardContent>
      </Card>

      {PHASE_DEFINITIONS.map((phaseDef) => {
        const items = byPhase.get(phaseDef.key) ?? [];
        if (items.length === 0) return null;
        return (
          <Card key={phaseDef.key}>
            <CardHeader>
              <CardTitle>{phaseDef.name}</CardTitle>
              <CardDescription>{items.length} item{items.length === 1 ? "" : "s"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <ChecklistRow key={item.id} projectId={projectId} item={item} />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
