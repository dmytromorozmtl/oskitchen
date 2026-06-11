import Link from "next/link";

import { AutoOrderingPanel } from "@/components/inventory/auto-ordering-panel";
import { PlanGate } from "@/components/plans/plan-gate";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadAutoOrderingDashboard } from "@/services/inventory/auto-ordering-service";

export const metadata = {
  title: "Auto-ordering — Inventory",
  description: "AI inventory auto-ordering with weather, holiday, and trend signals.",
};

export const dynamic = "force-dynamic";

export default async function InventoryAutoOrderingPage() {
  const { userId, workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Auto-ordering requires a workspace</CardTitle>
          <CardDescription>
            <Link href="/dashboard/inventory/purchasing-ai" className="underline">
              Set up purchasing
            </Link>{" "}
            to enable signal-based auto-orders.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadAutoOrderingDashboard(workspaceId);

  return (
    <PlanGate userId={userId} feature="inventory" title="Advanced auto-ordering">
      <div className="mx-auto max-w-5xl pb-10">
        <AutoOrderingPanel dashboard={dashboard} />
      </div>
    </PlanGate>
  );
}
