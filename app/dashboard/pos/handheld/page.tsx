import React from "react";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export default async function HandheldPOSPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  return (
    <div className="mx-auto max-w-md space-y-4 pb-20">
      <div className="text-center py-4">
        <h1 className="text-xl font-bold">Handheld POS</h1>
        <p className="text-sm text-muted-foreground">Take orders at the table</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-sm font-medium">Quick Products</p>
        <p className="mb-4 text-xs text-muted-foreground">
          Handheld POS loads the same products as the main POS terminal. Open this page on a tablet
          or phone to take orders tableside.
        </p>
        <div className="py-8 text-center text-muted-foreground">
          <p>Handheld mode reuses the POS Terminal interface.</p>
          <p className="mt-1 text-sm">
            <Link href="/dashboard/pos/terminal" className="text-primary hover:underline">
              Open POS Terminal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
