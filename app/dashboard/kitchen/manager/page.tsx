import type { Metadata } from "next";
import Link from "next/link";

import { ManagerViewClient } from "@/components/kitchen/manager-view-client";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { KDS_MANAGER_VIEW_ROUTE } from "@/lib/kitchen/kds-manager-view-policy";
import { loadKdsManagerView } from "@/services/kitchen/manager-view-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata: Metadata = {
  title: "KDS Manager View",
  description: "Kitchen manager dashboard — performance, delays, and line efficiency.",
};

export default function KdsManagerViewPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KdsManagerViewPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function KdsManagerViewPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const snapshot = await loadKdsManagerView(actor.userId);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manager view</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Kitchen performance, delay signals, and station efficiency for shift leads.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen">Back to KDS</Link>
        </Button>
      </div>

      <ManagerViewClient snapshot={snapshot} />

      <p className="sr-only">{KDS_MANAGER_VIEW_ROUTE}</p>
    </div>
  );
}
