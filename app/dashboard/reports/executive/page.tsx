import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canDoReports } from "@/lib/reports/report-permissions";
import { getReportRegistryForScope } from "@/services/reports/report-service";

export default async function ExecutiveReportsPage() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createReportActorScope(actor);
  if (!canDoReports(scope, "reports.read.financial")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view executive reports.
        </CardContent>
      </Card>
    );
  }
  const exec = getReportRegistryForScope(scope).filter((d) => d.category === "Executive");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Executive reports</h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Owner-ready summaries with revenue, AOV, repeat rate, production / packing / delivery health and next
        recommendations.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {exec.map((d) => (
          <Card key={d.key} className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{d.title}</CardTitle>
              <CardDescription>{d.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <Link
                href={d.generatorRoute}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                Open
              </Link>
              <Link
                href={`/api/export/report?key=${d.key}`}
                className="rounded-md border border-border px-3 py-1.5 text-xs"
              >
                Export CSV
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
