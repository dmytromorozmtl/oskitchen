import Link from "next/link";

import { KdsDaisyChainConfigPanel } from "@/components/dashboard/kitchen/kds-daisy-chain-config-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { loadKdsDaisyChainConfigModel } from "@/services/kitchen/kds-daisy-chain-config-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export default function KdsDaisyChainConfigPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KdsDaisyChainConfigPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function KdsDaisyChainConfigPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.configure")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const model = await loadKdsDaisyChainConfigModel(actor.userId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kitchen · KDS
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">KDS daisy-chain config</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            NCR Aloha parity — configure bump handoff links between KDS screens. Routing rules assign
            the first station; daisy-chain defines the next screen after each bump (Prep → line → Expo).
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen/routing-rules">Routing rules</Link>
        </Button>
      </div>

      <KdsDaisyChainConfigPanel model={model} />
    </div>
  );
}
