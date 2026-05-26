import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { IMPLEMENTATION_DATASETS } from "@/lib/implementation/implementation-types";
import { prisma } from "@/lib/prisma";
import { getProject } from "@/services/implementation/implementation-service";

export default async function MigrationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const recentImports = await prisma.importJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, type: true, status: true, totalRows: true, validRows: true, errorRows: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Data Migration</h1>
      <ProjectSubnav projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Datasets to plan</CardTitle>
          <CardDescription>
            The Implementation Center never imports data on your behalf. Use the Import Center for safe, validated
            uploads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {IMPLEMENTATION_DATASETS.map((dataset) => (
              <div key={dataset.key} className="flex items-center justify-between rounded-md border bg-card p-3">
                <div>
                  <div className="font-medium">{dataset.label}</div>
                  {dataset.importType ? (
                    <p className="text-xs text-muted-foreground">Type {dataset.importType}</p>
                  ) : null}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={dataset.templateRoute ?? "/dashboard/import-center"}>Open</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent import jobs</CardTitle>
          <CardDescription>Workspace-wide history of validation + commit attempts.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentImports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No import jobs yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentImports.map((job) => (
                <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                  <div>
                    <div className="font-medium">{job.type}</div>
                    <p className="text-xs text-muted-foreground">
                      {job.totalRows} rows · {job.validRows} valid · {job.errorRows} errored ·{" "}
                      {job.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{job.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
