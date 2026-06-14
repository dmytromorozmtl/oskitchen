import Link from "next/link";

import { NativeTabletUxPanel } from "@/components/pos/native-tablet-ux-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { NATIVE_TABLET_UX_P2_95_POLICY_ID, NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE } from "@/lib/pos/native-tablet-ux-p2-95-policy";
import { loadNativeTabletUxSnapshot } from "@/services/pos/native-tablet-ux-p2-95-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-95 — native tablet UX hub. */
export default function NativeTabletUxPage() {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <NativeTabletUxPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function NativeTabletUxPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  const snapshot = await loadNativeTabletUxSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Native tablet UX</h1>
          <p className="text-sm text-muted-foreground">
            iPad layouts & floor polish — policy {NATIVE_TABLET_UX_P2_95_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="min-h-11 rounded-full">
          <Link href={NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE}>Open tablet POS</Link>
        </Button>
      </div>
      <NativeTabletUxPanel snapshot={snapshot} />
    </div>
  );
}
