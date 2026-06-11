import type { Metadata } from "next";

import { SlaMonitoringPanel } from "@/components/enterprise/sla-monitoring-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadEnterpriseSlaMonitoringDashboard } from "@/services/enterprise/sla-service";

export const metadata: Metadata = {
  title: "SLA Monitoring — Enterprise",
  description: "Enterprise uptime, response time, and alerting across platform and integration fleet.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseSlaMonitoringPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">SLA monitoring requires a workspace</CardTitle>
          <CardDescription>
            Configure your workspace to view uptime, response time, and SLA alerts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadEnterpriseSlaMonitoringDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <SlaMonitoringPanel dashboard={dashboard} />
    </div>
  );
}
