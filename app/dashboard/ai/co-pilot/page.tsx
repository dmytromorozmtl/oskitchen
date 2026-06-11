import Link from "next/link";

import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { CoPilotPanel } from "@/components/dashboard/ai/co-pilot-panel";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { getRestaurantCoPilotDashboard } from "@/services/ai/co-pilot-service";

export const metadata = {
  title: "AI Restaurant Co-Pilot",
  description: "Procurement, scheduling, and pricing suggestions — owner approves every action.",
};

export const dynamic = "force-dynamic";

export default async function RestaurantCoPilotPage() {
  const { userId } = await getTenantActor();
  const { scope } = await loadCopilotPageActor();
  const payload = await loadAiFeaturePage(() => getRestaurantCoPilotDashboard(userId));

  if (!payload.ok) {
    return <AiFeatureApiError featureName="AI Restaurant Co-Pilot" error={payload.error} />;
  }

  const dashboard = payload.data;
  const canDraft = canUseCopilot(scope, "copilot.actions.draft");
  const canApprove = canUseCopilot(scope, "copilot.actions.approve");

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <AiHonestyBanner moduleId="restaurant-co-pilot" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Restaurant Co-Pilot</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Scans purchasing gaps, labor coverage, and margin pressure. Every change becomes an
            approval draft — nothing runs until you approve and execute.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full" data-testid="co-pilot-autonomous-link">
            <Link href="/dashboard/ai/co-pilot/autonomous">Co-Pilot 2.0</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/copilot">← Operations Copilot</Link>
          </Button>
        </div>
      </div>

      <CoPilotPanel dashboard={dashboard} canDraft={canDraft} canApprove={canApprove} />
    </div>
  );
}
