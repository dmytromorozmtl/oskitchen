import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { UAT_SCENARIOS } from "@/lib/implementation/implementation-types";
import { getProject } from "@/services/implementation/implementation-service";

export default async function UatPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">UAT / Testing</h1>
      <ProjectSubnav projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Test scenarios</CardTitle>
          <CardDescription>Walk through these before flipping the project to LIVE.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {UAT_SCENARIOS.map((scenario) => (
              <li key={scenario.key} className="flex flex-wrap items-start justify-between gap-2 rounded-md border bg-card p-3">
                <div>
                  <div className="font-medium">{scenario.title}</div>
                  <p className="text-xs text-muted-foreground">{scenario.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{scenario.module.replaceAll("_", " ")}</Badge>
                  {scenario.actionRoute ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={scenario.actionRoute}>Open</Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
