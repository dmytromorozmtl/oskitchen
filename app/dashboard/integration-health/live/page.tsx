import Link from "next/link";

import { IntegrationHealthLivePanel } from "@/components/integrations/integration-health-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT } from "@/lib/integrations/integration-health-live-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadLiveIntegrationHealthDashboard } from "@/services/integrations/integration-health-live-service";

export const metadata = {
  title: "LIVE Integration Health — KitchenOS",
  description: `Health scores, trends, and alerts for all ${INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT} LIVE integrations.`,
};

export default async function IntegrationHealthLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await loadLiveIntegrationHealthDashboard(userId);

  return (
    <PageShell narrow className="space-y-8 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">LIVE Integration Health</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            Phase 1 fleet dashboard — {dashboard.monitoredCount} health scores with 7-day trends and
            predictive alerts.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integration-health">← Integration command center</Link>
        </Button>
      </div>

      <IntegrationHealthLivePanel dashboard={dashboard} />
    </PageShell>
  );
}
