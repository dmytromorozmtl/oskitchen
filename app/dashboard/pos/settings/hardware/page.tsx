import React from "react";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { POS_HARDWARE_CATEGORIES } from "@/lib/pos/pos-hardware";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PosHardwareSettingsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.hardware.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS hardware</h1>
        <p className="text-sm text-muted-foreground">
          OS Kitchen stays browser-first. Native drivers (Epson/Star, Stripe Terminal, cash-drawer kick) are explicitly
          marked until shipped.
        </p>
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
