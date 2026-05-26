import Link from "next/link";

import { canManageProductionIncidentsForUser } from "@/actions/production-incidents";
import { PlatformProductionIncidentPanel } from "@/components/platform/production-incident-panel";
import { PlatformProductionIncidentReportPanel } from "@/components/platform/production-incident-report-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import {
  listProductionIncidentAssignees,
} from "@/services/incidents/production-incident-rollup-service";
import { loadProductionIncidentExecutiveSnapshot } from "@/services/incidents/production-incident-reporting-service";
import { listPlatformIncidents } from "@/services/observability/incident-service";

export default async function PlatformIncidentsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const [incidents, incidentSnapshot, assignees, canManageIncidents] = await Promise.all([
    listPlatformIncidents(
      ctx.userId,
      ctx.isFounder || ctx.roles.includes("SUPER_ADMIN"),
    ),
    loadProductionIncidentExecutiveSnapshot(),
    listProductionIncidentAssignees(),
    canManageProductionIncidentsForUser({ id: ctx.userId, email: ctx.email }),
  ]);
  const { rollup: productionIncidentRollup, report: incidentReport } = incidentSnapshot;

  return (
    <div className="space-y-8 text-zinc-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Incidents</h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-400">
            Persistent production incident workflow is source-backed and operational. Manual incident
            declarations from audit metadata remain available below as a separate historical layer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Production incidents open</span>
          <Badge className="border-amber-700 bg-amber-900/40 text-amber-100">
            {productionIncidentRollup.summary.open}
          </Badge>
        </div>
      </div>

      <PlatformProductionIncidentPanel
        title="Production incident workflow"
        description={`Active production incidents are persisted, source-linked, and auto-reopen if the degraded source remains unhealthy. Critical: ${productionIncidentRollup.summary.critical} / high: ${productionIncidentRollup.summary.high}.`}
        incidents={productionIncidentRollup.items}
        assignees={assignees}
        canManage={canManageIncidents}
        emptyLabel="No active production incidents are currently open."
        ctaHref="/platform/health"
        ctaLabel="Back to platform health"
        showReviewForm
      />

      <PlatformProductionIncidentReportPanel
        title="Incident SLA and aging"
        description="Severity-based acknowledgement and resolution targets, aging buckets, and trailing MTTA / MTTR for production incidents."
        report={incidentReport}
        maxAttention={6}
      />

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">Manual incident audit records</CardTitle>
          <CardDescription className="text-zinc-500">
            Legacy declarations parsed from `platform.incident.*` audit metadata. Visibility is scoped:
            non-super-admins only see incidents they authored unless elevated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {incidents.length === 0 ? (
            <p className="text-zinc-500">No incident audit rows found.</p>
          ) : (
            incidents.map((i) => (
              <div key={i.id} className="rounded-lg border border-zinc-800 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-white">{i.title}</span>
                  <Badge variant="outline" className="border-zinc-600 text-zinc-200">
                    {i.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {i.createdAt.toISOString().slice(0, 19)}Z · {i.severity} ·{" "}
                  {i.affectedSystems.length ? i.affectedSystems.join(", ") : "—"}
                </p>
                {i.mitigation ? <p className="mt-2 text-xs text-zinc-400">{i.mitigation}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="border-zinc-700 text-zinc-100">
        <Link href="/platform/audit">Open audit</Link>
      </Button>
    </div>
  );
}
