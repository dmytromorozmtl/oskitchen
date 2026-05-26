import Link from "next/link";

import { ImplementationKpis } from "@/components/dashboard/implementation/implementation-kpis";
import { ReadinessBadge } from "@/components/dashboard/implementation/readiness-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import { canUseImplementation } from "@/lib/implementation/implementation-permissions";
import { IMPLEMENTATION_STATUS_LABEL, isActiveStatus } from "@/lib/implementation/implementation-status";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { getActiveProject, projectKpis } from "@/services/implementation/implementation-service";
import { getLatestReadiness } from "@/services/implementation/readiness-service";

export default async function ImplementationPage() {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const scope = createImplementationActorScope(actor);
  const ownerProfile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { companyName: true },
  });

  if (!canUseImplementation(scope, "implementation.view")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No access</CardTitle>
          <CardDescription>You do not have permission to view the Implementation Center.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const [active, kpis] = await Promise.all([getActiveProject(userId), projectKpis(userId)]);
  const readiness = active ? await getLatestReadiness({ userId, projectId: active.id }) : null;

  if (!active) {
    return <EmptyState companyName={ownerProfile?.companyName ?? null} />;
  }

  const [risksOpen, modulesConfigured, integrationsHealthy, trainingCount] = await Promise.all([
    prisma.implementationRisk.count({ where: { projectId: active.id, status: "open" } }),
    prisma.kitchenModulePreference.count({ where: { userId, pinned: true } }),
    prisma.integrationConnection.count({ where: { userId, status: "CONNECTED" } }),
    prisma.implementationChecklistItem.count({
      where: { projectId: active.id, phase: { key: "TRAINING" }, status: "DONE" },
    }),
  ]);

  const daysToGoLive = kpis.daysToGoLive;
  const tiles = [
    { label: "Active project", value: active.businessName, hint: IMPLEMENTATION_STATUS_LABEL[active.status] },
    {
      label: "Readiness score",
      value: readiness ? `${readiness.score}%` : "—",
      hint: readiness ? readiness.band.replaceAll("_", " ") : "Not checked",
    },
    { label: "Blockers", value: kpis.blockers, hint: `${risksOpen} open risks` },
    {
      label: "Tasks completed",
      value: `${kpis.tasksCompleted}/${kpis.tasksTotal}`,
      hint: "Across all projects",
    },
    {
      label: "Days to go-live",
      value: daysToGoLive === null ? "—" : daysToGoLive,
      hint: active.targetGoLiveDate
        ? `Target ${active.targetGoLiveDate.toLocaleDateString()}`
        : "No date",
    },
    { label: "Modules configured", value: modulesConfigured, hint: "Pinned in workspace" },
    { label: "Integrations connected", value: integrationsHealthy, hint: "Active connections" },
    { label: "Training items done", value: trainingCount, hint: "Across this project" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Implementation</h1>
          <p className="text-sm text-muted-foreground">
            Plan onboarding, migration, training, testing, go-live readiness, and post-launch support.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/implementation/go-live">Go-live checklist</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/implementation/new">Start implementation</Link>
          </Button>
        </div>
      </header>

      <ImplementationKpis tiles={tiles} />

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <span>{active.businessName}</span>
            <Badge variant="outline">{IMPLEMENTATION_STATUS_LABEL[active.status]}</Badge>
            <ReadinessBadge snapshot={readiness} />
          </CardTitle>
          <CardDescription>
            {active.businessType ?? "Business type unset"} ·{" "}
            {active.targetGoLiveDate ? `Go-live ${active.targetGoLiveDate.toLocaleDateString()}` : "No go-live date"} ·
            {" "}
            {active.assignedOwner ?? "Owner unassigned"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/dashboard/implementation/${active.id}`}>Open project</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/implementation/${active.id}/checklist`}>Checklist</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/implementation/${active.id}/go-live`}>Go-live plan</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/implementation/${active.id}/migration`}>Migration</Link>
            </Button>
          </div>

          {readiness?.blockers.length ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              <div className="font-semibold">Blockers</div>
              <ul className="list-disc pl-5">
                {readiness.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ProjectListPreview userId={userId} />
    </div>
  );
}

async function ProjectListPreview({ userId }: { userId: string }) {
  const projects = await prisma.implementationProject.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  if (projects.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent projects</CardTitle>
        <CardDescription>Latest five implementation projects in this workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/implementation/${p.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card p-3 hover:bg-muted"
          >
            <div>
              <div className="font-medium">{p.businessName}</div>
              <div className="text-xs text-muted-foreground">
                {IMPLEMENTATION_STATUS_LABEL[p.status]}
                {p.targetGoLiveDate ? ` · go-live ${p.targetGoLiveDate.toLocaleDateString()}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isActiveStatus(p.status) ? <Badge>Active</Badge> : <Badge variant="outline">{IMPLEMENTATION_STATUS_LABEL[p.status]}</Badge>}
              {p.readinessScore !== null ? <span>{p.readinessScore}%</span> : null}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyState({ companyName }: { companyName: string | null }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Implementation</h1>
          <p className="text-sm text-muted-foreground">
            Plan onboarding, migration, training, testing, go-live readiness, and post-launch support.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>No implementation project yet</CardTitle>
          <CardDescription>
            Create an onboarding project to manage setup, migration, training, testing, and go-live readiness.
            {companyName ? ` Pre-filled for ${companyName}.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/implementation/new">Start implementation</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/templates">Use a quick-start template</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/go-live">Open Go-Live checklist</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
