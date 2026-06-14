import React from "react";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { POS_HARDWARE_CATEGORIES } from "@/lib/pos/pos-hardware";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export default function PosHardwareSettingsPage() {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <PosHardwareSettingsPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function PosHardwareSettingsPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.hardware.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">POS hardware</h1>
          <p className="text-sm text-muted-foreground">
            OS Kitchen stays browser-first. Pair Stripe Terminal readers (M2, WisePOS E, P400) in Settings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/works-with-os-kitchen">Works with OS Kitchen</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/settings/hardware">Stripe Terminal pairing</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {POS_HARDWARE_CATEGORIES.map((h) => (
          <Card key={h.id} className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base">{h.label}</CardTitle>
                <CardDescription>{h.detail}</CardDescription>
              </div>
              <Badge variant={h.status === "supported" ? "default" : "outline"}>{h.status}</Badge>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
