import Link from "next/link";

import { AnalyticsSuitePanel } from "@/components/analytics/analytics-suite-panel";
import { PageHeader } from "@/components/layout/page-header";
import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadAnalyticsSuiteSnapshot } from "@/services/analytics/analytics-suite-service";

export const metadata = {
  title: "Analytics Suite",
  description: "All restaurant metrics on one screen — revenue, orders, operations, catering, inventory, and forecast.",
};

export default async function AnalyticsSuitePage() {
  const { dataUserId } = await getTenantActor();
  const snapshot = await loadAnalyticsSuiteSnapshot(dataUserId);

  return (
    <PlanGate userId={dataUserId} feature="analytics" title="Analytics Suite">
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Analytics Suite"
          description="Unified command view across revenue, orders, customers, operations, catering, meal plans, inventory, and 90-day forecast."
          actions={
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/analytics">Executive overview</Link>
            </Button>
          }
        />
        <AnalyticsSuitePanel snapshot={snapshot} />
      </div>
    </PlanGate>
  );
}
