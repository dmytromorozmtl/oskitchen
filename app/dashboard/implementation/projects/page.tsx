import Link from "next/link";

import { ReadinessBadge } from "@/components/dashboard/implementation/readiness-badge";
import { Badge } from "@/components/ui/badge";
import type { ReadinessSnapshot } from "@/lib/implementation/implementation-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { IMPLEMENTATION_STATUS_LABEL } from "@/lib/implementation/implementation-status";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const { userId } = await requireTenantActor();
  const projects = await prisma.implementationProject.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Every implementation project in this workspace.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All projects</CardTitle>
          <CardDescription>{projects.length} total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/implementation/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card p-3 hover:bg-muted"
              >
                <div>
                  <div className="font-medium">{p.businessName}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.businessType ?? "type unset"} ·{" "}
                    {p.assignedOwner ?? "owner unassigned"} ·{" "}
                    {p.targetGoLiveDate ? `target ${p.targetGoLiveDate.toLocaleDateString()}` : "no go-live"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{IMPLEMENTATION_STATUS_LABEL[p.status]}</Badge>
                  <ReadinessBadge snapshot={p.readinessSnapshotJson as ReadinessSnapshot | null} />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
