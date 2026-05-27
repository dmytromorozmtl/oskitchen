import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canExportReports } from "@/lib/reports/report-export-access";
import { canDoReports } from "@/lib/reports/report-permissions";
import { getReportRegistryForScope } from "@/services/reports/report-service";

export default async function FinancialReportsPage() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createReportActorScope(actor);
  if (!canDoReports(scope, "reports.read.financial")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view financial reports.
        </CardContent>
      </Card>
    );
  }
  const canExport = canExportReports(actor);
  const fin = getReportRegistryForScope(scope).filter((d) => d.financial);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financial &amp; margin reports</h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Revenue, margin, purchasing spend, retention, and catering/meal-plan financials. Restricted to
        owners, admins, and accountants.
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {fin.map((d) => (
          <Card key={d.key} className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{d.title}</CardTitle>
              <CardDescription>{d.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{d.description}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={d.generatorRoute}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Open
                </Link>
                {canExport && (
                  <Link
                    href={`/api/export/report?key=${d.key}`}
                    className="rounded-md border border-border px-3 py-1.5 text-xs"
                  >
                    Export CSV
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
