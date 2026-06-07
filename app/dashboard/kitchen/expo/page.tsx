import type { Metadata } from "next";
import Link from "next/link";

import { ExpoViewClient } from "@/components/kitchen/expo-view-client";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { KDS_EXPO_VIEW_ROUTE } from "@/lib/kitchen/kds-expo-view-policy";
import { loadKdsExpoView } from "@/services/kitchen/expo-view-service";

export const metadata: Metadata = {
  title: "KDS Expo View",
  description: "Expo runner board — ready, waiting, and delayed tickets.",
};

export default async function KdsExpoViewPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const snapshot = await loadKdsExpoView(actor.userId);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expo view</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Runner board for ready pickup, tickets still on the line, and overdue delays.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm" className="rounded-full">
            <Link href="/dashboard/kitchen/expedite">Expedite screen</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/kitchen">Back to KDS</Link>
          </Button>
        </div>
      </div>

      <ExpoViewClient snapshot={snapshot} />

      <p className="sr-only">{KDS_EXPO_VIEW_ROUTE}</p>
    </div>
  );
}
