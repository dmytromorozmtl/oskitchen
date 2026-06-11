import type { Metadata } from "next";

import { CorporateReportingPanel } from "@/components/enterprise/corporate-reporting-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCorporateReportingDashboard } from "@/services/enterprise/corporate-reporting-service";

export const metadata: Metadata = {
  title: "Corporate Reporting — Enterprise",
  description: "CEO P&L, revenue trends, and 90-day forecasts for leadership and board reporting.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseCorporateReportsPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Corporate reporting requires a workspace</CardTitle>
          <CardDescription>
            Configure your workspace to view CEO P&L, trends, and forecasts across your operation.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadCorporateReportingDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <CorporateReportingPanel dashboard={dashboard} />
    </div>
  );
}
