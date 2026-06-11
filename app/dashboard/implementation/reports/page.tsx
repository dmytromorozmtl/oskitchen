import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import { canUseImplementation } from "@/lib/implementation/implementation-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { importJobListWhereForOwner } from "@/lib/scope/workspace-import-export-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { prisma } from "@/lib/prisma";

export default async function ImplementationReportsPage() {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const scope = createImplementationActorScope(actor);
  if (!canUseImplementation(scope, "implementation.reports")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No access</CardTitle>
          <CardDescription>You do not have permission to view implementation reports.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const [mappingWhere, importJobWhere] = await Promise.all([
    productMappingListWhereForOwner(userId),
    importJobListWhereForOwner(userId),
  ]);
  const [imports, unmatched, merges, testRuns, tasks, projects, checklistRollup] = await Promise.all([
    prisma.importJob.findMany({ where: importJobWhere, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.productMapping.count({
      where: { AND: [mappingWhere, { status: { not: "CONFIRMED" } }] },
    }),
    prisma.customerMergeEvent.count({ where: { userId } }),
    prisma.goLiveTestRun.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.implementationTask.groupBy({ by: ["status"], where: { project: { userId } }, _count: true }),
    prisma.implementationProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, businessName: true, status: true, readinessScore: true, targetGoLiveDate: true },
    }),
    prisma.implementationChecklistItem.groupBy({
      by: ["status"],
      where: { project: { userId } },
      _count: true,
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Implementation reports</h1>
        <p className="mt-2 text-muted-foreground">Operational onboarding reports for customer success and launch review.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data import summary</CardTitle>
            <CardDescription>{imports.length} recent jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {imports.map((job) => <p key={job.id}>{job.type}: {job.validRows} valid / {job.errorRows} errors</p>)}
            <Button asChild variant="outline" className="mt-3">
              <Link href="/dashboard/import-center">Open import center</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unmatched products report</CardTitle>
            <CardDescription>{unmatched} records need review</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/product-mapping">Resolve mappings</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer cleanup report</CardTitle>
            <CardDescription>{merges} confirmed merges</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/customers/deduplication">Open deduplication</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Staff training progress</CardTitle>
            <CardDescription>{tasks.map((t) => `${t.status}: ${t._count}`).join(" · ") || "No project tasks"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/training">Open training</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Go-live readiness report</CardTitle>
          <CardDescription>Recent simulation output.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {testRuns.map((run) => <p key={run.id}>{run.createdAt.toLocaleString()} · {run.status}</p>)}
          {testRuns.length === 0 ? <p>No test runs yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project readiness rollup</CardTitle>
          <CardDescription>{projects.length} most recent projects with their last readiness score.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          {projects.length === 0 ? (
            <p className="text-muted-foreground">No implementation projects yet.</p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-1.5">
                <Link href={`/dashboard/implementation/${p.id}`} className="font-medium hover:underline">
                  {p.businessName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {p.status.replaceAll("_", " ")} ·{" "}
                  {p.readinessScore !== null ? `${p.readinessScore}%` : "no readiness check"}
                  {p.targetGoLiveDate ? ` · go-live ${p.targetGoLiveDate.toLocaleDateString()}` : ""}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist rollup</CardTitle>
          <CardDescription>Aggregated across every project in this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {checklistRollup.length === 0 ? (
            <p>No checklist items yet.</p>
          ) : (
            <p>{checklistRollup.map((c) => `${c.status}: ${c._count}`).join(" · ")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
