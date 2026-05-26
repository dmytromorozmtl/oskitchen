import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { AddRiskForm, ResolveRiskButton } from "@/components/dashboard/implementation/risk-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getProject, listRisks } from "@/services/implementation/implementation-service";

export default async function RisksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const risks = await listRisks(projectId, userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Risks</h1>
      <ProjectSubnav projectId={projectId} />

      <AddRiskForm projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Open and resolved risks</CardTitle>
          <CardDescription>Reviewed at every implementation sync.</CardDescription>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No risks logged.</p>
          ) : (
            <ul className="space-y-2">
              {risks.map((risk) => (
                <li key={risk.id} className="flex flex-col gap-2 rounded-md border bg-card p-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-medium">
                      <span>{risk.title}</span>
                      <Badge variant="outline">{risk.severity}</Badge>
                      <Badge>{risk.status}</Badge>
                    </div>
                    {risk.mitigation ? (
                      <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                    ) : null}
                  </div>
                  {risk.status === "open" ? (
                    <ResolveRiskButton projectId={projectId} riskId={risk.id} />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
