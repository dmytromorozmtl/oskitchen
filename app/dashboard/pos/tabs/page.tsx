import React from "react";
import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { TabPanel } from "@/components/pos/tab-panel";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getOpenTabs } from "@/services/pos/tab-service";

export const dynamic = "force-dynamic";

export default async function PosTabsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return (
      <PosAccessCard
        title="Bar & table tabs"
        description="You do not have permission to access POS tab workflows."
        primaryHref="/dashboard/pos"
        primaryLabel="Back to POS"
      />
    );
  }

  const tabs = await getOpenTabs(actor.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bar & table tabs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open tabs, quick-add items, and close with tax and tip.
        </p>
      </div>
      <TabPanel tabs={tabs} />
    </div>
  );
}
