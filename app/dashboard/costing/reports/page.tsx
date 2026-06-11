import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function CostingReportsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Costing reports">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Deep exports and executive rollups hook into the same costing engine — see docs/COSTING_REPORTS.md.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Link href="/dashboard/reports" className="underline-offset-4 hover:underline">
                  Workspace reports
                </Link>
              </CardTitle>
              <CardDescription>CSV and operational summaries.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Link href="/dashboard/executive" className="underline-offset-4 hover:underline">
                  Executive dashboard
                </Link>
              </CardTitle>
              <CardDescription>High-level KPIs and risk callouts.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Link href="/dashboard/purchasing/price-history" className="underline-offset-4 hover:underline">
                  Supplier price history
                </Link>
              </CardTitle>
              <CardDescription>Feed ingredient cards and costing from verified receipts.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Link href="/dashboard/import-export" className="underline-offset-4 hover:underline">
                  Import / export
                </Link>
              </CardTitle>
              <CardDescription>Costing CSV presets (see docs).</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </PlanGate>
  );
}
