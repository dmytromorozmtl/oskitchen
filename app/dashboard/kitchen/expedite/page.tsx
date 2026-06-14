import Link from "next/link";

import { KdsExpediteScreen } from "@/components/kitchen/kds-expedite-screen";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { loadKdsExpediteScreenModel } from "@/services/kitchen/kds-expedite-screen-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export default function KdsExpediteScreenPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KdsExpediteScreenPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function KdsExpediteScreenPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const model = await loadKdsExpediteScreenModel(actor.userId);

  return (
    <div className="space-y-6 p-4 md:p-6 landscape:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kitchen · Expedite
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Expedite screen
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Rush-aware expedite board — hero ticket, priority queue, and rush banner optimized for
            tablet landscape and 44px touch targets. BETA — not rush-hour certified.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen/expo">Expo view</Link>
        </Button>
      </div>

      <KdsExpediteScreen model={model} />
    </div>
  );
}
