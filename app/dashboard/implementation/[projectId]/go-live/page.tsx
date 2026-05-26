import { notFound } from "next/navigation";

import { MarkGoLiveButton, RunReadinessButton } from "@/components/dashboard/implementation/project-actions";
import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { ReadinessBadge } from "@/components/dashboard/implementation/readiness-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { READINESS_CATEGORY_LABEL } from "@/lib/implementation/implementation-types";
import { prisma } from "@/lib/prisma";
import { getProject } from "@/services/implementation/implementation-service";
import { getLatestReadiness } from "@/services/implementation/readiness-service";

const STATUS_BADGE: Record<string, string> = {
  PASS: "border bg-emerald-100 text-emerald-900 border-emerald-200",
  WARN: "border bg-amber-100 text-amber-900 border-amber-200",
  FAIL: "border bg-rose-100 text-rose-900 border-rose-200",
  NOT_CHECKED: "",
};

export default async function GoLivePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const readiness = await getLatestReadiness({ userId, projectId });
  const checks = await prisma.goLiveReadinessCheck.findMany({
    where: { projectId },
    orderBy: [{ required: "desc" }, { status: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Go-Live plan</h1>
          <p className="text-xs text-muted-foreground">
            Run the readiness engine before marking the project LIVE. The project must reach the
            Ready band; both blocked and needs-work states stop the transition.
          </p>
        </div>
        <ReadinessBadge snapshot={readiness} />
      </header>
      <ProjectSubnav projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Launch day plan</CardTitle>
          <CardDescription>Single owner, written rollback, monitoring checklist.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <div>
            <strong>Date:</strong>{" "}
            {project.targetGoLiveDate ? project.targetGoLiveDate.toLocaleDateString() : "Not set"}
          </div>
          <div>
            <strong>Owner:</strong> {project.assignedOwner ?? "Unassigned"}
          </div>
          <div>
            <strong>Support contacts:</strong> add via the project notes for now.
          </div>
          <div>
            <strong>Rollback plan:</strong> Implementation Center does not touch live data; rollback means
            pausing newly connected channels and reverting any optional configuration in their respective
            modules.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <span>Readiness checks</span>
            <RunReadinessButton projectId={projectId} />
            <MarkGoLiveButton projectId={projectId} />
          </CardTitle>
          <CardDescription>
            Pulled from real workspace data. LIVE requires a Ready snapshot, not merely a non-blocked one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No readiness data yet. Click &quot;Run readiness check&quot;.</p>
          ) : (
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.id} className="rounded-md border bg-card p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <p className="text-xs text-muted-foreground">
                        {READINESS_CATEGORY_LABEL[c.category as keyof typeof READINESS_CATEGORY_LABEL] ?? c.category}
                        {c.required ? " · required" : " · optional"}
                      </p>
                      {c.explanation ? <p className="mt-1 text-xs">{c.explanation}</p> : null}
                    </div>
                    <Badge className={STATUS_BADGE[c.status] ?? ""}>{c.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
