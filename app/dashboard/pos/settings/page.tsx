import React from "react";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export default async function PosSettingsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.hardware.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS settings</h1>
        <p className="text-sm text-muted-foreground">
          Operational defaults will expand here; today tax, receipt footer, and routing defaults still live in
          workspace and kitchen settings JSON where applicable.
        </p>
      </div>
      <Card className="max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Offline mode v1.0</CardTitle>
          <CardDescription>Local cart, sync queue, conflict resolution, and audit log.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/pos/settings/offline">Open offline mode guide</Link>
          </Button>
        </CardContent>
      </Card>
      <Card className="max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Hardware readiness</CardTitle>
          <CardDescription>Honest posture on scanners, printers, and future adapters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/pos/settings/hardware">Open hardware checklist</Link>
          </Button>
        </CardContent>
      </Card>
      <Card className="max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Control Center</CardTitle>
          <CardDescription>Cross-link to structured settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/settings/pos">POS in Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
