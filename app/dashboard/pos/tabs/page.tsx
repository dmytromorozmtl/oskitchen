import React from "react";
import Link from "next/link";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { TabPanel } from "@/components/pos/tab-panel";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getOpenTabs } from "@/services/pos/tab-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const dynamic = "force-dynamic";

export default function PosTabsPage() {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <PosTabsPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function PosTabsPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  const tabs = await getOpenTabs(actor.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bar & table tabs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open tabs, quick-add items, close with tax and tip.{" "}
          <Link href="/dashboard/pos/table-service" className="font-medium text-primary hover:underline">
            Table service depth
          </Link>
        </p>
      </div>
      <TabPanel tabs={tabs} />
    </div>
  );
}
