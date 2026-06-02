import Link from "next/link";

import { CoPilotPanel } from "@/components/dashboard/ai/co-pilot-panel";
import { Button } from "@/components/ui/button";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { getRestaurantCoPilotDashboard } from "@/services/ai/co-pilot-service";

export const metadata = {
  title: "AI Restaurant Co-Pilot",
  description: "Procurement, scheduling, and pricing suggestions — owner approves every action.",
};

export default async function RestaurantCoPilotPage() {
  const { userId } = await getTenantActor();
  const { scope } = await loadCopilotPageActor();
  const dashboard = await getRestaurantCoPilotDashboard(userId);

  const canDraft = canUseCopilot(scope, "copilot.actions.draft");
  const canApprove = canUseCopilot(scope, "copilot.actions.approve");

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Restaurant Co-Pilot</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Scans purchasing gaps, labor coverage, and margin pressure. Every change becomes an
            approval draft — nothing runs until you approve and execute.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/copilot">← Operations Copilot</Link>
        </Button>
      </div>

      <CoPilotPanel dashboard={dashboard} canDraft={canDraft} canApprove={canApprove} />
    </div>
  );
}
